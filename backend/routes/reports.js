const express = require('express')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Report = require('../models/Report')
const router = express.Router()

function generateId() {
  return crypto.randomBytes(12).toString('hex')
}

function severityFromConfidence(conf) {
  if (conf >= 90) return { level: 'High', note: 'High confidence — recommend urgent specialist referral.' }
  if (conf >= 70) return { level: 'Moderate', note: 'Moderate confidence — recommend confirmatory testing and specialist review.' }
  if (conf >= 50) return { level: 'Low-Moderate', note: 'Low-moderate confidence — suggest repeat imaging or further tests.' }
  return { level: 'Low', note: 'Low confidence — inconclusive, recommend expert radiologist review.' }
}

// Enhanced LLM prompt for patient-friendly, structured output
async function callGroq(prompt, language = 'english') {
  console.log('🤖 Calling Groq API with language:', language)
  const apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions'
  const key = process.env.GROQ_API_KEY
  
  // Define language-specific fallback messages
  const fallbackMessages = {
    english: 'LLM skipped (no API key configured). Fallback patient-friendly recommendations:\n\nOverview: This is an AI-generated medical report based on your imaging results.\n\nExplanation: The main finding should be explained to you by your doctor in clear language. Ask for details until you feel confident you understand what it means.\n\nWhat to do next:\n- Schedule an appointment with a relevant medical specialist\n- Ask your doctor to explain all test results simply\n- Follow up promptly\n\nOutcomes: With timely care and support, many patients do well. Do not panic, but act quickly.',
    hindi: 'LLM छोड़ दिया गया (कोई API कुंजी कॉन्फ़िगर नहीं की गई)। फॉलबैक रोगी-अनुकूल सिफारिशें:\n\nअवलोकन: यह आपके इमेजिंग परिणामों के आधार पर एक AI-जनित चिकित्सा रिपोर्ट है।\n\nस्पष्टीकरण: मुख्य निष्कर्ष आपके डॉक्टर द्वारा स्पष्ट भाषा में समझाया जाना चाहिए। जब तक आप आत्मविश्वास महसूस न करें, तब तक विवरण के लिए पूछें।\n\nआगे क्या करें:\n- एक प्रासंगिक चिकित्सा विशेषज्ञ के साथ अपॉइंटमेंट शेड्यूल करें\n- अपने डॉक्टर से सभी परीक्षण परिणामों को सरलता से समझाने के लिए कहें\n- तुरंत फॉलो अप करें\n\nपरिणाम: समय पर देखभाल और समर्थन के साथ, कई रोगी अच्छा करते हैं। घबराएं नहीं, लेकिन जल्दी से कार्य करें।'
  }
  
  if (!key) {
    console.warn('GROQ_API_KEY not set — skipping LLM call and returning fallback text')
    return { 
      choices: [{ 
        message: { 
          content: fallbackMessages[language] || fallbackMessages.english
        } 
      }] 
    }
  }

  // Define language-specific system prompts
  const systemPrompts = {
    english: 
      'You are a clinical assistant writing for patients with no medical background. ' +
      'Clearly explain the findings in simple, everyday language (use analogies). ' +
      'Summarize what this means for health, avoiding jargon. ' +
      'Provide next steps in a step-by-step format. ' +
      'End with a brief, reassuring note. ' +
      'Organize output by sections: Overview, Explanation, Actions, Outcomes. ' +
      'Use friendly, empathetic tone, bullet points, and clear headlines.',
    hindi:
      'You are a medical assistant writing reports for Hindi-speaking patients in India. ' +
      'CRITICAL INSTRUCTION: You MUST write your ENTIRE response in Hindi language only. Every single word must be in Hindi (हिंदी) using Devanagari script (देवनागरी). ' +
      'DO NOT write even a single word in English. NO ENGLISH WORDS ALLOWED. ' +
      'Example of correct format:\n' +
      '**अवलोकन:** आपकी MRI रिपोर्ट में...\n' +
      '**स्पष्टीकरण:** यह स्थिति एक ऐसी बीमारी है जो...\n\n' +
      'Now write the medical report:\n' +
      '- Use simple, everyday Hindi language that patients can understand\n' +
      '- Explain medical conditions using analogies in Hindi\n' +
      '- Organize in sections: अवलोकन, स्पष्टीकरण, कार्यवाही, परिणाम\n' +
      '- Use bullet points and clear Hindi headings\n' +
      '- Be empathetic and reassuring in your tone\n' +
      '- Avoid complex medical jargon\n' +
      'महत्वपूर्ण: आपकी पूरी प्रतिक्रिया केवल हिंदी में होनी चाहिए। एक भी अंग्रेजी शब्द का उपयोग न करें।'
  }

  const body = {
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: systemPrompts[language] || systemPrompts.english
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: language === 'hindi' ? 1200 : 800,  // More tokens for Hindi to account for Devanagari
    temperature: 0.7
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error('Groq API error: ' + txt)
  }

  return res.json()
}

// Helper: Convert markdown-style **bold** to HTML <strong> tags
function parseBoldMarkdown(text) {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

// Helper: Format LLM text with proper HTML structure
function formatLlmContent(llmText) {
  return llmText
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const trimmed = line.trim()
      
      // Check for bullet points
      if (trimmed.match(/^[-*•]\s/)) {
        return `<li>${parseBoldMarkdown(trimmed.substring(2))}</li>`
      }
      // Check for numbered lists
      else if (trimmed.match(/^\d+\.\s/)) {
        return `<li>${parseBoldMarkdown(trimmed.replace(/^\d+\.\s/, ''))}</li>`
      }
      // Check for headings (lines with ###, ##, or all caps lines)
      else if (trimmed.startsWith('###')) {
        return `<h3>${parseBoldMarkdown(trimmed.replace(/^###\s*/, ''))}</h3>`
      }
      else if (trimmed.startsWith('##')) {
        return `<h2>${parseBoldMarkdown(trimmed.replace(/^##\s*/, ''))}</h2>`
      }
      // Check if line is ALL CAPS or starts with bold pattern (likely heading)
      else if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50) {
        return `<h3>${parseBoldMarkdown(trimmed)}</h3>`
      }
      // Regular paragraph
      else {
        return `<p>${parseBoldMarkdown(trimmed)}</p>`
      }
    })
    .join('')
}

// HTML template with improved sectioning, whitespace, and formatting
function renderHtmlReport({ prediction, llmText, severity, reportId, user, imageData, language = 'english' }) {
  const date = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
  const predicted = (prediction.predicted_class || prediction.label || 'Unknown').replace(/_/g, ' ')
  const conf = (Number(prediction.confidence) || 0).toFixed(2)
  
  // Get patient name from user object
  const patientName = user ? `${user.firstName} ${user.lastName}` : 'Not provided'
  
  // Format the LLM content with bold support
  const formattedLlmContent = formatLlmContent(llmText)
  
  // Define language-specific labels
  const labels = {
    english: {
      reportTitle: 'AI MRI Diagnostic Report',
      reportId: 'Report ID',
      patientName: 'Patient Name',
      generated: 'Generated',
      certaintyScore: 'Certainty Score',
      certaintySuffix: 'Certainty',
      uploadedScan: 'Uploaded MRI Scan',
      whatWasFound: 'What Was Found',
      predictedCondition: 'Predicted Condition',
      aiAnalysis: 'AI Analysis & Recommendations',
      disclaimer: 'Important Disclaimer',
      disclaimerText: 'This report is generated by an AI system for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for proper evaluation and guidance.',
      notProvided: 'Not provided'
    },
    hindi: {
      reportTitle: 'AI MRI निदान रिपोर्ट',
      reportId: 'रिपोर्ट आईडी',
      patientName: 'रोगी का नाम',
      generated: 'तैयार की गई',
      certaintyScore: 'निश्चितता स्कोर',
      certaintySuffix: 'निश्चितता',
      uploadedScan: 'अपलोड की गई MRI स्कैन',
      whatWasFound: 'जांच में क्या पाया गया',
      predictedCondition: 'संभावित निदान',
      aiAnalysis: 'AI विश्लेषण और सिफारिशें',
      disclaimer: 'महत्वपूर्ण अस्वीकरण',
      disclaimerText: 'यह रिपोर्ट केवल सूचनात्मक उद्देश्यों के लिए AI सिस्टम द्वारा तैयार की गई है। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। उचित मूल्यांकन और मार्गदर्शन के लिए हमेशा एक योग्य स्वास्थ्य सेवा प्रदाता से परामर्श करें।',
      notProvided: 'उपलब्ध नहीं'
    }
  }
  
  const l = labels[language] || labels.english

  return `<!doctype html>
    <html lang="${language === 'hindi' ? 'hi' : 'en'}">
      <head>
        <meta charset="utf-8" />
        <title>आरोग्यPath ${language === 'hindi' ? 'रिपोर्ट' : 'Report'} - ${reportId}</title>
        <style>
          @page { size: A4; margin: 25mm 20mm; }
          body { font-family: ${language === 'hindi' ? "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif" : "'Segoe UI', Arial, sans-serif"}; color: #ffffff; line-height: ${language === 'hindi' ? '1.9' : '1.7'}; margin: 0; padding: 20px; background: #000000; }
          header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 12px; border-bottom: 3px solid #06b6d4; background: #000000; }
          h1 { margin: 0; font-size: 23px; color: #06b6d4; font-weight: 700; }
          h2 { font-size: 18px; color: #06b6d4; margin: 25px 0 12px 0; padding-bottom: 5px; border-bottom: 2px solid #06b6d4; }
          h3 { font-size: 16px; color: #22d3ee; margin-top: 18px; margin-bottom: 10px; }
          .section { margin-top: 22px; page-break-inside: avoid; padding: 10px 0;}
          .muted { color: #94a3b8; font-size: 12px; }
          .confidence { font-weight: 700; color: #06b6d4; font-size: 18px; }
          footer { position: fixed; bottom: 15mm; left: 0; right: 0; text-align: center; color: #64748b; font-size: 10px; border-top: 1px solid #1e293b; padding-top: 10px; background: #000000; }
          .badge { display: inline-block; padding: 8px 12px; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #000000; border-radius: 8px; font-size: 14px; font-weight: 600;
            box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3); }
          .severity-badge { display: inline-block; padding: 4px 10px; background: #1e293b; color: #06b6d4; border-radius: 7px; font-size: 13px; font-weight: 600; margin-top: 5px; border: 1px solid #06b6d4; }
          .severity-high { background: #7f1d1d; color: #fca5a5; border-color: #dc2626; }
          .severity-moderate { background: #78350f; color: #fdba74; border-color: #f97316; }
          .severity-low { background: #14532d; color: #86efac; border-color: #22c55e; }
          .prediction-box { background: #0f172a; padding: 18px; border-radius: 10px; border-left: 4px solid #06b6d4; margin: 16px 0; box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2); }
          .disclaimer { background: #422006; border: 1px solid #f59e0b; padding: 13px; border-radius: 8px; margin-top: 23px; font-size: 12px; color: #fbbf24; }
          p { margin: 10px 0; color: #ffffff; }
          ul, ol { margin: 12px 0; padding-left: 27px; }
          li { margin: 8px 0; color: #ffffff; }
          strong { color: #06b6d4; }
          .logo-img { height: 50px; width: auto; }
          .scan-image-container { text-align: center; margin: 20px 0 30px 0; padding: 15px; background: #0f172a; border-radius: 10px; box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2); border: 1px solid #1e293b; }
          .scan-image { max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid #06b6d4; }
          .main-content { margin-bottom: 80px; }
        </style>
      </head>
      <body>
        <header>
          <div>
            <img src="data:image/jpeg;base64,${fs.readFileSync(path.join(__dirname, '../../public/logo.jpeg')).toString('base64')}" alt="आरोग्यPath Logo" class="logo-img" />
            <h1>${l.reportTitle}</h1>
            <div class="muted">${l.reportId}: ${reportId}</div>
            <div class="muted">${l.patientName}: ${patientName || l.notProvided}</div>
            <div class="muted">${l.generated}: ${date}</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">${l.certaintyScore}: ${conf}%</div>
            <div class="severity-badge severity-${severity.level.toLowerCase().replace('-', '')}">${severity.level} ${l.certaintySuffix}</div>
          </div>
        </header>
        ${imageData ? `
        <div class="scan-image-container">
          <h3 style="margin-top: 0; color: #4a5568;">${l.uploadedScan}</h3>
          <img src="${imageData}" alt="MRI Scan" class="scan-image" />
        </div>
        ` : ''}
        <div class="main-content">
          <div class="section">
            <h2>${l.whatWasFound}</h2>
            <div class="prediction-box">
              <p><strong>${l.predictedCondition}:</strong> <span class="confidence">${predicted}</span></p>
              <p><strong>${l.certaintyScore}:</strong> ${conf}%</p>
            </div>
          </div>
          <div class="section">
            <h2>${l.aiAnalysis}</h2>
            <!-- LLM-generated layman-friendly report sections inserted here -->
            ${formattedLlmContent}
          </div>
        </div>
        <div class="disclaimer">
          <strong>⚠️ ${l.disclaimer}:</strong> ${l.disclaimerText}
        </div>
        <footer>
          <p>©️ ${new Date().getFullYear()} आरोग्यPath - AI-Powered Healthcare Solutions</p>
          <p>This report is confidential and intended for your personal use. For audit logs and technical details, contact your system administrator.</p>
        </footer>
      </body>
    </html>`
}

router.post('/generate', async (req, res) => {
  try {
    console.log('📥 Report generation request received')
    console.log('👤 User:', req.user ? req.user.email : 'No user')
    
    const { prediction, mode = 'view', notes, imageData, language = 'english' } = req.body
    if (!prediction) {
      console.error('❌ No prediction provided')
      return res.status(400).json({ error: 'prediction required' })
    }

    // Log the language selection for debugging
    console.log('🌐 Report generation requested in language:', language)
    console.log('📊 Prediction:', prediction.predicted_class, 'Confidence:', prediction.confidence)

    const conf = Number(prediction.confidence || 0)
    const severity = severityFromConfidence(conf)
    
    // Define language-specific prompts
    const prompts = {
      english: `
Overview:
You recently had an MRI scan. The AI system found:\n- Possible diagnosis: ${prediction.predicted_class || prediction.label}
- Certainty Score: ${conf}%
- Severity: ${severity.level}

Explanation:
In very simple language, describe what this condition is.
- Use an analogy a layperson can understand.
- Avoid medical jargon—pretend you are explaining to a teenager or parent.

Actions:
What should the patient do next? Give clear, friendly steps.

Outcomes:
Provide a brief, reassuring note about prognosis, emphasizing timely care. Stress to always confirm with a specialist.

Notes:
${notes || ''}
`,
      hindi: `
⚠️ महत्वपूर्ण निर्देश: केवल हिंदी में जवाब दें। एक भी अंग्रेजी शब्द का उपयोग न करें।
⚠️ CRITICAL: Write ONLY in Hindi. NO English words at all.

कृपया निम्नलिखित चिकित्सा रिपोर्ट पूरी तरह से हिंदी में लिखें:

**रोगी की जानकारी:**
- MRI स्कैन का परिणाम मिला है
- निदान: ${prediction.predicted_class || prediction.label}  
- निश्चितता: ${conf}%
- गंभीरता: ${severity.level}

अब आपको इस जानकारी के आधार पर एक विस्तृत रिपोर्ट **केवल हिंदी में** लिखनी है। प्रत्येक अनुभाग हिंदी में होना चाहिए:

**अवलोकन** (हिंदी में लिखें):
- MRI परिणाम क्या दर्शाते हैं, इसे सरल हिंदी में समझाएं

**स्पष्टीकरण** (हिंदी में लिखें):  
- यह बीमारी क्या है, इसे आम बोलचाल की हिंदी भाषा में समझाएं
- एक उदाहरण या उपमा दें जो हर कोई समझ सके
- जटिल चिकित्सा शब्दों का उपयोग न करें

**कार्यवाही** (हिंदी में लिखें):
- मरीज को क्या करना चाहिए, कदम-दर-कदम हिंदी में बताएं
- किस डॉक्टर से मिलना है
- कौन से परीक्षण कराने हैं

**परिणाम** (हिंदी में लिखें):
- इलाज के बाद क्या हो सकता है
- मरीज को आश्वस्त करने वाला संदेश हिंदी में दें

${notes ? `अतिरिक्त टिप्पणी: ${notes}` : ''}

🔴 अनिवार्य: आपकी पूरी प्रतिक्रिया देवनागरी लिपि में हिंदी भाषा में होनी चाहिए। कोई अंग्रेजी नहीं।
🔴 MANDATORY: Your complete response must be in Hindi Devanagari script. Zero English words.
`
    }
    
    const prompt = prompts[language] || prompts.english

    const fallbackTexts = {
      english: 'LLM fallback: Patient-friendly recommendations unavailable. Consult your doctor for explanations and next steps in clear language.',
      hindi: 'LLM फॉलबैक: रोगी-अनुकूल सिफारिशें उपलब्ध नहीं हैं। स्पष्ट भाषा में स्पष्टीकरण और अगले कदमों के लिए अपने डॉक्टर से परामर्श करें।'
    }
    
    let llmText = fallbackTexts[language] || fallbackTexts.english

    try {
      const groqResp = await callGroq(prompt, language)
      llmText = groqResp?.choices?.[0]?.message?.content || llmText
      
      // Log the response to verify language
      console.log(`📄 Groq response received (${language}):`, llmText.substring(0, 200) + '...')
    } catch (err) {
      console.warn('Groq call failed, using fallback text', err.message)
    }

    const report = await Report.create({
      userId: req.user ? req.user._id : null,
      prediction,
      confidence: conf,
      llmContent: { raw: llmText },
      status: 'pending'
    })

    const reportId = report._id.toString()
    const html = renderHtmlReport({ 
      prediction, 
      llmText, 
      severity, 
      reportId, 
      user: req.user,
      imageData: imageData || null,
      language: language 
    })

    // Ensure uploads dir exists
    const outDir = path.join(__dirname, '..', 'uploads', 'reports')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

    const pdfPath = path.join(outDir, `${reportId}.pdf`)

    // Save HTML to file for now (PDF generation disabled due to Puppeteer issues)
    const htmlPath = path.join(outDir, `${reportId}.html`)
    fs.writeFileSync(htmlPath, html)
    
    // For now, just save the HTML report
    console.log('✅ Report HTML saved:', htmlPath)

    report.pdfPath = `/uploads/reports/${reportId}.html`
    report.status = 'ready'
    await report.save()

    const baseUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 3000}`
    const viewUrl = `${baseUrl}/reports/view/${reportId}`
    const downloadUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`}${report.pdfPath}`

    console.log('✅ Report generated successfully')
    return res.json({ reportId, viewUrl, downloadUrl })
  } catch (err) {
    console.error('Report generation error:', err)
    return res.status(500).json({ error: 'report generation failed', details: err.message })
  }
})

// GET /api/reports/:id - fetch report metadata
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean()
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json(report)
  } catch (err) {
    console.error('Fetch report error:', err)
    res.status(500).json({ error: 'Failed to fetch report' })
  }
})

module.exports = router
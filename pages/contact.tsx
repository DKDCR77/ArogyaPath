import { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <>
      <Head>
        <title>Contact Us - आरोग्यPath</title>
        <meta name="description" content="Get in touch with आरोग्यPath team. We're here to help you with AI-powered MRI diagnosis and hospital information." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-cyan-400">
                Get in Touch
              </h1>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Have questions about our AI diagnosis service or need help finding hospitals? 
                We're here to assist you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-cyan-400">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <p className="text-gray-300">dkdcr7@gmail.com</p>
                      <p className="text-gray-300">info@arogyapath.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Phone</h3>
                      <p className="text-gray-300">+91 8595018808</p>
                      <p className="text-gray-300">+91 9996310896 (Support)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <MapPin className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Address</h3>
                      <p className="text-gray-300">
                        MediFinder Healthcare Solutions<br />
                        Vellore Institute Of Technology, Amravati<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-cyan-500/30">
                  <h3 className="text-xl font-bold mb-4 text-cyan-400">Office Hours</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-semibold text-white">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                    <p><span className="font-semibold text-white">Saturday:</span> 10:00 AM - 4:00 PM</p>
                    <p><span className="font-semibold text-white">Sunday:</span> Closed</p>
                  </div>
                  <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <p className="text-sm text-cyan-300">
                      <strong className="text-cyan-400">Emergency Support:</strong> Our AI diagnosis service is available 24/7 for urgent medical consultations.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-cyan-500/30">
                  <h2 className="text-3xl font-bold mb-6 text-cyan-400">Send us a Message</h2>
                  
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 border border-green-500/30">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                      <p className="text-gray-300">We'll get back to you within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-900/90 text-white placeholder-gray-400"
                          placeholder="Asmaan Singh"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-900/90 text-white placeholder-gray-400"
                          placeholder="asmaan@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-white mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-900/90 text-white placeholder-gray-400"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg border border-cyan-500/30 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none bg-gray-900/90 text-white placeholder-gray-400"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-8 py-4 rounded-lg font-semibold text-lg shadow-lg shadow-cyan-500/50 hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-cyan-400">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-white">
                Quick answers to common questions
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  question: "How accurate is the AI MRI diagnosis?",
                  answer: "Our DenseNet201 model has been trained on thousands of brain MRI scans and achieves 99.98% accuracy in detecting abnormalities."
                },
                {
                  question: "Is my medical data secure?",
                  answer: "Yes! We use end-to-end encryption and JWT authentication to ensure your medical data is completely secure and private."
                },
                {
                  question: "How long does it take to get results?",
                  answer: "AI analysis is instant! You'll receive your results in seconds after uploading your MRI scan."
                },
                {
                  question: "Can I get reports in Hindi?",
                  answer: "Absolutely! We support both English and Hindi for all our medical reports and explanations."
                },
                {
                  question: "Do you charge for the service?",
                  answer: "Basic AI diagnosis is free. Premium features and detailed consultations may have associated costs."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-cyan-500/30"
                >
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

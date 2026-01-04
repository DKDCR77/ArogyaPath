import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Forward the request to our backend server
    const backendResponse = await fetch('http://localhost:3001/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await backendResponse.json()

    if (backendResponse.ok) {
      res.status(201).json(data)
    } else {
      res.status(backendResponse.status).json(data)
    }
  } catch (error) {
    console.error('Error forwarding feedback to backend:', error)
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: 'Backend service unavailable'
    })
  }
}
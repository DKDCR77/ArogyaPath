import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Navbar from '@/components/Navbar'

export default function ReportViewer() {
  const router = useRouter()
  const { id } = router.query
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchReport = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/reports/${id}`, {
          headers
        })
        if (!resp.ok) throw new Error('Report not found')
        const data = await resp.json()
        setPdfUrl(data.pdfPath ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${data.pdfPath}` : null)
      } catch (err) {
        console.error('Failed to load report:', err)
        setPdfUrl(null)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>आरोग्यPath - View Report</title>
      </Head>

      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center p-12">Loading report...</div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-[80vh] border" />
        ) : (
          <div className="text-center p-12 text-red-600">Report not available.</div>
        )}
      </main>
    </div>
  )
}

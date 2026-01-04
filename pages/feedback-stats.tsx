import { useState, useEffect } from 'react'
import Head from 'next/head'
import { StarIcon } from '@heroicons/react/24/solid'
import { ChatBubbleLeftEllipsisIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface FeedbackStats {
  overall: {
    totalFeedback: number
    averageRating: number
    ratingDistribution: Record<string, number>
  }
  byCategory: Array<{
    category: string
    count: number
    averageRating: number
  }>
}

export default function FeedbackStats() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/feedback/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
        } else {
          throw new Error('Failed to fetch stats')
        }
      } catch (err) {
        setError('Failed to load feedback statistics')
        console.error('Error fetching feedback stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Feedback Statistics - आरोग्यPath</title>
        <meta name="description" content="View feedback statistics for आरोग्यPath" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Feedback Statistics</h1>
            </div>
            <p className="mt-2 text-gray-600">Overview of user feedback for आरोग्यPath</p>
          </div>

          {stats && (
            <div className="space-y-8">
              {/* Overall Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Overall Statistics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.overall.totalFeedback}</div>
                    <div className="text-gray-600">Total Feedback</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {renderStars(Math.round(stats.overall.averageRating))}
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{stats.overall.averageRating.toFixed(1)}</div>
                    <div className="text-gray-600">Average Rating</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.overall.totalFeedback > 0 
                        ? Math.round((stats.overall.ratingDistribution['4'] + stats.overall.ratingDistribution['5']) / stats.overall.totalFeedback * 100)
                        : 0}%
                    </div>
                    <div className="text-gray-600">Positive (4-5 stars)</div>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.overall.ratingDistribution[rating.toString()] || 0
                    const percentage = stats.overall.totalFeedback > 0 ? (count / stats.overall.totalFeedback * 100) : 0
                    
                    return (
                      <div key={rating} className="flex items-center">
                        <div className="flex items-center w-20">
                          <span className="text-sm font-medium text-gray-700 mr-2">{rating}</span>
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium text-gray-700">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Category Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by Category</h3>
                {stats.byCategory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.byCategory.map((category) => (
                      <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-lg font-bold text-gray-900 capitalize">
                          {category.category.replace('-', ' ')}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            {renderStars(Math.round(category.averageRating))}
                            <span className="ml-2 text-sm text-gray-600">
                              {category.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-blue-600">
                            {category.count} feedback{category.count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No category data available</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
import React, { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    category: 'general',
    message: '',
    suggestions: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }),
      })

      if (response.ok) {
        setSubmitMessage('Thank you for your feedback! We appreciate your input.')
        setFormData({
          name: '',
          email: '',
          rating: 0,
          category: 'general',
          message: '',
          suggestions: ''
        })
        setTimeout(() => {
          onClose()
          setSubmitMessage('')
        }, 2000)
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      setSubmitMessage('Sorry, there was an error submitting your feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Share Your Feedback</h2>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="mt-2 opacity-90">Help us improve आरोग्यPath with your valuable feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white placeholder-gray-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white placeholder-gray-400"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="p-1 transition-colors"
                >
                  {star <= formData.rating ? (
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="w-8 h-8 text-gray-500 hover:text-yellow-400" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-300">
                {formData.rating > 0 && `${formData.rating} star${formData.rating !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Feedback Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white"
            >
              <option value="general">General Feedback</option>
              <option value="hospital-finder">Hospital Finder</option>
              <option value="ai-assistant">AI Medical Assistant</option>
              <option value="user-interface">User Interface</option>
              <option value="performance">Performance</option>
              <option value="bug-report">Bug Report</option>
              <option value="feature-request">Feature Request</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Feedback *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white placeholder-gray-400"
              placeholder="Please share your experience, thoughts, or any issues you encountered..."
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Suggestions for Improvement
            </label>
            <textarea
              name="suggestions"
              value={formData.suggestions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-900/90 text-white placeholder-gray-400"
              placeholder="Any suggestions to make आरोग्यPath better?"
            />
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`p-4 rounded-lg ${
              submitMessage.includes('Thank you') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {submitMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-cyan-500/30 text-gray-300 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0 || !formData.message.trim()}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black rounded-lg hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm
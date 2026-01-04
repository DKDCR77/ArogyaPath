const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define Feedback schema
const feedbackSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  email: { type: String, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  category: { type: String, default: 'general' },
  message: { type: String, required: true },
  suggestions: { type: String, default: null },
  timestamp: { type: String, default: () => new Date().toISOString() },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'new' }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// POST /api/feedback - Submit new feedback
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      rating,
      category,
      message,
      suggestions,
      timestamp,
      userAgent
    } = req.body;

    // Validate required fields
    if (!rating || !message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Rating and message are required fields' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Create feedback document
    const feedbackDoc = new Feedback({
      name: name || 'Anonymous',
      email: email || null,
      rating: parseInt(rating),
      category: category || 'general',
      message: message.trim(),
      suggestions: suggestions ? suggestions.trim() : null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      status: 'new'
    });

    // Save feedback to database
    const savedFeedback = await feedbackDoc.save();

    // Log successful feedback submission
    console.log(`New feedback received - ID: ${savedFeedback._id}, Rating: ${rating}, Category: ${category}`);
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: savedFeedback._id
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
});

// GET /api/feedback/stats - Get feedback statistics (for future admin use)
router.get('/stats', async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          ratings: { $push: '$rating' }
        }
      }
    ]);

    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          averageRating: { $round: ['$averageRating', 2] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Count ratings distribution
    const ratings = ratingStats[0]?.ratings || [];
    const ratingDistribution = {
      '5': ratings.filter(r => r === 5).length,
      '4': ratings.filter(r => r === 4).length,
      '3': ratings.filter(r => r === 3).length,
      '2': ratings.filter(r => r === 2).length,
      '1': ratings.filter(r => r === 1).length
    };

    res.json({
      success: true,
      data: {
        overall: {
          totalFeedback,
          averageRating: ratingStats[0]?.averageRating ? Math.round(ratingStats[0].averageRating * 100) / 100 : 0,
          ratingDistribution
        },
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback statistics',
      details: error.message
    });
  }
});

module.exports = router;
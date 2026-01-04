const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  prediction: { type: Object, required: true },
  confidence: { type: Number, required: true },
  llmContent: { type: Object },
  pdfPath: { type: String },
  storage: { type: String, enum: ['local','s3'], default: 'local' },
  status: { type: String, enum: ['pending','ready','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Report', ReportSchema)

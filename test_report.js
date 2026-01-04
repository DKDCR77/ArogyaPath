const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Create a test token
const token = jwt.sign(
  { userId: '507f1f77bcf86cd799439011' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

console.log('Test token:', token);

// Test the API
fetch('http://localhost:3001/api/reports/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prediction: {
      predicted_class: 'meningioma_tumor',
      confidence: 85.5,
      top_predictions: { meningioma_tumor: 85.5 },
      is_mri: true
    },
    mode: 'view',
    language: 'english'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Success:', data);
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

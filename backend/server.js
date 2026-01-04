const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const Hospital = require('./models/Hospital');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const feedbackRoutes = require('./routes/feedback');
const reportsRoutes = require('./routes/reports');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medifinder';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize database and load CSV data
async function initializeDatabase() {
  try {
    // Check if data already exists
    const count = await Hospital.countDocuments();

    if (count === 0) {
      console.log('Loading hospital data from CSV...');
      await loadHospitalData();
    } else {
      console.log(`✅ Database already contains ${count} hospitals`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Load hospital data from CSV
async function loadHospitalData() {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.join(__dirname, 'data', 'PMJAY-Hospital-List.csv');
    const hospitals = [];
    
    if (!fs.existsSync(csvFilePath)) {
      console.log('CSV file not found, creating sample data...');
      createSampleData().then(resolve).catch(reject);
      return;
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Clean and map CSV data to our schema
        const district = (row['District'] || '').trim();
        const state = (row['State'] || row.state || '').trim();
        const address = district && state ? `${district}, ${state}` : (district || state || '');
        
        const hospital = {
          name: (row['Hospital Name'] || row.name || '').trim(),
          address: address,
          city: district,
          district: district,
          state: state,
          pincode: (row['Pincode'] || row.pincode || '').trim(),
          phone: (row['Nodal Person Contact No'] || row['Phone'] || row.phone || '').trim(),
          specialty: (row['Empanled Specialities'] || row['Specialty'] || row.specialty || 'General').trim(),
          pmjay_empaneled: true, // Since this is PMJAY data
          latitude: parseFloat(row['Latitude']) || null,
          longitude: parseFloat(row['Longitude']) || null
        };
        
        // Only add if we have a name
        if (hospital.name.trim()) {
          hospitals.push(hospital);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Inserting ${hospitals.length} hospitals into database...`);
          await Hospital.insertMany(hospitals, { ordered: false });
          console.log('✅ Hospital data loaded successfully');
          resolve();
        } catch (error) {
          console.error('Error inserting hospital data:', error);
          resolve(); // Don't reject, just continue
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        resolve();
      });
  });
}

// Create sample data if CSV is not available
async function createSampleData() {
  const sampleHospitals = [
    {
      name: 'All Institute of Medical Sciences',
      address: 'Ansari Nagar, Aruna Asaf Ali Marg',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110029',
      phone: '011-26588500',
      specialty: 'Multi-specialty',
      pmjay_empaneled: true,
      latitude: 28.5562,
      longitude: 77.2094
    },
    {
      name: 'Apollo Hospitals',
      address: 'Sarita Vihar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110076',
      phone: '011-26925858',
      specialty: 'Multi-specialty',
      pmjay_empaneled: true,
      latitude: 28.5355,
      longitude: 77.2823
    },
    {
      name: 'Fortis Healthcare',
      address: 'Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      phone: '0120-3988888',
      specialty: 'Multi-specialty',
      pmjay_empaneled: true,
      latitude: 28.6139,
      longitude: 77.3910
    }
  ];

  try {
    await Hospital.insertMany(sampleHospitals);
    console.log(`✅ Created ${sampleHospitals.length} sample hospitals`);
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Middleware for JWT authentication
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// API Routes

// Use feedback routes
app.use('/api/feedback', feedbackRoutes);
// Use reports routes (with authentication middleware)
app.use('/api/reports', authenticateToken, reportsRoutes);

// Serve uploads statically (PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Hospital search endpoint
app.get('/api/hospitals/search', async (req, res) => {
  try {
    const { 
      query: searchQuery, 
      state, 
      district, 
      ayushman = 'all',
      type = 'all',
      lat,
      lng,
      radius = 50,
      limit = 20,
      page = 1
    } = req.query;

    // Build search criteria
    let searchCriteria = {};
    
    // Text search
    if (searchQuery) {
      searchCriteria.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { city: { $regex: searchQuery, $options: 'i' } },
        { address: { $regex: searchQuery, $options: 'i' } },
        { state: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // State filter
    if (state && state !== 'all') {
      searchCriteria.state = new RegExp(state, 'i');
    }
    
    // District filter
    if (district && district !== 'all') {
      searchCriteria.district = new RegExp(district, 'i');
    }
    
    // Ayushman Bharat filter
    if (ayushman === 'yes') {
      searchCriteria.pmjay_empaneled = true;
    } else if (ayushman === 'no') {
      searchCriteria.pmjay_empaneled = false;
    }

    // Hospital type filter (Government/Private)
    if (type && type !== 'all') {
      searchCriteria.type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search
    let hospitals = await Hospital.find(searchCriteria)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // If location provided, calculate distances and filter by radius
    if (lat && lng && hospitals.length > 0) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius) || 50; // Default 50km
      
      hospitals = hospitals.map(hospital => {
        // Add simplified distance calculation
        if (hospital.latitude && hospital.longitude) {
          const distance = calculateDistance(userLat, userLng, hospital.latitude, hospital.longitude);
          return { ...hospital, distance: Math.round(distance * 10) / 10 };
        }
        return { ...hospital, distance: null };
      })
      .filter(hospital => hospital.distance !== null && hospital.distance <= maxRadius) // Filter by radius
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    // Get total count for pagination (after radius filtering)
    const total = hospitals.length;
    
    res.json({
      hospitals,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_results: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Hospital search error:', error);
    res.status(500).json({ error: 'Failed to search hospitals' });
  }
});

// Get all hospitals
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).limit(100);
    res.json(hospitals);
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique states for filter dropdown
app.get('/api/hospitals/states', async (req, res) => {
  try {
    // Use aggregation to get distinct states
    const states = await Hospital.aggregate([
      { $group: { _id: '$state' } },
      { $match: { _id: { $ne: null, $ne: '' } } },
      { $sort: { _id: 1 } }
    ]);
    
    const stateList = states.map(item => item._id);
    res.json(stateList);
  } catch (error) {
    console.error('States fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get districts by state for filter dropdown
app.get('/api/hospitals/districts/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await Hospital.distinct('district', { 
      state: new RegExp(state, 'i') 
    });
    res.json(districts.filter(district => district).sort());
  } catch (error) {
    console.error('Districts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// Get Ayushman Bharat supported hospitals
app.get('/api/hospitals/ayushman', async (req, res) => {
  try {
    const { lat, lng, radius = 50, limit = 50 } = req.query;
    
    let searchCriteria = { 
      ayushman_bharat_support: 'Yes'
    };

    let hospitals = await Hospital.find(searchCriteria)
      .limit(parseInt(limit))
      .lean();

    // If location provided, add distance calculation (simplified)
    if (lat && lng && hospitals.length > 0) {
      // For now, return first batch of Ayushman hospitals
      // In production, you'd implement proper geospatial queries
      hospitals = hospitals.slice(0, parseInt(limit));
    }

    res.json({ hospitals });
  } catch (error) {
    console.error('Ayushman hospitals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Ayushman Bharat hospitals' });
  }
});

// Get hospital by ID
app.get('/api/hospitals/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      hospitals: hospitalCount,
      users: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Admin endpoint to reload hospital data (use with caution)
app.post('/api/admin/reload-hospitals', async (req, res) => {
  try {
    console.log('🔄 Reloading hospital data...');
    
    // Delete all existing hospitals
    await Hospital.deleteMany({});
    console.log('✅ Cleared existing hospital data');
    
    // Reload from CSV
    await loadHospitalData();
    
    const count = await Hospital.countDocuments();
    console.log(`✅ Reloaded ${count} hospitals`);
    
    res.json({ 
      success: true, 
      message: `Successfully reloaded ${count} hospitals`,
      count: count
    });
  } catch (error) {
    console.error('Error reloading hospitals:', error);
    res.status(500).json({ error: 'Failed to reload hospital data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

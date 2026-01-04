const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Hospital = require('./models/Hospital');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medifinder';

// Function to determine if hospital is Government or Private based on name
function determineHospitalType(hospitalName) {
  const name = hospitalName.toUpperCase();
  
  // Government hospital indicators
  const govKeywords = [
    'GOVT', 'GOVERNMENT', 'GOV.', 'GOV ',
    'CIVIL HOSPITAL', 'DISTRICT HOSPITAL', 'SDH',
    'PRIMARY HEALTH', 'PHC', 'CHC', 'COMMUNITY HEALTH',
    'AIIMS', 'GMC', 'MEDICAL COLLEGE',
    'REFERRAL HOSPITAL', 'REGIONAL HOSPITAL',
    'ESI HOSPITAL', 'RAILWAY HOSPITAL',
    'STATE HOSPITAL', 'CENTRAL HOSPITAL',
    'MUNICIPAL HOSPITAL', 'CORPORATION HOSPITAL',
    'JANANA HOSPITAL', 'MATERNITY HOSPITAL',
    'PT JLNGMC', 'DR RPGMC', 'IGMC', 'PGI',
    'SUB DISTRICT HOSPITAL', 'TALUKA HOSPITAL',
    'BLOCK PHC', 'ASHA', 'ANGANWADI'
  ];
  
  // Private hospital indicators
  const privateKeywords = [
    'PVT', 'PRIVATE', 'LTD', 'LIMITED',
    'APOLLO', 'FORTIS', 'MAX', 'MEDANTA',
    'MANIPAL', 'NARAYANA', 'CLOUDNINE',
    'CLINIC', 'NURSING HOME', 'POLYCLINIC',
    'HOSPITAL & RESEARCH', 'MULTISPECIALITY',
    'DENTAL CLINIC', 'EYE HOSPITAL'
  ];
  
  // Check for government keywords
  for (const keyword of govKeywords) {
    if (name.includes(keyword)) {
      return 'Government';
    }
  }
  
  // Check for private keywords
  for (const keyword of privateKeywords) {
    if (name.includes(keyword)) {
      return 'Private';
    }
  }
  
  // Default to Unknown if can't determine
  return 'Unknown';
}

async function reloadHospitals() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing hospitals
    const deleteResult = await Hospital.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing hospitals`);

    // Load from CSV with coordinates
    const csvFilePath = path.join(__dirname, 'data', 'PMJAY-Hospital-List-with-coordinates.csv');
    const hospitals = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const district = (row['District'] || '').trim();
          const state = (row['State'] || '').trim();
          const specialty = (row['Empanled Specialities'] || '').trim();
          const hospitalName = (row['Hospital Name'] || '').trim();
          
          const hospital = {
            name: hospitalName,
            address: district && state ? `${district}, ${state}` : (district || state || ''),
            city: district, // Using district as city since CSV doesn't have separate city
            district: district,
            state: state,
            pincode: (row['Pincode'] || '').trim(),
            phone: (row['Nodal Person Contact No'] || '').trim(),
            specialty: specialty || 'General',
            type: determineHospitalType(hospitalName),
            pmjay_empaneled: true,
            latitude: parseFloat(row['Latitude']) || null,
            longitude: parseFloat(row['Longitude']) || null
          };

          if (hospital.name && hospital.state) {
            hospitals.push(hospital);
          }
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    console.log(`📊 Loaded ${hospitals.length} hospitals from CSV`);
    
    // Insert in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < hospitals.length; i += batchSize) {
      const batch = hospitals.slice(i, i + batchSize);
      await Hospital.insertMany(batch, { ordered: false });
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} hospitals)`);
    }

    console.ltatistics
    const govCount = await Hospital.countDocuments({ type: 'Government' });
    const privateCount = await Hospital.countDocuments({ type: 'Private' });
    const unknownCount = await Hospital.countDocuments({ type: 'Unknown' });
    
    console.log('\n📊 Hospital Type Statistics:');
    console.log(`   Government: ${govCount}`);
    console.log(`   Private: ${privateCount}`);
    console.log(`   Unknown: ${unknownCount}`);
    
    // Show sog('✅ All hospitals reloaded successfully!');
    
    // Show sample
    const sample = await Hospital.findOne({ state: 'HIMACHAL PRADESH' });
    console.log('\n📋 Sample hospital:');
    console.log(JSON.stringify(sample, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reloadHospitals();

import mongoose from 'mongoose';
import Doctor from './model/doctorModel.js';

const mongoURI = "mongodb+srv://admin:tpItdFODG5vta5DH@cluster0.pqna85x.mongodb.net/ayumanthra";

// Sample doctors data
const sampleDoctors = [
  {
    doctorId: 'DOC001',
    name: 'Chaminda Perera',
    specialization: 'General Ayurveda',
    email: 'chaminda.perera@ayumanthra.com',
    phone: '+94771234567',
    consultationFee: 3000,
    supportedAppointmentModes: ['digital'] // Only digital mode
  },
  {
    doctorId: 'DOC002',
    name: 'Nimalee Fernando',
    specialization: 'Panchakarma Specialist',
    email: 'nimalee.fernando@ayumanthra.com',
    phone: '+94772345678',
    consultationFee: 4500
  },
  {
    doctorId: 'DOC003',
    name: 'Kasun Wijeratne',
    specialization: 'Ayurvedic Dermatology',
    email: 'kasun.wijeratne@ayumanthra.com',
    phone: '+94773456789',
    consultationFee: 3500
  },
  {
    doctorId: 'DOC004',
    name: 'Sunitha Rajapaksa',
    specialization: 'Ayurvedic Gynecology',
    email: 'sunitha.rajapaksa@ayumanthra.com',
    phone: '+94774567890',
    consultationFee: 4000
  },
  {
    doctorId: 'DOC005',
    name: 'Prasad Mendis',
    specialization: 'Kayachikitsa (Internal Medicine)',
    email: 'prasad.mendis@ayumanthra.com',
    phone: '+94775678901',
    consultationFee: 5000
  }
];

async function seedDoctors() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert sample doctors
    await Doctor.insertMany(sampleDoctors);
    console.log('Sample doctors inserted successfully');

    console.log('\nSample doctors added:');
    sampleDoctors.forEach(doctor => {
      console.log(`- Dr. ${doctor.name} (${doctor.specialization}) - ID: ${doctor.doctorId} - Modes: ${doctor.supportedAppointmentModes || ['digital', 'physical']}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
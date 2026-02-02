const mongoose = require('mongoose');
const Admin = require('../Model/Admin');

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://customer:FPBt4wOtSiD6wutd@cluster0.amywqi8.mongodb.net/ayumanthra?retryWrites=true&w=majority";

async function createDefaultAdmin() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminEmail: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Default admin already exists:', existingAdmin.adminEmail);
      return;
    }

    // Create default admin
    const defaultAdmin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      adminEmail: 'admin@gmail.com',
      adminPassword: 'admin123',
      adminPhone: '1234567890',
      nic: '123456789V',
      role: 'admin'
    });

    await defaultAdmin.save();
    console.log('Default admin created successfully:', defaultAdmin.adminEmail);
    
  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createDefaultAdmin();


import axios from 'axios';
import mongoose from 'mongoose';
import Appointment from './model/appointmentModel.js';
import Doctor from './model/doctorModel.js';

const mongoURI = "mongodb+srv://admin:tpItdFODG5vta5DH@cluster0.pqna85x.mongodb.net/ayumanthra";

async function updateAppointmentsDoctor() {
  try {
    console.log('=== UPDATING APPOINTMENTS DOCTOR ASSOCIATION ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Get Dr. Chaminda Perera's information
    const drChaminda = await Doctor.findOne({ doctorId: 'DOC001' });
    if (!drChaminda) {
      console.log('❌ Error: Dr. Chaminda Perera not found');
      return;
    }
    
    console.log(`Found Dr. ${drChaminda.name} (${drChaminda.doctorId})`);
    console.log(`Specialization: ${drChaminda.specialization}`);
    console.log(`Consultation Fee: ${drChaminda.consultationFee}`);
    
    // Find all appointments with DOC_SMITH
    const smithAppointments = await Appointment.find({ doctorId: 'DOC_SMITH' });
    console.log(`\nFound ${smithAppointments.length} appointments with DOC_SMITH`);
    
    if (smithAppointments.length === 0) {
      console.log('No appointments to update');
      return;
    }
    
    // Update each appointment
    console.log('\nUpdating appointments...');
    let updatedCount = 0;
    
    for (const appointment of smithAppointments) {
      try {
        console.log(`  Updating appointment for ${appointment.patientName} on ${appointment.date} at ${appointment.time}...`);
        
        // Update the appointment with Dr. Chaminda's information
        appointment.doctorId = drChaminda.doctorId;
        appointment.doctorName = `Dr. ${drChaminda.name}`;
        appointment.doctorSpecialization = drChaminda.specialization;
        appointment.doctorFee = drChaminda.consultationFee;
        
        await appointment.save();
        console.log(`  ✅ Updated appointment for ${appointment.patientName}`);
        updatedCount++;
      } catch (updateError) {
        console.log(`  ❌ Error updating appointment for ${appointment.patientName}:`, updateError.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} appointments`);
    console.log('All DOC_SMITH appointments are now associated with Dr. Chaminda Perera');
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const updatedAppointments = await Appointment.find({ doctorId: 'DOC001' });
    console.log(`Total appointments for Dr. Chaminda: ${updatedAppointments.length}`);
    
    const remainingSmithAppointments = await Appointment.find({ doctorId: 'DOC_SMITH' });
    console.log(`Remaining appointments with DOC_SMITH: ${remainingSmithAppointments.length}`);
    
    mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n=== UPDATE PROCESS COMPLETED ===');
    
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

updateAppointmentsDoctor();
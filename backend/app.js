// password = UR6FwT8ggNBM4pti

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./model/User');
const userRoutes = require('./routes/userRoutes'); // Updated import
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryManagerRoutes = require('./routes/imRoutes');
const pmRoutes = require('./routes/pmRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://it23688568:UR6FwT8ggNBM4pti@cluster0.ijo2aeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to the database'))
  .catch((error) => console.error('Failed to connect to the database:', error));

// Routes
app.use('/users', userRoutes); // Use the correct route file
app.use('/doctors', doctorRoutes);//added doctor routes
app.use('/admins', adminRoutes);
app.use('/inventory-managers', inventoryManagerRoutes);
app.use('/project-managers', pmRoutes);
app.use('/suppliers', supplierRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
# AyuMantra - Herbal Wellness Management System

A comprehensive inventory and cart management system for herbal wellness products, built with React frontend and Node.js/Express backend.

## 🏗️ Project Structure

```
AYUMANTHRA/
│
├── backend/                    # Node.js/Express API Server
│   ├── controllers/            # Route controllers
│   │   ├── CartControllers.js
│   │   └── InventoryControl.js
│   ├── model/                  # Database models
│   │   ├── CartModel.js
│   │   └── InventoryModel.js
│   ├── routes/                 # API routes
│   │   ├── CartRoutes.js
│   │   └── InventoryRoutes.js
│   ├── uploads/                # File uploads directory
│   │   └── .gitkeep
│   ├── app.js                  # Main server file
│   ├── package.json
│   └── node_modules/
│
├── frontend/                   # React Application
│   ├── public/                 # Static assets
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   │   ├── AddCart/
│   │   │   ├── CartDetails/
│   │   │   ├── CartItem/
│   │   │   ├── Dashboard/
│   │   │   ├── DeliveryTrackingSystem/
│   │   │   ├── Home/
│   │   │   ├── Inventory/
│   │   │   ├── Nav/
│   │   │   ├── Notification/
│   │   │   ├── Report/
│   │   │   ├── Sidebar/
│   │   │   ├── SupplierDashboard/
│   │   │   └── UpdateCart/
│   │   ├── contexts/           # React contexts
│   │   │   └── NotificationContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── node_modules/
│
├── .gitignore                  # Git ignore rules
├── LICENSE                     # Project license
├── logo.png                    # Project logo
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AYUMANTHRA
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Backend Server
```bash
cd backend
node app.js
# or
npm start
```
The backend will run on `http://localhost:5000`

#### Frontend Application
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 🛠️ Features

### Inventory Management
- Add, edit, and delete inventory items
- Image upload support
- Stock level monitoring
- Expiry date tracking
- Category management
- Supplier information
- PDF report generation

### Cart Management
- Add items to cart
- Update quantities
- Remove items
- Export cart data (JSON, Excel, PDF)
- Checkout functionality

### Delivery Tracking
- Order status tracking
- Real-time updates
- Customer and admin views
- Status history

### Dashboard
- Summary statistics
- Low stock alerts
- Expiry notifications
- Visual charts and graphs

## 🗄️ Database

The application uses MongoDB Atlas with two main collections:
- **Carts**: Cart and order management
- **Inventories**: Product inventory management

## 🔧 API Endpoints

### Cart Endpoints
- `GET /carts` - Get all cart items
- `POST /carts` - Add new cart item
- `GET /carts/:id` - Get cart item by ID
- `PUT /carts/:id` - Update cart item
- `DELETE /carts/:id` - Delete cart item
- `PATCH /carts/:id/status` - Update cart status

### Inventory Endpoints
- `GET /inventories` - Get all inventory items
- `POST /inventories` - Add new inventory item
- `GET /inventories/:id` - Get inventory item by ID
- `PUT /inventories/:id` - Update inventory item
- `DELETE /inventories/:id` - Delete inventory item

## 🎨 Technologies Used

### Frontend
- React 19.1.1
- React Router DOM
- Axios
- Lucide React (icons)
- HTML2Canvas
- jsPDF
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer (file uploads)
- CORS

## 📝 Development

### Code Structure
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Controllers**: Business logic
- **Models**: Database schemas
- **Routes**: API endpoints

### Best Practices
- ESLint configuration for code quality
- Responsive design
- Error handling
- Loading states
- User notifications

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
```
The build files will be in the `build/` directory.

### Backend
Ensure environment variables are set and deploy to your preferred hosting service.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.
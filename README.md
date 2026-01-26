# Hotel Management System

A full-stack hotel management application with role-based access control (Admin & User), built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Admin Features
- ✅ Login/Logout with JWT authentication (24-day token validity)
- ✅ Create, update, and delete hotels
- ✅ Add and manage rooms for hotels
- ✅ Toggle room availability status
- ✅ View all bookings across all hotels

### User Features
- ✅ Register and Login/Logout
- ✅ Browse all available hotels
- ✅ View rooms for each hotel
- ✅ Book multiple rooms in a single booking
- ✅ View personal bookings
- ✅ Cancel bookings

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (Secret: "Ankur-Bhowmik")
- **Password Hashing**: bcrypt (salt rounds: 10)

### Frontend
- **Framework**: React with Vite
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context API
- **Styling**: Vanilla CSS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
cd hotel-management
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# The .env file is already configured with:
# - MONGODB_URI=mongodb://localhost:27017/hotel-management
# - JWT_SECRET=Ankur-Bhowmik
# - JWT_EXPIRE=24d
# - BCRYPT_SALT=10
# - PORT=5000

# Start the backend server
npm start
# or for development with auto-reload
npm run dev
```

The backend will:
- Connect to MongoDB
- Automatically create a default admin account:
  - **Email**: ankur.riu@gmail.com
  - **Password**: ankur2005@

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Default Admin Credentials

- **Email**: ankur.riu@gmail.com
- **Password**: ankur2005@

## 📁 Project Structure

```
hotel-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Hotel.js              # Hotel schema
│   │   ├── Room.js               # Room schema
│   │   └── Booking.js            # Booking schema
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── roleCheck.js          # Role-based access control
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── hotels.js             # Hotel routes
│   │   ├── rooms.js              # Room routes
│   │   └── bookings.js           # Booking routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── hotelController.js
│   │   ├── roomController.js
│   │   └── bookingController.js
│   ├── utils/
│   │   └── seedAdmin.js          # Default admin creation
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── AllBookings.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `POST /logout` - Logout user

### Hotels (`/api/hotels`)
- `GET /` - Get all hotels (Public)
- `GET /:id` - Get hotel by ID (Public)
- `POST /` - Create hotel (Admin only)
- `PUT /:id` - Update hotel (Admin only)
- `DELETE /:id` - Delete hotel (Admin only)

### Rooms (`/api/rooms`)
- `GET /hotel/:hotelId` - Get rooms by hotel (Public)
- `GET /:id` - Get room by ID (Public)
- `POST /` - Create room (Admin only)
- `PUT /:id` - Update room (Admin only)
- `PATCH /:id/availability` - Toggle availability (Admin only)
- `DELETE /:id` - Delete room (Admin only)

### Bookings (`/api/bookings`)
- `POST /` - Create booking (User only)
- `GET /my-bookings` - Get user's bookings (User only)
- `GET /` - Get all bookings (Admin only)
- `GET /:id` - Get booking by ID (Private)
- `PATCH /:id/cancel` - Cancel booking (User only)

## ✨ Key Features Implementation

### Date Conflict Checking
The system automatically checks for booking conflicts to prevent double-booking of rooms for overlapping dates.

### Multiple Room Booking
Users can select and book multiple rooms in a single transaction.

### Minimum Booking Duration
Enforced minimum booking duration of 1 day.

### Role-Based Access Control
- Admin routes are protected and only accessible to admin users
- User routes are protected and only accessible to regular users
- JWT tokens automatically expire after 24 days

### Automatic Token Handling
- Tokens are automatically attached to API requests
- Expired tokens trigger automatic logout and redirect to login

## 🎨 UI Design

The application features a minimalistic, clean design with:
- Card-based layouts for hotels and bookings
- Table views for admin data management
- Modal forms for creating hotels and rooms
- Responsive design for mobile and desktop
- Status badges for bookings and room availability

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication with 24-day validity
- Role-based middleware protection
- Protected routes on frontend
- Automatic token expiration handling

## 📝 Usage Guide

### For Admin:
1. Login with default admin credentials
2. Add hotels from the dashboard
3. Add rooms to hotels
4. Toggle room availability as needed
5. View all bookings from all users

### For Users:
1. Register a new account
2. Browse available hotels
3. View rooms for hotels
4. Select multiple rooms and dates to book
5. View and manage your bookings

## 🐛 Troubleshooting

### MongoDB Connection Error
Make sure MongoDB is running on `localhost:27017`

### Port Already in Use
- Backend default port: 5000
- Frontend default port: 5173
Change ports in `.env` (backend) or `vite.config.js` (frontend) if needed

### npm Install Issues
If you encounter permission issues with npm cache, run:
```bash
sudo chown -R $(whoami) ~/.npm
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Created as a minimalistic hotel management system with essential features.

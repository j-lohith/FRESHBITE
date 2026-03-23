# FRESHBITE - Full Stack Application

A complete full-stack restaurant website with JWT-based user authentication, recipe browsing, and shopping cart functionality.

## ✨ Features

### 🔐 User Authentication
- User registration with form validation
- User login with validation
- JWT-based authentication
- User profile page with details
- Logout functionality
- Protected routes

### 🍽️ Restaurant Website
- Single-page website with modern layout
- Navigation bar
- Search bar for recipes
- Recipe list with images and prices
- Category filtering
- Shopping cart with add/remove functionality
- Responsive design

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios
- CSS3

**Backend:**
- Node.js
- Express.js
- **MySQL** (Database)
- JWT
- bcryptjs

## 📦 Project Structure

```
├── backend/           # Node.js + Express + MySQL backend
│   ├── config/       # Database configuration
│   ├── middleware/   # JWT authentication
│   ├── routes/       # API routes
│   └── server.js     # Server entry point
│
└── frontend/         # React frontend
    ├── public/       # Public assets
    └── src/          # Source code
        ├── components/  # React components
        ├── context/     # React context
        └── utils/       # Utility functions
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- **MySQL** (v8.0+)

### Setup Steps

1. **Database Setup:**
   ```bash
   mysql -u root -p < backend/config/database.sql
   ```
   Or manually create database and run SQL from `backend/config/database.sql`

2. **Backend:**
   ```bash
   cd backend
   npm install
   copy .env.example .env
   # Edit .env with your MySQL credentials
   npm start
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

Visit `http://localhost:3000` to see the application!

## 📚 Documentation

- **Quick Start Guide:** See [START_HERE.md](./START_HERE.md) ⭐
- **Complete Setup Guide:** See [PROJECT_SETUP.md](./PROJECT_SETUP.md)
- **Backend Documentation:** See [backend/README.md](./backend/README.md)
- **Frontend Documentation:** See [frontend/README.md](./frontend/README.md)

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user profile (requires auth)

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes?category=pizza` - Filter by category
- `GET /api/recipes?search=salad` - Search recipes

## 📝 License

This project is open source and available for educational purposes.



---

**Database:** MySQL | **Backend:** Node.js + Express | **Frontend:** React

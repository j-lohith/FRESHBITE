# Frontend

React frontend for the Restaurant App.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser

## Features

- User authentication (Login/Register/Profile)
- Recipe browsing with search and filters
- Shopping cart functionality
- Modern, responsive UI
- Protected routes

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Register, Profile components
│   ├── layout/        # Navbar component
│   └── restaurant/    # Restaurant, Recipe, Cart components
├── context/           # Auth context
├── utils/             # Helper functions
├── App.js             # Main app component
└── index.js           # Entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Environment

The frontend is configured to proxy API requests to `http://localhost:5000` (backend server).

Make sure the backend server is running before starting the frontend.


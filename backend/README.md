# Backend API - Node.js + Express + MySQL

REST API backend for the Restaurant App with JWT authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database

**Create database:**
```sql
CREATE DATABASE IF NOT EXISTS restaurant_db;
```

**Run schema:**
```bash
mysql -u root -p restaurant_db < config/database.sql
```

Or manually execute SQL commands from `config/database.sql` in MySQL Workbench.

### 3. Configure Environment

Copy `.env.example` to `.env`:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### 4. Start Server

**Normal mode:**
```bash
npm start
```

**Development mode (with auto-reload):**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **express-validator** - Input validation

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth)

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes?category=pizza` - Filter by category
- `GET /api/recipes?search=salad` - Search recipes
- `GET /api/recipes/:id` - Get recipe by ID

### Health Check
- `GET /api/health` - Check if server is running

## 🗄️ Database Schema

**Users Table:**
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password (VARCHAR(255))
- first_name (VARCHAR(50))
- last_name (VARCHAR(50))
- phone (VARCHAR(20))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Recipes Table:**
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- name (VARCHAR(100))
- description (TEXT)
- price (DECIMAL(10,2))
- image_url (VARCHAR(255))
- category (VARCHAR(50))
- created_at (TIMESTAMP)

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_NAME | Database name | restaurant_db |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | (empty) |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRE | Token expiration | 7d |

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js           # MySQL connection pool
│   └── database.sql    # Database schema
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── routes/
│   ├── auth.js         # Authentication routes
│   └── recipes.js      # Recipe routes
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment template
├── package.json
└── server.js           # Server entry point
```

## 🔧 Troubleshooting

**Cannot connect to MySQL:**
- Ensure MySQL service is running
- Check database credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

**Module not found errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

**Port already in use:**
- Change `PORT` in `.env` file
- Or kill process using port 5000

## 📝 Notes

- Passwords are hashed using bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days (configurable)
- Database connection uses connection pooling
- All routes are validated using express-validator

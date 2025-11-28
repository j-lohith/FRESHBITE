# 🚀 How to Start the Restaurant App

## ⚡ Quick Start Steps

### 1️⃣ Setup MySQL Database

**Option A: Using Command Line**
```bash
mysql -u root -p < backend/config/database.sql
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `backend/config/database.sql`
4. Execute the SQL file (Run Script button)

### 2️⃣ Start Backend (Terminal 1)

```bash
cd backend
npm install
copy .env.example .env
```

**Edit `backend/.env` file:**
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

**Start server:**
```bash
npm start
```

✅ Backend running on `http://localhost:5000`

### 3️⃣ Start Frontend (Terminal 2)

**Open a NEW terminal window:**

```bash
cd frontend
npm install
npm start
```

✅ Frontend will open at `http://localhost:3000`

## ✅ That's It!

The app should now be running:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

## 🔍 Verify Installation

1. **Test Backend:**
   - Open: http://localhost:5000/api/health
   - Should see: `{"message":"Server is running"}`

2. **Test Frontend:**
   - Should see restaurant homepage with recipes

## 🐛 Common Issues

**MySQL Connection Error:**
- Make sure MySQL service is running
- Check password in `.env` file
- Verify database `restaurant_db` exists

**Port Already in Use:**
- Change `PORT` in `backend/.env`
- Or stop other services using port 5000/3000

**npm install errors:**
- Delete `node_modules` folder
- Run `npm install` again

## 📝 Summary

**Two terminals needed:**
1. **Terminal 1:** Backend (`cd backend && npm start`)
2. **Terminal 2:** Frontend (`cd frontend && npm start`)

**Database:** MySQL must be running!

For more details, see [START_HERE.md](./START_HERE.md)


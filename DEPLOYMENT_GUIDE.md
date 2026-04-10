# GitHub & Deployment Guide for Barber Software

## Step 1: Prepare Repository for GitHub

### 1.1 Remove sensitive files from Git history (if you already committed them)
```bash
# Navigate to your project root
cd "c:\Users\ADMIN\Desktop\Barber Software"

# Remove .env file from tracking (if it was committed)
git rm --cached backend/.env
git rm --cached frontend/.env
```

### 1.2 Initialize/Update Git
```bash
# Initialize Git (if not already done)
git init

# Add all files
git add .

# Verify .gitignore is working (should NOT show .env files)
git status

# First commit
git commit -m "Initial commit: Barber Shop Management Software"
```

---

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New"** button (top-right)
3. Create repository with name: `barber-software`
4. Leave it **PUBLIC** or **PRIVATE** (your choice)
5. **Don't** initialize with README/gitignore (we already have them)
6. Click **"Create repository"**

### 2.1 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/barber-software.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (easiest)
3. Authorize Render to access your GitHub account

### 3.2 Deploy Backend Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository (`barber-software`)
3. Fill in details:
   - **Name**: `barber-software-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or upgrade as needed)

4. Under **"Environment"**, add all variables from `.env`:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=` (your MongoDB Atlas connection string)
   - `JWT_SECRET=` (unique secret key)
   - `FRONTEND_URL=` (your frontend URL, set later)
   - `EMAIL_USER=` (your email)
   - `EMAIL_PASSWORD=` (your app password)
   - `RAZORPAY_KEY_ID=`
   - `RAZORPAY_KEY_SECRET=`

5. Click **"Create Web Service"**
6. **Wait for deployment** (5-10 minutes)
7. Copy your backend URL: `https://barber-software-api.onrender.com`

### 3.3 MongoDB Atlas Setup (You Already Have This!)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your existing account
3. Go to your cluster → **"Connect"**
4. Click **"Drivers"** (not MongoDB Compass)
5. Select **Node.js** driver
6. Copy the connection string: `mongodb+srv://username:password@cluster-name.mongodb.net/database?retryWrites=true&w=majority`
7. Replace `username`, `password`, and `database` name
8. Use this as `MONGODB_URI` in Render environment variables

**No separate database deployment needed!** MongoDB Atlas handles everything.

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### 4.2 Deploy Frontend
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository (`barber-software`)
3. Click **"Import"**
4. Fill in deployment settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Under **"Environment Variables"**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://barber-software-api.onrender.com` (your Render backend URL)

6. Click **"Deploy"**
7. **Wait for deployment** (3-5 minutes)
8. Copy your frontend URL: `https://barber-software.vercel.app`

---

## Step 5: Update Backend Environment Variables

Go back to Render dashboard:
1. Open your `barber-software-api` service
2. Click **"Environment"**
3. Update `FRONTEND_URL` to your Vercel frontend URL: `https://barber-software.vercel.app`
4. Click **"Save"** (this will redeploy automatically)

---

## Step 6: Important - Update Backend Code for MongoDB

Your current backend uses PostgreSQL (`pg` driver). To use MongoDB:

### 6.1 Install MongoDB Driver
```bash
cd backend
npm install mongoose
```

### 6.2 Update `backend/src/utils/db.js`
Replace the PostgreSQL connection code with MongoDB:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

### 6.3 Call Connection in `backend/src/index.js`
Add at the top of your main file:
```javascript
const { connectDB } = require('./utils/db');

// Connect to MongoDB
connectDB();
```

### 6.4 Update Database Queries
Change from SQL queries to MongoDB operations. Example:
```javascript
// Old PostgreSQL way:
// const result = await query('SELECT * FROM users WHERE email = $1', [email]);

// New MongoDB way:
// const result = await User.findOne({ email: email });
```

**Note**: This requires refactoring all database queries in your controllers. If you need help with this, let me know.

---

## Verify Everything Works

1. **Test Backend API**: 
   ```
   https://barber-software-api.onrender.com/health
   ```
   (If you have a health endpoint, otherwise test a login endpoint)

2. **Visit Frontend**:
   ```
   https://barber-software.vercel.app
   ```

3. **Test Login**: Try logging in to make sure frontend can communicate with backend

---

## Summary of URLs

| Component | URL |
|-----------|-----|
| **Backend API** | `https://barber-software-api.onrender.com` |
| **Frontend** | `https://barber-software.vercel.app` |
| **MongoDB Atlas** | `https://cloud.mongodb.com` |
| **GitHub** | `https://github.com/YOUR_USERNAME/barber-software` |

---

## Important Notes

⚠️ **Security**:
- Never commit `.env` files
- Always use `.env.example` with placeholder values
- Regenerate `JWT_SECRET` for production
- Keep MongoDB Atlas credentials secure (IP whitelist all or specific IPs)

⚠️ **MongoDB Atlas**:
- Free tier: 512MB storage, enough for testing
- For production, upgrade to paid tier
- Always enable IP whitelist: Dashboard → Security → Network Access
- Add `0.0.0.0/0` for Render (or be more restrictive)

⚠️ **Free Tier Limitations**:
- Render: Spins down after 15 min of inactivity (slow first request)
- Vercel: Very generous free tier, good for production
- MongoDB: 512MB free storage
- For production, consider upgrading services

---

## If Issues Occur

### Backend Not Starting
1. Check Render logs: Click service → "Logs"
2. Verify `DATABASE_URL` is correct
3. Run migrations: `npm run migrate`

### Frontend Can't Connect to Backend
1. Check `VITE_API_URL` in Vercel environment variables
2. Ensure CORS is enabled in backend (`backend/src/index.js`)
3. Check browser console for errors (F12)

### Database Connection Failed
1. Verify `DATABASE_URL` format is correct
2. Ensure Render PostgreSQL service is running
3. Check network access is allowed

---

## Next Steps After Deployment

1. **Set up auto-deployment**: Already done (GitHub auto-deploys on push)
2. **Set up monitoring**: Render → "Alerts"
3. **Backup database**: Weekly backups recommended
4. **Domain**: Add custom domain in Vercel & Render settings
5. **SSL**: Already included (HTTPS by default)

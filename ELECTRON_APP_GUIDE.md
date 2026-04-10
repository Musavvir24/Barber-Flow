# BarberFlow Desktop App - User Guide

## 🚀 Running the Desktop App

### Development Mode
```bash
cd backend

# Terminal 1: Start the backend
npm run dev

# Terminal 2: Start with Electron
npm run electron-dev
```

### Production Mode
Double-click: `backend/dist/win-unpacked/BarberFlow.exe`

**Important:** The app will automatically start the backend server when launched in production mode.

---

## 📦 Standalone Executable Location

**Windows Portable Executable:**
```
C:\Users\ADMIN\Desktop\Barber Software\backend\dist\win-unpacked\BarberFlow.exe
```

**File Size:** ~450 MB (includes Electron + Node.js + dependencies)

---

## 🔧 Building Installers

### Create NSIS Installer (with admin permissions)
If you need a full installer (.msi/.exe), run as Administrator:
```bash
cd backend
npm run build-win
```

### Build Mac/Linux Versions
```bash
# macOS .dmg installer
npm run build-mac

# Linux AppImage/deb
npm run build-linux
```

---

## 📝 App Features

- ✅ Works offline (connects to NeonPostgres when available)
- ✅ Automatic backend startup
- ✅ Native Windows application
- ✅ Full barber shop management
- ✅ Appointments, services, barbers management
- ✅ Dashboard with statistics
- ✅ Settings and configuration
- ✅ Trial & premium features

---

## 🐛 Troubleshooting

**App won't start?**
1. Ensure backend is running on port 5000
2. Check .env has correct DATABASE_URL
3. Run: `npm run dev` in backend folder first

**Port 5000 already in use?**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Need to debug?**
- Press `Ctrl+Shift+I` while app is running for DevTools
- Check browser console for errors

---

## 📤 Distributing to Users

### Option 1: Direct Executable
Share the .exe file (450 MB):
- Users download and run directly
- No installation needed
- Works on Windows 10+

### Option 2: Create Installer (Advanced)
Run as Administrator to build .msi installer:
```bash
npm run build-win
# Creates: dist/BarberFlow Setup 1.0.0.exe
```

### Option 3: Cloud Deployment
Use Electron auto-update for easy distribution:
- Configure GitHub releases
- Automatic updates for users
- Version management

---

## 🔗 Database Connection

The app uses NeonPostgres (cloud PostgreSQL):
```
postgresql://neondb_owner:npg_sy9Mv6DpCijO@ep-billowing-cherry-anuc3dzi-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require
```

- All data syncs to cloud
- Access from any device
- Automatic backups

---

## 📊 Next Steps

1. ✅ Test the app locally
2. Share the .exe file with users
3. Monitor database usage
4. Add auto-update systems (optional)
5. Create custom installer with branding (optional)

**You're ready to distribute!** 🎉

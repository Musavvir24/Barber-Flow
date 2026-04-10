# 🔐 Password Recovery Implementation - Setup Guide

Password recovery has been successfully implemented! This guide will help you complete the setup.

## ✅ What's Been Completed

1. **Database Migration V7** - `password_reset_tokens` table created with:
   - Token storage with 30-minute expiration
   - User ID foreign key with cascade delete
   - Indexes for fast lookups
   - Status: ✅ **EXECUTED**

2. **Email Service** - `backend/src/services/emailService.js` created with:
   - Nodemailer integration for sending HTML emails
   - Password reset email templates with reset links
   - Status: ✅ **CREATED**

3. **Backend API Endpoints** - Added to `authController.js` and `auth.js` routes:
   - `POST /auth/forgot-password` - Request password reset
   - `POST /auth/reset-password` - Reset password with token
   - `GET /auth/validate-token/:token` - Validate reset token
   - Status: ✅ **IMPLEMENTED**

4. **Frontend Components**:
   - `ForgotPasswordModal.jsx` - Email input modal for password reset requests
   - `ResetPassword.jsx` - Password reset page with token validation
   - Status: ✅ **CREATED**

5. **Login Page Enhancement**:
   - "Forgot password?" link added below password field
   - Opens ForgotPasswordModal when clicked
   - Status: ✅ **INTEGRATED**

6. **App Routing** - Added ResetPassword route in `App.jsx`
   - Route: `/reset-password/:token`
   - Accessible from email links
   - Status: ✅ **CONFIGURED**

---

## 🔧 Setup Instructions

### Step 1: Configure Email Service

The password recovery feature requires email sending. Choose one of these options:

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Follow the setup process

2. **Generate App Password:**
   - In the same security page, find "App passwords"
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Update `.env` file:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   FRONTEND_URL=http://localhost:3002
   ```

4. **Test email sending** by requesting a password reset from the login page

#### Option B: Other Email Providers

For SendGrid, AWS SES, or other providers, update `emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  // Configure based on your provider
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

### Step 2: Test the Password Recovery Flow

1. **Open the Login Page:**
   - Navigate to http://localhost:3002/login

2. **Click "Forgot Password?"**
   - Modal appears asking for email

3. **Enter Email and Submit:**
   - System generates secure token
   - Token saved to database with 30-min expiry
   - Email sent with reset link

4. **Check Email:**
   - Look for email from `EMAIL_USER`
   - Click the reset link in the email
   - Link format: `http://localhost:3002/reset-password/{token}`

5. **Reset Password:**
   - Enter new password and confirm
   - Password strength indicator shows feedback
   - System validates token and updates password
   - Redirected to login page after success

6. **Login with New Password:**
   - Use new password to sign in

---

## 📊 How It Works

### 1. Forgot Password Request

**User Action:** Clicks "Forgot Password?" on login page
- Email address entered in modal
- Submitted to `POST /auth/forgot-password`

**Backend Process:**
1. Find user by email
2. Generate 32-character random hex token using `crypto.randomBytes(32)`
3. Save token to `password_reset_tokens` table with 30-min expiry
4. Send HTML email with reset link
5. Return success message (doesn't reveal if email exists)

**Database:**
```sql
INSERT INTO password_reset_tokens (user_id, token, expires_at)
VALUES (123, 'abc123...', NOW() + INTERVAL '30 minutes');
```

### 2. Email with Reset Link

**Email Sent:**
- To: User's email address
- Subject: 🔐 Password Reset Request - BarberFlow
- Body: HTML email with:
  - Personalized greeting
  - Reset button with link
  - Direct link URL (as backup)
  - 30-minute expiry warning
  - Security notice

**Reset Link Format:**
```
http://localhost:3002/reset-password/{token}
```

### 3. Token Validation

**When User Clicks Link:**
- `ResetPassword.jsx` page loads
- Token extracted from URL params
- `GET /auth/validate-token/{token}` called

**Backend Checks:**
1. Token exists in database
2. Token not already used (`used = FALSE`)
3. Expiration time not passed (`expires_at > NOW()`)

**Result:** Invalid token shows error page with "Back to Login" button

### 4. Password Reset

**User Submits New Password:**
- Submitted to `POST /auth/reset-password`
- Includes: `{ token, newPassword, confirmPassword }`

**Backend Process:**
1. Find token in database
2. Validate token (same checks as step 3)
3. Validate password (min 6 chars, match confirmation)
4. Hash new password with bcryptjs
5. Update user's `password_hash` in database
6. Mark token as `used = TRUE`
7. Return success message

**Database Updates:**
```sql
UPDATE users SET password_hash = $1 WHERE id = $2;
UPDATE password_reset_tokens SET used = TRUE WHERE id = $3;
```

---

## 🔒 Security Features

1. **Token Expiration:** Tokens valid for only 30 minutes
2. **One-Time Use:** Tokens marked as used after password reset
3. **Secure Token:** 32-character random hex string (256-bit entropy)
4. **Password Hashing:** Bcryptjs with 10 salt rounds
5. **Email Privacy:** Doesn't reveal if email exists in system
6. **HTTPS:** Should be used in production
7. **No Token in Logs:** Sensitive tokens not logged

---

## 📁 Files Created/Modified

### Created Files:
- ✅ `backend/db_migration_v7.sql` - Database schema
- ✅ `backend/runMigrationV7.js` - Migration runner
- ✅ `backend/src/services/emailService.js` - Email service
- ✅ `frontend/src/components/ForgotPasswordModal.jsx` - Modal component
- ✅ `frontend/src/pages/ResetPassword.jsx` - Reset page
- ✅ `backend/.env.example` - Environment variables template

### Modified Files:
- ✅ `backend/src/controllers/authController.js` - Added 3 new functions
- ✅ `backend/src/routes/auth.js` - Added 3 new routes
- ✅ `frontend/src/pages/Login.jsx` - Added forgot password link
- ✅ `frontend/src/App.jsx` - Added reset password route
- ✅ `frontend/src/pages/Auth.css` - Added styling for forgot password link
- ✅ `frontend/src/utils/api.jsx` - Added 3 new API methods
- ✅ `backend/package.json` - Nodemailer installed

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Create `.env` file with real email credentials
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Use HTTPS for all connections
- [ ] Enable production email service
- [ ] Test password reset flow end-to-end
- [ ] Add email delivery monitoring
- [ ] Consider adding rate limiting to forgot-password endpoint
- [ ] Add logging for password reset attempts
- [ ] Test token expiration edge cases
- [ ] Verify email templates render correctly

---

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check `.env` file exists** in `backend/` directory
2. **Verify credentials:** Test with dummy values first
3. **Gmail Issues:**
   - Confirm 2FA is enabled
   - Verify app password was generated correctly
   - Check that "Less secure apps" is not blocking (if not using app password)
4. **Check backend logs:** `npm run dev` output shows email errors
5. **Nodemailer installed?** `npm list nodemailer` should show `nodemailer@6.x.x`

### Token Invalid/Expired?

1. **Token expires in 30 minutes** - User must act quickly
2. **Can request new token** - Click "Forgot Password?" again
3. **Check database:** Verify `password_reset_tokens` table exists
   ```sql
   SELECT * FROM password_reset_tokens ORDER BY created_at DESC LIMIT 1;
   ```

### Password Reset Not Working?

1. **Check password requirements:** Min 6 characters
2. **Verify token in URL:** Should be 64-character hex string
3. **Check database:** `password_hash` should be updated after reset
4. **Clear browser cache:** JWT might be cached

---

## 📞 Support Notes

The implementation uses:
- **Node.js Crypto:** For secure token generation
- **Nodemailer:** For email sending
- **Bcryptjs:** For password hashing
- **PostgreSQL:** For token storage and validation

All code includes error handling and security best practices.

---

## ✨ Next Steps (Optional Enhancements)

1. **Email Templates:** Create fancy HTML email templates
2. **SMS Backup:** Add SMS recovery code option
3. **Rate Limiting:** Limit forgot password requests per IP
4. **Audit Logging:** Log password reset attempts
5. **Recovery Codes:** Generate backup recovery codes
6. **Two-Factor Auth:** Add TOTP or SMS verification
7. **Social Login:** Add Google/GitHub authentication

---

**Status: ✅ READY FOR TESTING**

Start your servers and try the password recovery flow!

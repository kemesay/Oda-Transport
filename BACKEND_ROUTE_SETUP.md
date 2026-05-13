# Backend Route Setup Instructions

## Problem
The email route `/api/v1/email/contact` is returning 404 because it's not registered on the backend server at `https://api.odatransportation.com`.

## Solution

You need to register the email routes in your main backend server file. Here's how:

### Option 1: If you have access to the backend server code

1. **Find your main server file** (usually `server.js`, `app.js`, or `index.js` in the backend project)

2. **Add the email routes import and registration:**

```javascript
const express = require('express');
const app = express();

// ... other middleware and routes ...

// Import email routes
const emailRoutes = require('./routes/emailRoutes'); // Adjust path as needed

// Register email routes
app.use('/api/v1/email', emailRoutes);

// ... rest of your server setup ...
```

3. **Make sure the file structure matches:**
   - `server/routes/emailRoutes.js` (the route file)
   - `server/controllers/emailController.js` (the controller)

4. **Restart your backend server**

### Option 2: If you're using a separate email server

If you want to run the email service as a separate microservice, use the `server/index.js` file I created:

1. **Install dependencies** (if not already installed):
```bash
npm install express cors nodemailer
```

2. **Start the email server:**
```bash
node server/index.js
```

3. **Update your frontend** to point to the email server:
   - Update `src/globalVariable.js` or
   - Update `src/api/emailService.js` to use the email server URL

### Option 3: Quick Fix - Add to existing backend

If your backend server is at `https://api.odatransportation.com`, you need to:

1. **Copy these files to your backend server:**
   - `server/routes/emailRoutes.js`
   - `server/controllers/emailController.js`

2. **In your main backend server file, add:**
```javascript
const emailRoutes = require('./routes/emailRoutes');
app.use('/api/v1/email', emailRoutes);
```

3. **Install nodemailer** (if not already installed):
```bash
npm install nodemailer
```

4. **Restart your backend server**

## Testing

After setting up, test the endpoint:

```bash
curl -X POST https://api.odatransportation.com/api/v1/email/contact \
  -H "Content-Type: application/json" \
  -d '{
    "from_name": "Test User",
    "from_email": "test@example.com",
    "from_phone": "1234567890",
    "service": "Airport Service",
    "message": "Test message",
    "subject": "Test Subject",
    "to_email": "info@odatransportation.com"
  }'
```

## Current File Structure

```
server/
├── index.js              # Email server (if using separate server)
├── controllers/
│   └── emailController.js
└── routes/
    └── emailRoutes.js
```

## Important Notes

1. **CORS Configuration**: Make sure your backend allows requests from your frontend domain
2. **Environment Variables**: Consider moving email credentials to environment variables
3. **Error Handling**: The controller already has comprehensive error handling
4. **Security**: The controller includes input validation and sanitization

## Environment Variables (Recommended)

For production, use environment variables for email credentials:

```javascript
// In emailController.js
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "mail.odatransportation.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || "bookingnotification@odatransportation.com",
        pass: process.env.EMAIL_PASSWORD || "your-password",
    },
});
```

Then set these in your `.env` file or server environment.

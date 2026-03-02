# Email Server Setup

The contact form uses a local Express server to send emails. Follow these steps to set it up:

## Quick Start

### 1. Start the Email Server

Open a terminal and run:

```bash
cd oda-ride-transport
npm run server
```

The server will start on `http://localhost:3001`

### 2. Start the React App

Open another terminal and run:

```bash
cd oda-ride-transport
npm start
```

The React app will start on `http://localhost:3000`

## Alternative: Run Both Together

If you have `concurrently` installed, you can run both servers at once:

```bash
npm install -g concurrently
npm run dev
```

Or install it locally:

```bash
npm install --save-dev concurrently
npm run dev
```

## How It Works

1. **Frontend** (`src/page/landingPage/component/contact/index.js`)
   - User fills out the contact form
   - Calls `sendContactEmail()` from `src/api/emailService.js`
   - Sends POST request to `http://localhost:3001/api/email/contact`

2. **Email Server** (`server/index.js`)
   - Express server running on port 3001
   - Handles `/api/email/contact` route
   - Uses `server/controllers/emailController.js` to send emails

3. **Email Controller** (`server/controllers/emailController.js`)
   - Uses Nodemailer to send emails via SMTP
   - Sends two emails:
     - Main email to `info@odatransportation.com`
     - Auto-reply to the customer

## Email Configuration

The email server uses these settings (configured in `server/controllers/emailController.js`):

- **SMTP Host**: mail.odatransportation.com
- **Port**: 465 (SSL)
- **From Email**: bookingnotification@odatransportation.com
- **To Email**: info@odatransportation.com

## Testing

1. Make sure both servers are running
2. Navigate to the contact form on your React app
3. Fill out and submit the form
4. Check the email server console for logs
5. Verify emails are received

## Troubleshooting

### "Unable to reach email server"
- Make sure the email server is running: `npm run server`
- Check if port 3001 is available
- Verify the server started successfully (look for "Email server running on port 3001")

### "Email sending error"
- Check email credentials in `server/controllers/emailController.js`
- Verify SMTP settings are correct
- Check server console for detailed error messages

### Port Already in Use
If port 3001 is already in use, you can change it:

1. Set environment variable: `PORT=3002 npm run server`
2. Or update `server/index.js` to use a different port

## Production Deployment

For production, you'll need to:

1. Deploy the email server separately (or as a separate service)
2. Update `src/api/emailService.js` to use the production server URL:
   ```javascript
   const EMAIL_SERVER_URL = process.env.REACT_APP_EMAIL_SERVER_URL || 'https://your-production-server.com';
   ```

3. Set the environment variable in your production environment

## Files Modified

- ✅ `server/index.js` - Created Express server
- ✅ `server/controllers/emailController.js` - Fixed `from` address
- ✅ `src/api/emailService.js` - Updated to use local server
- ✅ `src/page/landingPage/component/contact/index.js` - Improved error handling
- ✅ `package.json` - Added `server` and `dev` scripts

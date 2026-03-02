const express = require('express');
const router = express.Router();
const { sendBookingApprovalEmail, sendResetPasswordEmail, bookingNotification, paymentNotification } = require('../utils/emailSender');

// Get all email notifications for a user
router.get('/notifications/email', async (req, res) => {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll simulate a more dynamic system
    const userId = req.query.userId || 'default'; // In a real app, get from auth token
    
    // Simulate fetching from database - in reality, this would query the DB
    const notifications = [];
    
    // Add some sample notifications based on user
    notifications.push({
      id: Date.now(),
      type: 'SYSTEM',
      title: 'Welcome!',
      message: 'Thank you for joining our service.',
      timestamp: new Date().toISOString(),
      isRead: false,
      emailType: 'WELCOME',
      userId: userId
    });
    
    // In a real app, you'd query the database for the user's notifications
    // const dbNotifications = await NotificationModel.findByUserId(userId);
    // notifications.push(...dbNotifications);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching email notifications:', error);
    res.status(500).json({ error: 'Failed to fetch email notifications' });
  }
});

// Mark a notification as read
router.put('/notifications/email/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    // In a real implementation, this would update the database
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/email/read-all', async (req, res) => {
  try {
    // In a real implementation, this would update the database
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete a notification
router.delete('/notifications/email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // In a real implementation, this would delete from the database
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get unread notification count
router.get('/notifications/email/unread-count', async (req, res) => {
  try {
    // In a real implementation, this would count from the database
    // For now, we'll return 0 as there are no real notifications stored
    res.json({ count: 0 });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Send booking notification
router.post('/notifications/email/booking', async (req, res) => {
  try {
    const { bookingType, booking } = req.body;
    await bookingNotification(bookingType, booking);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending booking notification:', error);
    res.status(500).json({ error: 'Failed to send booking notification' });
  }
});

// Send payment notification
router.post('/notifications/email/payment', async (req, res) => {
  try {
    const { userEmail, data } = req.body;
    await paymentNotification(userEmail, data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending payment notification:', error);
    res.status(500).json({ error: 'Failed to send payment notification' });
  }
});

// Send password reset notification
router.post('/notifications/email/reset-password', async (req, res) => {
  try {
    const { email, fullName, resetToken } = req.body;
    await sendResetPasswordEmail(email, fullName, resetToken);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending password reset notification:', error);
    res.status(500).json({ error: 'Failed to send password reset notification' });
  }
});

module.exports = router;
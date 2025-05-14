const express = require('express');
const router = express.Router();
const { sendBookingApprovalEmail, sendResetPasswordEmail, bookingNotification, paymentNotification } = require('../utils/emailSender');

// Get all email notifications for a user
router.get('/notifications/email', async (req, res) => {
  try {
    // In a real implementation, this would fetch from a database
    const notifications = [
      {
        id: 1,
        type: 'BOOKING',
        title: 'Booking Confirmation',
        message: 'Your ride to Denver International Airport has been confirmed for tomorrow at 10:00 AM',
        timestamp: '2024-02-20T10:00:00',
        isRead: false,
        emailType: 'BOOKING_CONFIRMATION',
      },
      {
        id: 2,
        type: 'PAYMENT',
        title: 'Payment Receipt',
        message: 'Payment of $150 for your last ride has been processed successfully',
        timestamp: '2024-02-19T15:30:00',
        isRead: false,
        emailType: 'PAYMENT_CONFIRMATION',
      },
      {
        id: 3,
        type: 'PROMO',
        title: 'Special Offer',
        message: 'Use code SPRING2024 for 20% off your next ride',
        timestamp: '2024-02-18T09:00:00',
        isRead: true,
        emailType: 'PROMOTION',
      },
    ];

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
    res.json({ count: 2 });
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
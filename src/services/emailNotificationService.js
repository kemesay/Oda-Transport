import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class EmailNotificationService {
  static async getEmailNotifications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/email`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/email/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead() {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/email/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/notifications/email/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async getUnreadCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/email/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default EmailNotificationService; 
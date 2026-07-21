const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_id?: string; // Optional, will use current user if not provided
}

// Get JWT token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Get auth headers with JWT token
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

class NotificationService {
  // Get all notifications for current user
  async getNotifications(): Promise<Notification[]> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Create notification (for system use)
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create system notification for all users (admin only)
  async createSystemNotification(notificationData: Omit<CreateNotificationData, 'user_id'>): Promise<void> {
    // TODO: Implement admin broadcast endpoint
    console.warn('System notification broadcast not implemented yet');
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    // Real-time updates not supported with simple fetch
    return null;
  }
}

export const notificationService = new NotificationService();
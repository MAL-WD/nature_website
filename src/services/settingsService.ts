const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    language: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    fileUpdates: boolean;
    systemUpdates: boolean;
    reminders: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
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

class SettingsService {
  // Get user settings
  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/settings`, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();

      return {
        profile: data.profile || {},
        notifications: data.notifications || {},
        security: data.security || {},
        appearance: data.appearance || {}
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  // Update user settings
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Update specific section of settings
  async updateSettingsSection(section: keyof UserSettings, data: Partial<UserSettings[keyof UserSettings]>): Promise<UserSettings> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/settings/${section}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${section} settings`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating settings section:', error);
      throw error;
    }
  }

  // Update profile information
  async updateProfile(profileData: Partial<UserSettings['profile']>): Promise<UserSettings> {
    return this.updateSettingsSection('profile', profileData);
  }

  // Update notification preferences
  async updateNotifications(notificationData: Partial<UserSettings['notifications']>): Promise<UserSettings> {
    return this.updateSettingsSection('notifications', notificationData);
  }

  // Update security settings
  async updateSecurity(securityData: Partial<UserSettings['security']>): Promise<UserSettings> {
    return this.updateSettingsSection('security', securityData);
  }

  // Update appearance settings
  async updateAppearance(appearanceData: Partial<UserSettings['appearance']>): Promise<UserSettings> {
    return this.updateSettingsSection('appearance', appearanceData);
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
  }

  // Delete user settings (when user is deleted)
  async deleteUserSettings(): Promise<void> {
    // Handled by backend cascade delete usually, or implement endpoint
  }

  // Get user profile information
  async getUserProfile(): Promise<UserSettings['profile'] | null> {
    try {
      const settings = await this.getUserSettings();
      return settings?.profile || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Subscribe to settings changes
  subscribeToSettingsChanges(callback: (settings: UserSettings) => void) {
    // Real-time updates not supported with simple fetch
    return null;
  }
}

export const settingsService = new SettingsService();

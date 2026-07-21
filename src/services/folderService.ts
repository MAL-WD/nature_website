const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

interface Folder {
  _id: string;
  id?: string;
  name: string;
  description: string;
  parentId: string | null;
  status: 'active' | 'archived' | 'pending';
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateFolderData {
  name: string;
  description?: string;
  parentId?: string | null;
  status?: 'active' | 'archived' | 'pending';
  category?: string;
}

interface UpdateFolderData {
  name?: string;
  description?: string;
  parentId?: string | null;
  status?: 'active' | 'archived' | 'pending';
  category?: string;
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

export class FolderService {
  static async getFolders(parentId?: string | null): Promise<Folder[]> {
    try {
      const headers = getAuthHeaders();
      const url = parentId 
        ? `${API_BASE_URL}/folders?parentId=${parentId}`
        : `${API_BASE_URL}/folders`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to fetch folders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((folder: Folder) => ({
        ...folder,
        id: folder._id || folder.id,
      }));
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  static async createFolder(folderData: CreateFolderData): Promise<Folder> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/folders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create folder: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        id: data._id || data.id,
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  static async updateFolder(id: string, updates: UpdateFolderData): Promise<Folder> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update folder: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        id: data._id || data.id,
      };
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }

  static async deleteFolder(id: string): Promise<void> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        if (response.status === 404) {
          throw new Error('Folder not found');
        }
        throw new Error(`Failed to delete folder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  static async getFolderById(id: string): Promise<Folder & { fileCount?: number; subfolderCount?: number }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        if (response.status === 404) {
          throw new Error('Folder not found');
        }
        throw new Error(`Failed to fetch folder: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        id: data._id || data.id,
      };
    } catch (error) {
      console.error('Error fetching folder by ID:', error);
      throw error;
    }
  }

  static async getSubfolders(parentId: string): Promise<Folder[]> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/folders/${parentId}/subfolders`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to fetch subfolders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((folder: Folder) => ({
        ...folder,
        id: folder._id || folder.id,
      }));
    } catch (error) {
      console.error('Error fetching subfolders:', error);
      throw error;
    }
  }

  static async getFolderFiles(folderId: string, filters?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<any[]> {
    try {
      const headers = getAuthHeaders();
      
      let url = `${API_BASE_URL}/folders/${folderId}/files`;
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('backend_jwt_token');
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to fetch folder files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching folder files:', error);
      throw error;
    }
  }
}
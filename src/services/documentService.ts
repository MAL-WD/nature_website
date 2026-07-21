const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Get JWT token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Get auth headers with JWT token
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    // Content-Type is not set here because FormData sets it automatically with boundary
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export class DocumentService {
  static async uploadDocument(file: File, fileId: string, userId: string) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileId', fileId);

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  }

  static async deleteDocument(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  }

  static async getDocuments(fileId: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/documents?fileId=${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  }
}
import { EnvironmentalFile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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

export class FileService {
  static async createFile(fileData: Omit<EnvironmentalFile, 'id' | 'created_at' | 'updated_at'>, folderId?: string) {
    const headers = getAuthHeaders();
    const dataWithFolder = folderId ? { ...fileData, folder_id: folderId } : fileData;
    
    const response = await fetch(`${API_BASE_URL}/environmental-files`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dataWithFolder),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create file');
    }

    return response.json();
  }

  static async getFiles(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    folderId?: string;
  }) {
    const headers = getAuthHeaders();
    let url = `${API_BASE_URL}/environmental-files`;
    
    // Note: Backend currently returns all files. Filtering should ideally be moved to backend.
    // For now, we fetch all and filter client-side to match previous behavior, 
    // or we can implement query params on backend.
    // Let's assume backend returns all for now and we filter here if needed, 
    // but ideally backend should handle it.
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    let data = await response.json();

    // Client-side filtering (temporary until backend supports query params)
    if (filters?.folderId) {
      data = data.filter((f: any) => f.folder_id === filters.folderId);
    }

    if (filters?.status && filters.status !== 'all') {
      data = data.filter((f: any) => f.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter((f: any) => 
        f.id?.toLowerCase().includes(searchLower) || 
        f.institution_name?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination (client-side for now)
    if (filters?.limit && filters?.offset !== undefined) {
      data = data.slice(filters.offset, filters.offset + filters.limit);
    } else if (filters?.limit) {
      data = data.slice(0, filters.limit);
    }

    return data;
  }

  static async getFileById(id: string) {
    const headers = getAuthHeaders();
    // Since backend doesn't have a specific get-by-id endpoint that returns relations yet,
    // we might need to fetch all and find one, or update backend.
    // Actually, backend has PUT /:id and DELETE /:id, but GET / is all.
    // Let's rely on GET / for now and find the file.
    // WAIT: Previous implementation used `eq('id', id).single()`.
    // I should probably add GET /:id to backend or just filter from list.
    // Let's try to fetch list and find.
    
    const files = await this.getFiles();
    const file = files.find((f: any) => f.id === id);
    
    if (!file) {
      throw new Error('File not found');
    }
    
    return file;
  }

  static async updateFile(id: string, updates: Partial<EnvironmentalFile>) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/environmental-files/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update file');
    }

    return response.json();
  }

  static async deleteFile(id: string) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/environmental-files/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  static async getStatistics() {
    const files = await this.getFiles();
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const stats = {
      total_files: files.length,
      pending_files: files.filter((f: any) => f.status === 'انتظار').length,
      approved_files: files.filter((f: any) => f.status === 'مقبول').length,
      rejected_files: files.filter((f: any) => f.status === 'مرفوض').length,
      on_hold_files: files.filter((f: any) => f.status === 'تحفظ').length,
      files_this_month: files.filter((f: any) => new Date(f.created_at) >= thisMonth).length,
      files_this_year: files.filter((f: any) => new Date(f.created_at) >= thisYear).length,
    };

    return stats;
  }

  static generateFileId(activity: string, classification: string, fileCount: number) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const activityCode = activity ? activity.charAt(0).toUpperCase() : 'X';
    
    const classifications = [
      { code: 'bc', name: 'bechar' },
      { code: 'ab', name: 'abadlah' },
      { code: 'ke', name: 'kenadsa' },
      { code: 'be', name: 'beniounif' },
      { code: 'la', name: 'lahmar' },
      { code: 'ta', name: 'taghit' },
      { code: 'mo', name: 'moughel' },
      { code: 'bo', name: 'boukais' },
      { code: 'er', name: 'erg ferdy' },
      { code: 'me', name: 'meridja' },
      { code: 'ma', name: 'macheria' }
    ];
    
    const classificationCode = classifications.find(c => c.name === classification)?.code.toUpperCase() || 'XX';
    const fileNumber = String(fileCount + 1).padStart(3, '0');
    
    return `${month}${year}${activityCode}-${classificationCode}-${fileNumber}`;
  }

  static async getFilesByFolder(folderId: string, filters?: {
    status?: string;
    type?: string;
    search?: string;
  }) {
    const headers = getAuthHeaders();
    let url = `${API_BASE_URL}/environmental-files`;
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    let data = await response.json();

    // Filter by folder
    data = data.filter((f: any) => f.folder_id === folderId);

    // Apply additional filters
    if (filters?.status && filters.status !== 'all') {
      data = data.filter((f: any) => f.status === filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      data = data.filter((f: any) => f.type === filters.type);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter((f: any) => 
        f.id?.toLowerCase().includes(searchLower) || 
        f.institution_name?.toLowerCase().includes(searchLower) ||
        f.file_content?.toLowerCase().includes(searchLower)
      );
    }

    return data;
  }

  static async moveFileToFolder(fileId: string, folderId: string) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/environmental-files/${fileId}/move`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ folderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to move file to folder');
    }

    return response.json();
  }

  static async downloadFile(fileId: string) {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/environmental-files/${fileId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file-${fileId}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
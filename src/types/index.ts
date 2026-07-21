export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'viewer';
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  _id?: string;
  name: string;
  description: string;
  parentId: string | null;
  status: 'active' | 'archived' | 'pending';
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
  subfolderCount?: number;
}

export interface EnvironmentalFile {
  id: string;
  deposit_date: string;
  send_date: string;
  send_time: string;
  status: 'مقبول' | 'تحفظ' | 'مرفوض' | 'انتظار';
  file_content: string;
  category: string;
  study_office: string;
  classification: string;
  activity: string;
  address: string;
  municipality?: string;
  district?: string;
  institution_type: 'public' | 'private';
  private_type?: string;
  phone: string;
  institution_name: string;
  operator: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  folder_id?: string;
  folderId?: string;
  documents?: Document[];
  comments?: Comment[];
}

export interface Document {
  id: string;
  file_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Comment {
  id: string;
  file_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface Statistics {
  total_files: number;
  pending_files: number;
  approved_files: number;
  rejected_files: number;
  on_hold_files: number;
  files_this_month: number;
  files_this_year: number;
}
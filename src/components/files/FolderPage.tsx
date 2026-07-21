import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Download,
  Upload,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { FolderService } from '../../services/folderService';
import { FileService } from '../../services/fileService';
import type { Folder as FolderType } from '../../types';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  uploadedBy: string;
  description: string;
}

interface SubFolder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FolderPageProps {
  folderId: string;
  onBack: () => void;
}

export default function FolderPage({ folderId, onBack }: FolderPageProps): JSX.Element {
  const [folder, setFolder] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [subFolders, setSubFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
    status: 'active' | 'archived' | 'pending';
    category: string;
  }>({
    name: '',
    description: '',
    status: 'active',
    category: ''
  });

  // Fetch folder data on mount
  useEffect(() => {
    fetchFolderData();
  }, [folderId]);

  const fetchFolderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch folder details
      const folderData = await FolderService.getFolderById(folderId);
      setFolder(folderData);

      // Fetch subfolders
      const subfoldersData = await FolderService.getSubfolders(folderId);
      setSubFolders(subfoldersData);

      // Fetch files in folder
      const filesData = await FolderService.getFolderFiles(folderId);
      setFiles(filesData);
    } catch (err: any) {
      console.error('Error fetching folder data:', err);
      setError(err.message || 'Failed to load folder data');
    } finally {
      setLoading(false);
    }
  };

  const fileTypes = ['all', 'PDF', 'DWG', 'DOCX', 'XLSX', 'JPG', 'PNG'];
  const statuses = ['all', 'pending', 'approved', 'rejected', 'under_review'];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-green-700';
      case 'rejected':
        return 'bg-red-500 text-red-700';
      case 'pending':
        return 'bg-yellow-500 text-yellow-700';
      case 'under_review':
        return 'bg-blue-500 text-blue-700';
      default:
        return 'bg-gray-500 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'في الانتظار';
      case 'under_review':
        return 'قيد المراجعة';
      default:
        return 'غير محدد';
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      try {
        await FileService.deleteFile(id);
        await fetchFolderData(); // Refresh data
      } catch (err: any) {
        alert('فشل حذف الملف: ' + err.message);
      }
    }
  };

  const handleViewFile = (file: any) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleEditFolder = () => {
    if (folder) {
      setEditFormData({
        name: folder.name || '',
        description: folder.description || '',
        status: folder.status || 'active',
        category: folder.category || ''
      });
      setShowEditModal(true);
    }
  };

  const handleSaveFolder = async () => {
    try {
      await FolderService.updateFolder(folderId, editFormData);
      setShowEditModal(false);
      await fetchFolderData(); // Refresh data
    } catch (err: any) {
      alert('فشل تحديث المجلد: ' + err.message);
    }
  };

  const handleDeleteFolder = async () => {
    if (confirm('هل أنت متأكد من حذف هذا المجلد؟ سيتم حذف جميع الملفات والمجلدات الفرعية.')) {
      try {
        await FolderService.deleteFolder(folderId);
        onBack(); // Go back after deletion
      } catch (err: any) {
        alert('فشل حذف المجلد: ' + err.message);
      }
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      await FileService.downloadFile(fileId);
    } catch (err: any) {
      alert('فشل تحميل الملف: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#076653' }}></div>
          <p className="text-h4" style={{ color: '#076653' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)' }}>
        <div className="text-center">
          <p className="text-h3 text-red-600 mb-4">خطأ في تحميل البيانات</p>
          <p className="text-body text-gray-600 mb-6">{error || 'المجلد غير موجود'}</p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 text-white rounded-lg">العودة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)'
    }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors shadow-sm"
              style={{ borderColor: '#E3EF26', color: '#0C342C' }}
            >
              <ArrowLeft size={20} />
              <span className="text-label">العودة</span>
            </button>
            <div className="flex-1">
              <h1 className="text-h1 mb-3" style={{ color: '#076653' }}>
                📁 {folder.name}
              </h1>
              <p className="text-h4 text-gray-600">
                {folder.description}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditFolder}
                className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors shadow-sm"
                style={{ borderColor: '#E3EF26', color: '#0C342C' }}
              >
                <Edit size={20} />
                <span className="text-label">تعديل المجلد</span>
              </button>
              <button
                onClick={handleDeleteFolder}
                className="flex items-center gap-2 px-4 py-3 border-2 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                style={{ borderColor: '#dc2626', color: '#dc2626' }}
              >
                <Trash2 size={20} />
                <span className="text-label">حذف المجلد</span>
              </button>
            </div>
          </div>

          {/* Folder Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border-2 shadow-md" style={{ borderColor: '#E3EF26' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي الملفات</p>
                  <p className="text-2xl font-bold" style={{ color: '#076653' }}>{folder.totalFiles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 shadow-md" style={{ borderColor: '#E3EF26' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
                  <Folder size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المجلدات الفرعية</p>
                  <p className="text-2xl font-bold" style={{ color: '#076653' }}>{subFolders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 shadow-md" style={{ borderColor: '#E3EF26' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                  <p className="text-lg font-medium" style={{ color: '#076653' }}>{folder.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 shadow-md" style={{ borderColor: '#E3EF26' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
                  <MoreHorizontal size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">آخر تحديث</p>
                  <p className="text-lg font-medium" style={{ color: '#076653' }}>{folder.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#076653' }} />
              <input
                type="text"
                placeholder="البحث في الملفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'جميع الأنواع' : type}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'جميع الحالات' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
            }}
          >
            <Upload size={20} />
            رفع ملف
          </button>
        </div>

        {/* Sub Folders */}
        {subFolders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
              📂 المجلدات الفرعية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subFolders.map((subFolder) => (
                <div
                  key={subFolder.id}
                  className="bg-white p-5 rounded-lg border-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{ borderColor: '#E3EF26' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
                      <Folder size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-h4 font-semibold mb-1" style={{ color: '#0C342C' }}>{subFolder.name}</h3>
                      <p className="text-caption text-gray-600">{subFolder.fileCount} ملف</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div className="mb-8">
          <h2 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
            📄 الملفات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white p-6 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ borderColor: '#E3EF26' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-caption font-medium ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </div>

                <h3 className="text-h4 font-semibold mb-3 line-clamp-2" style={{ color: '#0C342C' }}>
                  {file.name}
                </h3>
                
                <p className="text-body text-gray-600 mb-4 line-clamp-2">
                  {file.description}
                </p>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">النوع:</span>
                    <span className="font-medium text-gray-700">{file.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">الحجم:</span>
                    <span className="font-medium text-gray-700">{file.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-gray-500">تاريخ الرفع:</span>
                    <span className="font-medium text-gray-700">{file.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-caption text-gray-500">{file.uploadedBy}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewFile(file)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="عرض"
                    >
                      <Eye size={18} style={{ color: '#076653' }} />
                    </button>
                    <button
                      onClick={() => {/* Handle edit */}}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit size={18} style={{ color: '#E3EF26' }} />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} style={{ color: '#dc2626' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border-2 shadow-lg" style={{ borderColor: '#E3EF26' }}>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={48} className="text-gray-400" />
              </div>
              <h3 className="text-h3 text-gray-700 mb-3">لا توجد ملفات</h3>
              <p className="text-body text-gray-500 mb-6">قم برفع ملف جديد للبدء في تنظيم عملك</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
                }}
              >
                <Upload size={20} />
                رفع ملف جديد
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View File Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-screen overflow-y-auto">
            <div 
              className="p-6 border-b sticky top-0"
              style={{ 
                background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)',
                borderColor: '#E3EF26'
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">تفاصيل الملف</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#076653' }}>معلومات الملف</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">اسم الملف:</span>
                      <p className="font-medium">{selectedFile.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">الوصف:</span>
                      <p className="font-medium">{selectedFile.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">النوع:</span>
                      <p className="font-medium">{selectedFile.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">الحجم:</span>
                      <p className="font-medium">{selectedFile.size}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#076653' }}>تفاصيل إضافية</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">الحالة:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFile.status)}`}>
                        {getStatusText(selectedFile.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">تم الرفع بواسطة:</span>
                      <p className="font-medium">{selectedFile.uploadedBy}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">تاريخ الرفع:</span>
                      <p className="font-medium">{selectedFile.uploadedAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadFile(selectedFile.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    تحميل
                  </button>
                  <button
                    onClick={() => {/* Handle edit */}}
                    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#E3EF26', color: '#0C342C' }}
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteFile(selectedFile.id);
                      setShowViewModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl">
            <div 
              className="p-6 border-b sticky top-0"
              style={{ 
                background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)',
                borderColor: '#E3EF26'
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">تعديل المجلد</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                    اسم المجلد
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: '#E3EF26' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                    الوصف
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: '#E3EF26' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                    الحالة
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'archived' | 'pending' })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: '#E3EF26' }}
                  >
                    <option value="active">نشط</option>
                    <option value="archived">مؤرشف</option>
                    <option value="pending">قيد الانتظار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                    الفئة
                  </label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: '#E3EF26' }}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#E3EF26', color: '#0C342C' }}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveFolder}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

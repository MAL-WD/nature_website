import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText,
  ChevronRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { FolderService } from '../../services/folderService';
import FolderForm from './FolderForm';

interface FolderItem {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'pending';
  category: string;
  owner: string;
}

export default function Folders(): JSX.Element {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FolderService.getFolders();
      
      // Transform backend data to match FolderItem interface
      const transformedFolders: FolderItem[] = data.map((folder: any) => ({
        id: folder.id || folder._id,
        name: folder.name,
        description: folder.description || '',
        fileCount: folder.fileCount || 0,
        createdAt: folder.createdAt ? new Date(folder.createdAt).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'),
        updatedAt: folder.updatedAt ? new Date(folder.updatedAt).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'),
        status: folder.status || 'active',
        category: folder.category || '',
        owner: folder.createdBy || 'المستخدم'
      }));
      
      setFolders(transformedFolders);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل المجلدات');
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadFolders();
  };

  const categories = ['بناء', 'صناعة', 'زراعة', 'سياحة', 'تعدين', 'طاقة', 'مياه', 'نقل'];

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folder.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || folder.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || folder.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المجلد؟')) {
      return;
    }

    try {
      await FolderService.deleteFolder(id);
      setFolders(prev => prev.filter(folder => folder.id !== id));
      if (selectedFolder?.id === id) {
        setShowViewModal(false);
        setSelectedFolder(null);
      }
    } catch (err: any) {
      alert(err.message || 'فشل في حذف المجلد');
      console.error('Error deleting folder:', err);
    }
  };

  const handleView = (folder: FolderItem) => {
    setSelectedFolder(folder);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-green-700';
      case 'pending':
        return 'bg-yellow-500 text-yellow-700';
      case 'archived':
        return 'bg-gray-500 text-gray-700';
      default:
        return 'bg-blue-500 text-blue-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'pending':
        return 'في الانتظار';
      case 'archived':
        return 'مؤرشف';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ 
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 mb-3" style={{ color: '#076653' }}>
            📁 إدارة المجلدات
          </h1>
          <p className="text-h4 text-gray-600">
            تنظيم وإدارة مجلدات الملفات البيئية
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#076653' }} />
              <input
                type="text"
                placeholder="البحث في المجلدات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="pending">في الانتظار</option>
              <option value="archived">مؤرشف</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="all">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
            }}
          >
            <Plus size={20} />
            مجلد جديد
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={48} className="animate-spin" style={{ color: '#076653' }} />
          </div>
        )}

        {/* Folders Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="bg-white rounded-lg shadow-lg border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              style={{ borderColor: '#E3EF26' }}
              onClick={() => handleView(folder)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
                  >
                    <Folder size={24} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(folder.status)}`}>
                      {getStatusText(folder.status)}
                    </span>
                    <MoreHorizontal size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2" style={{ color: '#0C342C' }}>
                  {folder.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {folder.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText size={16} />
                    <span>{folder.fileCount} ملف</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>أنشئ في {folder.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#076653' }}>
                    {folder.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {folder.owner}
                  </span>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    آخر تحديث: {folder.updatedAt}
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && filteredFolders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 shadow-lg" style={{ borderColor: '#E3EF26' }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Folder size={48} className="text-gray-400" />
            </div>
            <h3 className="text-h3 text-gray-700 mb-3">لا توجد مجلدات</h3>
            <p className="text-body text-gray-500 mb-6">قم بإنشاء مجلد جديد للبدء في تنظيم ملفاتك</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
              }}
            >
              <Plus size={20} />
              إنشاء مجلد جديد
            </button>
          </div>
        )}
      </div>

      {/* Create Folder Form */}
      {showCreateForm && (
        <FolderForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* View Folder Modal */}
      {showViewModal && selectedFolder && (
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
                <h2 className="text-2xl font-bold text-white">تفاصيل المجلد</h2>
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
                  <h3 className="font-semibold mb-2" style={{ color: '#076653' }}>معلومات المجلد</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">اسم المجلد:</span>
                      <p className="font-medium">{selectedFolder.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">الوصف:</span>
                      <p className="font-medium">{selectedFolder.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">الفئة:</span>
                      <p className="font-medium">{selectedFolder.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">الحالة:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFolder.status)}`}>
                        {getStatusText(selectedFolder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#076653' }}>تفاصيل إضافية</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">عدد الملفات:</span>
                      <p className="font-medium">{selectedFolder.fileCount} ملف</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">المالك:</span>
                      <p className="font-medium">{selectedFolder.owner}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                      <p className="font-medium">{selectedFolder.createdAt}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">آخر تحديث:</span>
                      <p className="font-medium">{selectedFolder.updatedAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Handle edit
                      setShowViewModal(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#E3EF26', color: '#0C342C' }}
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedFolder.id);
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
    </div>
  );
}

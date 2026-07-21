import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Upload,
  Calendar,
  Building
} from 'lucide-react';

interface FileListProps {
  onCreateFile: () => void;
  onViewFile: (file: any) => void;
  onEditFile: (file: any) => void;
}

const FileList: React.FC<FileListProps> = ({ onCreateFile, onViewFile, onEditFile }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  
  const filesPerPage = 10;

  const statuses = [
    { value: 'مقبول', color: 'bg-green-500', textColor: 'text-green-700' },
    { value: 'تحفظ', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { value: 'مرفوض', color: 'bg-red-500', textColor: 'text-red-700' },
    { value: 'انتظار', color: 'bg-blue-500', textColor: 'text-blue-700' }
  ];

  // Mock data for demonstration - replace with actual data when available
  useEffect(() => {
    const mockFiles = [
      {
        id: 'FILE001',
        institution_name: 'شركة البناء الحديث',
        activity: 'بناء',
        classification: 'bechar',
        status: 'مقبول',
        deposit_date: '2024-01-15'
      },
      {
        id: 'FILE002',
        institution_name: 'مؤسسة الصناعات الخضراء',
        activity: 'صناعة',
        classification: 'abadlah',
        status: 'انتظار',
        deposit_date: '2024-01-18'
      }
    ];
    setFiles(mockFiles);
    setTotalFiles(mockFiles.length);
  }, []);

  // Filter files based on search and status
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      setFiles(prev => prev.filter(file => file.id !== id));
      setTotalFiles(prev => prev - 1);
    }
  };

  const totalPages = Math.ceil(totalFiles / filesPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#076653' }}>إدارة الملفات</h1>
          <p className="mt-2" style={{ color: '#0C342C' }}>عرض وإدارة جميع ملفات التصاريح البيئية</p>
        </div>
        <button
          onClick={onCreateFile}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
        >
          <Plus size={20} />
          ملف جديد
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#076653' }} />
            <input
              type="text"
              placeholder="البحث في الملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: '#076653' }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="all">جميع الحالات</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}>
              <th className="px-4 py-3 text-right text-white">رقم الملف</th>
              <th className="px-4 py-3 text-right text-white">اسم المؤسسة</th>
              <th className="px-4 py-3 text-right text-white">النشاط</th>
              <th className="px-4 py-3 text-right text-white">التصنيف</th>
              <th className="px-4 py-3 text-right text-white">الحالة</th>
              <th className="px-4 py-3 text-right text-white">تاريخ الإيداع</th>
              <th className="px-4 py-3 text-right text-white">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="mr-2">جاري التحميل...</span>
                  </div>
                </td>
              </tr>
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#0C342C' }}>
                  لا توجد ملفات مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredFiles.map((file, index) => (
                <tr 
                  key={file.id} 
                  style={{ 
                    background: index % 2 === 0 
                      ? 'linear-gradient(135deg, #FFFDEE 0%, #E3EF26 5%)' 
                      : 'rgba(255, 253, 238, 0.3)'
                  }}
                >
                  <td className="px-4 py-3 text-center font-mono text-sm" style={{ color: '#0C342C' }}>{file.id}</td>
                  <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.institution_name}</td>
                  <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.activity}</td>
                  <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.classification}</td>
                  <td className="px-4 py-3 text-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statuses.find(s => s.value === file.status)?.textColor}`} 
                      style={{ backgroundColor: `${statuses.find(s => s.value === file.status)?.color}20` }}
                    >
                      {file.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>
                    {new Date(file.deposit_date).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewFile(file)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="عرض"
                      >
                        <Eye size={16} style={{ color: '#076653' }} />
                      </button>
                      <button 
                        onClick={() => onEditFile(file)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="تعديل"
                      >
                        <Edit size={16} style={{ color: '#E3EF26' }} />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="حذف"
                      >
                        <Trash2 size={16} style={{ color: '#dc2626' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
            style={{ borderColor: '#E3EF26' }}
          >
            السابق
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page 
                  ? 'text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                borderColor: '#E3EF26',
                ...(currentPage === page && { background: '#076653' })
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
            style={{ borderColor: '#E3EF26' }}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default FileList;
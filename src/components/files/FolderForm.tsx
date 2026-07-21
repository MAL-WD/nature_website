import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FolderService } from '../../services/folderService';

interface FolderFormProps {
  onClose: () => void;
  onSuccess: () => void;
  parentId?: string | null;
}

const categories = ['بناء', 'صناعة', 'زراعة', 'سياحة', 'تعدين', 'طاقة', 'مياه', 'نقل'];

export default function FolderForm({ onClose, onSuccess, parentId }: FolderFormProps): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'active' as 'active' | 'archived' | 'pending',
    parentId: parentId || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError('اسم المجلد مطلوب');
        setLoading(false);
        return;
      }

      await FolderService.createFolder({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category || undefined,
        status: formData.status,
        parentId: formData.parentId
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء المجلد');
      console.error('Error creating folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-screen overflow-y-auto">
        <div 
          className="p-6 border-b sticky top-0 flex items-center justify-between"
          style={{ 
            background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)',
            borderColor: '#E3EF26'
          }}
        >
          <h2 className="text-2xl font-bold text-white">إنشاء مجلد جديد</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                اسم المجلد <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
                placeholder="أدخل اسم المجلد"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                الوصف
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200 resize-none"
                style={{ borderColor: '#E3EF26' }}
                placeholder="وصف المجلد (اختياري)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                  الفئة
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: '#076653' }}>
                  الحالة
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  <option value="active">نشط</option>
                  <option value="pending">في الانتظار</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#E3EF26', color: '#0C342C' }}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
              }}
              disabled={loading}
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء المجلد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





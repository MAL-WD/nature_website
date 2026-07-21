import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Building,
  MapPin,
  Phone,
  User,
  Calendar
} from 'lucide-react';

// Mock services and types for the artifact
const FileService = {
  createFile: async (data: any) => {
    console.log('Creating file:', data);
    return Promise.resolve();
  },
  updateFile: async (id: string, data: any) => {
    console.log('Updating file:', id, data);
    return Promise.resolve();
  }
};

const useAuthState = () => ({
  user: { id: 'user-123' }
});

interface EnvironmentalFile {
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
}

interface FileFormProps {
  file?: EnvironmentalFile;
  onClose: () => void;
  onSave: () => void;
}

const FileForm: React.FC<FileFormProps> = ({ file, onClose, onSave }) => {
  const { user } = useAuthState();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Initialize form data with proper default values
  const [formData, setFormData] = useState({
    deposit_date: '',
    send_date: '',
    send_time: '',
    status: 'انتظار' as const,
    file_content: 'دراسة تأثير',
    category: '',
    study_office: '',
    classification: '',
    activity: '',
    address: '',
    municipality: '',
    district: '',
    institution_type: 'public' as const,
    private_type: '',
    phone: '',
    institution_name: '',
    operator: '',
    created_by: user?.id || ''
  });

  const statuses = [
    { value: 'مقبول', color: 'bg-green-500', textColor: 'text-green-700' },
    { value: 'تحفظ', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { value: 'مرفوض', color: 'bg-red-500', textColor: 'text-red-700' },
    { value: 'انتظار', color: 'bg-blue-500', textColor: 'text-blue-700' }
  ];

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

  const activities = [
    'الصناعة', 'الزراعة', 'التعدين', 'البناء', 'السياحة', 'النقل', 'الطاقة', 'المياه'
  ];

  const categories = ['فئة أ', 'فئة ب', 'فئة ج', 'فئة د'];
  const privateTypes = ['شخص طبيعي', 'EURL', 'SPA', 'SARL'];

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Initialize form data when file prop changes
  useEffect(() => {
    if (file) {
      setFormData({
        deposit_date: file.deposit_date || '',
        send_date: file.send_date || '',
        send_time: file.send_time || '',
        status: file.status || 'انتظار',
        file_content: file.file_content || 'دراسة تأثير',
        category: file.category || '',
        study_office: file.study_office || '',
        classification: file.classification || '',
        activity: file.activity || '',
        address: file.address || '',
        municipality: file.municipality || '',
        district: file.district || '',
        institution_type: file.institution_type || 'public',
        private_type: file.private_type || '',
        phone: file.phone || '',
        institution_name: file.institution_name || '',
        operator: file.operator || '',
        created_by: file.created_by || user?.id || ''
      });
    }
  }, [file, user?.id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (file) {
        await FileService.updateFile(file.id, formData);
      } else {
        await FileService.createFile(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('حدث خطأ أثناء حفظ الملف');
    } finally {
      setLoading(false);
    }
  };

  // Memoized input component to prevent re-renders
  const TextInput = React.memo(({ 
    label, 
    value, 
    field, 
    placeholder, 
    type = 'text', 
    required = false,
    colSpan = false 
  }: {
    label: string;
    value: string;
    field: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    colSpan?: boolean;
  }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium mb-2 text-white">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
        style={{ borderColor: '#E3EF26' }}
        placeholder={placeholder}
        required={required}
      />
    </div>
  ));

  // Memoized select component
  const SelectInput = React.memo(({ 
    label, 
    value, 
    field, 
    options, 
    required = false,
    colSpan = false 
  }: {
    label: string;
    value: string;
    field: string;
    options: Array<{value: string, label: string}>;
    required?: boolean;
    colSpan?: boolean;
  }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium mb-2 text-white">{label}</label>
      <select
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
        style={{ borderColor: '#E3EF26' }}
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  ));

  const renderFormStep1 = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border-2 shadow-lg"
           style={{ 
             background: 'linear-gradient(135deg, #E2FBCE 0%, #076653 100%)', 
             borderColor: '#E3EF26'
           }}>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <FileText size={24} />
          معلومات الملف
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="تاريخ الإيداع"
            value={formData.deposit_date}
            field="deposit_date"
            type="date"
            required
          />
          
          <TextInput
            label="تاريخ الإرسال"
            value={formData.send_date}
            field="send_date"
            type="date"
          />
          
          <TextInput
            label="وقت الإرسال"
            value={formData.send_time}
            field="send_time"
            type="time"
          />
          
          <SelectInput
            label="الحالة"
            value={formData.status}
            field="status"
            options={statuses.map(s => ({value: s.value, label: s.value}))}
          />
          
          <SelectInput
            label="محتوى الملف"
            value={formData.file_content}
            field="file_content"
            options={[
              {value: 'دراسة تأثير', label: 'دراسة تأثير → دراسة خطر'},
              {value: 'موجز تأثير', label: 'موجز تأثير → تقرير مزاد الخطر'}
            ]}
            colSpan
          />
        </div>
      </div>
    </div>
  );

  const renderFormStep2 = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border-2 shadow-lg"
           style={{ 
             background: 'linear-gradient(135deg, #E2FBCE 0%, #076653 100%)', 
             borderColor: '#E3EF26'
           }}>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Building size={24} />
          المعلومات العامة الأساسية للمؤسسة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="الأصناف"
            value={formData.category}
            field="category"
            options={[{value: '', label: 'اختر الصنف'}, ...categories.map(c => ({value: c, label: c}))]}
            required
          />
          
          <TextInput
            label="مكتب الدراسات"
            value={formData.study_office}
            field="study_office"
            placeholder="اسم مكتب الدراسات"
          />
          
          <SelectInput
            label="خانة المنشأة"
            value={formData.classification}
            field="classification"
            
            // options={[
            //   {value: '', label: 'اختر التصنيف'}, 
            //   ...classifications.map(c => ({value: c.name, label: `${c.name} (${c.code})`}))
            // ]}
            required
          />
          
          <SelectInput
            label="النشاط"
            value={formData.activity}
            field="activity"
            options={[{value: '', label: 'اختر النشاط'}, ...activities.map(a => ({value: a, label: a}))]}
            required
          />
          
          <div className="md:col-span-2">
            <TextInput
              label="العنوان"
              value={formData.address}
              field="address"
              placeholder="العنوان الكامل"
              required
              colSpan
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <input
                type="text"
                value={formData.municipality}
                onChange={(e) => handleInputChange('municipality', e.target.value)}
                className="w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: '#E3EF26' }}
                placeholder="البلدية (اختياري)"
              />
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className="w-full p-2 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: '#E3EF26' }}
                placeholder="الدائرة (اختياري)"
              />
            </div>
          </div>
          
          <SelectInput
            label="نوع المؤسسة"
            value={formData.institution_type}
            field="institution_type"
            options={[
              {value: 'public', label: 'عامة'},
              {value: 'private', label: 'خاصة'}
            ]}
          />
          
          {formData.institution_type === 'private' && (
            <SelectInput
              label="نوع المؤسسة الخاصة"
              value={formData.private_type}
              field="private_type"
              options={[{value: '', label: 'اختر النوع'}, ...privateTypes.map(t => ({value: t, label: t}))]}
            />
          )}
          
          <TextInput
            label="الهاتف"
            value={formData.phone}
            field="phone"
            type="tel"
            placeholder="رقم الهاتف"
            required
          />
          
          <TextInput
            label="اسم المؤسسة"
            value={formData.institution_name}
            field="institution_name"
            placeholder="اسم المؤسسة"
            required
          />
          
          <TextInput
            label="المستغل"
            value={formData.operator}
            field="operator"
            placeholder="اسم المستغل"
            required
            colSpan
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="max-w-4xl w-full max-h-screen overflow-y-auto rounded-lg shadow-xl"
        style={{ background: 'linear-gradient(135deg, #FFFDEE 0%, #E3EF26 100%)' }}
      >
        <div 
          className="sticky top-0 p-6 border-b" 
          style={{ 
            background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)', 
            borderColor: '#E3EF26' 
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {file ? 'تعديل الملف' : 'إنشاء ملف جديد'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep ? 'bg-white text-green-600' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-white' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && renderFormStep1()}
          {currentStep === 2 && renderFormStep2()}
        </div>

        <div 
          className="sticky bottom-0 p-6 border-t flex justify-between" 
          style={{ 
            background: 'linear-gradient(135deg, #FFFDEE 0%, #E3EF26 100%)', 
            borderColor: '#076653' 
          }}
        >
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                style={{ borderColor: '#E3EF26', color: '#0C342C' }}
              >
                <ChevronLeft size={20} />
                السابق
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
              >
                التالي
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                {file ? 'حفظ التعديلات' : 'حفظ الملف'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileForm;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Bell, 
  User, 
  FileText, 
  Calendar, 
  MapPin, 
  Building,
  Phone,
  Activity,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';

// Type definitions
interface Agency {
  reference: string;
  status: string;
  date: string;
}

interface OperatingLicense {
  ministerSignature: boolean;
  governorSignature: boolean;
  mayorSignature: boolean;
  reference: string;
  date: string;
}

interface EnvironmentalFile {
  id: string;
  depositDate: string;
  sendDate: string;
  sendTime: string;
  status: string;
  fileContent: string;
  category: string;
  studyOffice: string;
  facilityCode?: string;
  activityType?: string;
  classification: string;
  activity: string;
  address: string;
  municipality: string;
  district: string;
  institutionType: string;
  privateType: string;
  phone: string;
  institutionName: string;
  operator: string;
  civilProtection: Agency;
  nationalGendarmerie: Agency;
  nationalSecurity: Agency;
  publicServices: Agency;
  irrigation: Agency;
  energyMines: Agency;
  industry: Agency;
  urbanization: Agency;
  municipalServices: Agency;
  nationalAgency: Agency;
  healthPopulation: Agency;
  insurance: Agency;
  publicInsurance: { reference: string; date: string };
  approval: { reference: string; date: string; status: string };
  establishment: { reference: string; date: string };
  operatingLicense: OperatingLicense;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: number;
  message: string;
  type: string;
  timestamp: string;
}

export default function EnvironmentalPermitSystem(): JSX.Element {
  // State Management
  const [currentView, setCurrentView] = useState('dashboard');
  const [files, setFiles] = useState<EnvironmentalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFile, setSelectedFile] = useState<EnvironmentalFile | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentUser] = useState({ name: 'Admin User', role: 'admin' });
  const { user } = useAuth();

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files`, { headers });
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `خطأ في تحميل الملفات: ${err.message}`,
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Document Upload UI State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetFileId, setUploadTargetFileId] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openUploadFor = (fileId: string) => {
    setUploadTargetFileId(fileId);
    setDocName('');
    setDocFile(null);
    setShowUploadModal(true);
  };

  const getBackendToken = async (): Promise<string | null> => {
    console.log('getBackendToken called');
    const existing = localStorage.getItem('backendToken');
    if (existing) {
      console.log('Found existing token in localStorage');
      return existing;
    }
    
    console.log('No token in localStorage, checking user:', user);
    if (!user?.id) {
      console.error('User ID missing in getBackendToken', user);
      return null;
    }

    try {
      console.log('Fetching token from /api/auth/token for user:', user.id);
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      console.log('Auth token response status:', resp.status);
      if (!resp.ok) {
        console.error('Auth token fetch failed');
        return null;
      }
      
      const data = await resp.json();
      if (data?.token) {
        console.log('Token received from backend');
        localStorage.setItem('backendToken', data.token);
        return data.token as string;
      }
    } catch (err) {
      console.error('Error fetching backend token:', err);
    }
    return null;
  };



  const handleDocumentUpload = async () => {
    if (!uploadTargetFileId) return;
    if (!docFile) {
      setNotifications(prev => ([...prev, { id: Date.now(), message: 'الرجاء اختيار ملف', type: 'error', timestamp: new Date().toISOString() }]));
      return;
    }
    const token = await getBackendToken();
    if (!token) {
      setNotifications(prev => ([...prev, { id: Date.now(), message: 'فشل التحقق من الهوية', type: 'error', timestamp: new Date().toISOString() }]));
      return;
    }
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('fileId', uploadTargetFileId);
      if (docName && docName.trim() !== '') form.append('name', docName.trim());
      form.append('file', docFile);
      const resp = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (!resp.ok) throw new Error('فشل رفع الوثيقة');
      const created = await resp.json();
      setNotifications(prev => ([...prev, { id: Date.now(), message: `تم رفع وثيقة: ${created.name}`, type: 'success', timestamp: new Date().toISOString() }]));
      setShowUploadModal(false);
    } catch (e: any) {
      setNotifications(prev => ([...prev, { id: Date.now(), message: e?.message || 'خطأ في رفع الوثيقة', type: 'error', timestamp: new Date().toISOString() }]));
    } finally {
      setIsUploading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    // Step 1 - File Information
    depositDate: '',
    sendDate: '',
    sendTime: '',
    status: 'انتظار',
    fileContent: 'دراسة تأثير',
    
    // Step 2 - Institution Information
    category: '',
    studyOffice: '',
    facilityCode: '',
    activityType: '',
    classification: '',
    activity: '',
    address: '',
    municipality: '',
    district: '',
    institutionType: 'public',
    privateType: '',
    phone: '',
    institutionName: '',
    operator: '',

    // Step 3 - Development Administration Agencies
    civilProtection: { reference: '', status: 'انتظار', date: '' },
    nationalGendarmerie: { reference: '', status: 'انتظار', date: '' },
    nationalSecurity: { reference: '', status: 'انتظار', date: '' },
    publicServices: { reference: '', status: 'انتظار', date: '' },
    irrigation: { reference: '', status: 'انتظار', date: '' },
    energyMines: { reference: '', status: 'انتظار', date: '' },
    industry: { reference: '', status: 'انتظار', date: '' },
    urbanization: { reference: '', status: 'انتظار', date: '' },
    municipalServices: { reference: '', status: 'انتظار', date: '' },
    nationalAgency: { reference: '', status: 'انتظار', date: '' },
    healthPopulation: { reference: '', status: 'انتظار', date: '' },
    insurance: { reference: '', status: 'انتظار', date: '' },

    // Step 4 - Public Insurance
    publicInsurance: { reference: '', date: '' },

    // Step 5 - Approval
    approval: { reference: '', date: '', status: 'انتظار' },

    // Step 6 - Establishment
    establishment: { reference: '', date: '' },

    // Step 7 - Operating License
    operatingLicense: { 
      ministerSignature: false, 
      governorSignature: false, 
      mayorSignature: false, 
      reference: '', 
      date: '' 
    }
  });

  // Handle form input changes with proper focus preservation
  const handleInputChange = (field: string, value: string | boolean, subField?: string) => {
    setFormData(prev => {
      if (subField) {
        const current: any = (prev as any)[field] || {};
        return {
          ...prev,
          [field]: { ...current, [subField]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Create stable handlers using useMemo to prevent focus loss
  const handlers = useMemo(() => {
    const createHandler = (field: string, subField?: string) => (
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : e.target.value;
        handleInputChange(field, value, subField);
      }
    );
    
    return {
      // Step 1 handlers
      depositDate: createHandler('depositDate'),
      sendDate: createHandler('sendDate'),
      sendTime: createHandler('sendTime'),
      status: createHandler('status'),
      fileContent: createHandler('fileContent'),
      
      // Step 2 handlers
      category: createHandler('category'),
      studyOffice: createHandler('studyOffice'),
      facilityCode: createHandler('facilityCode'),
      activityType: createHandler('activityType'),
      classification: createHandler('classification'),
      activity: createHandler('activity'),
      address: createHandler('address'),
      municipality: createHandler('municipality'),
      district: createHandler('district'),
      institutionType: createHandler('institutionType'),
      privateType: createHandler('privateType'),
      phone: createHandler('phone'),
      institutionName: createHandler('institutionName'),
      operator: createHandler('operator'),
      
      // Step 3 handlers - Agency fields
      civilProtectionRef: createHandler('civilProtection', 'reference'),
      civilProtectionStatus: createHandler('civilProtection', 'status'),
      civilProtectionDate: createHandler('civilProtection', 'date'),
      
      nationalGendarmerieRef: createHandler('nationalGendarmerie', 'reference'),
      nationalGendarmerieStatus: createHandler('nationalGendarmerie', 'status'),
      nationalGendarmerieDate: createHandler('nationalGendarmerie', 'date'),
      
      nationalSecurityRef: createHandler('nationalSecurity', 'reference'),
      nationalSecurityStatus: createHandler('nationalSecurity', 'status'),
      nationalSecurityDate: createHandler('nationalSecurity', 'date'),
      
      publicServicesRef: createHandler('publicServices', 'reference'),
      publicServicesStatus: createHandler('publicServices', 'status'),
      publicServicesDate: createHandler('publicServices', 'date'),
      
      irrigationRef: createHandler('irrigation', 'reference'),
      irrigationStatus: createHandler('irrigation', 'status'),
      irrigationDate: createHandler('irrigation', 'date'),
      
      energyMinesRef: createHandler('energyMines', 'reference'),
      energyMinesStatus: createHandler('energyMines', 'status'),
      energyMinesDate: createHandler('energyMines', 'date'),
      
      industryRef: createHandler('industry', 'reference'),
      industryStatus: createHandler('industry', 'status'),
      industryDate: createHandler('industry', 'date'),
      
      urbanizationRef: createHandler('urbanization', 'reference'),
      urbanizationStatus: createHandler('urbanization', 'status'),
      urbanizationDate: createHandler('urbanization', 'date'),
      
      municipalServicesRef: createHandler('municipalServices', 'reference'),
      municipalServicesStatus: createHandler('municipalServices', 'status'),
      municipalServicesDate: createHandler('municipalServices', 'date'),
      
      nationalAgencyRef: createHandler('nationalAgency', 'reference'),
      nationalAgencyStatus: createHandler('nationalAgency', 'status'),
      nationalAgencyDate: createHandler('nationalAgency', 'date'),
      
      healthPopulationRef: createHandler('healthPopulation', 'reference'),
      healthPopulationStatus: createHandler('healthPopulation', 'status'),
      healthPopulationDate: createHandler('healthPopulation', 'date'),
      
      insuranceRef: createHandler('insurance', 'reference'),
      insuranceStatus: createHandler('insurance', 'status'),
      insuranceDate: createHandler('insurance', 'date'),
      
      // Step 4 handlers
      publicInsuranceRef: createHandler('publicInsurance', 'reference'),
      publicInsuranceDate: createHandler('publicInsurance', 'date'),
      
      // Step 5 handlers
      approvalRef: createHandler('approval', 'reference'),
      approvalDate: createHandler('approval', 'date'),
      approvalStatus: createHandler('approval', 'status'),
      
      // Step 6 handlers
      establishmentRef: createHandler('establishment', 'reference'),
      establishmentDate: createHandler('establishment', 'date'),
      
      // Step 7 handlers
      operatingLicenseMinister: createHandler('operatingLicense', 'ministerSignature'),
      operatingLicenseGovernor: createHandler('operatingLicense', 'governorSignature'),
      operatingLicenseMayor: createHandler('operatingLicense', 'mayorSignature'),
      operatingLicenseRef: createHandler('operatingLicense', 'reference'),
      operatingLicenseDate: createHandler('operatingLicense', 'date'),
    };
  }, [handleInputChange]);

  // Constants
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

  // Map Arabic activity names to Latin initials for ID codes
  const activityCodeMap: Record<string, string> = {
    'الصناعة': 'I', // Industry
    'الزراعة': 'A', // Agriculture
    'التعدين': 'M', // Mining
    'البناء': 'B', // Building/Construction
    'السياحة': 'T', // Tourism
    'النقل': 'N',   // Transport
    'الطاقة': 'E',  // Energy
    'المياه': 'W'   // Water
  };

  const categories = ['فئة 1', 'فئة 2', 'فئة 3', 'فئة 4'];

  const privateTypes = ['شخص طبيعي', 'EURL', 'SPA', 'SARL'];

  // Generate File ID
  const generateFileId = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Use activityType field (free text) and take first character, or use activity dropdown if available
    let activityCode = 'X';
    if (formData.activityType && formData.activityType.trim()) {
      activityCode = formData.activityType.trim().charAt(0).toUpperCase();
    } else if (formData.activity) {
      activityCode = activityCodeMap[formData.activity] || 'X';
    }
    
    const classificationCode = classifications.find(c => c.name === formData.classification)?.code.toUpperCase() || 'XX';
    const fileNumber = String(files.length + 1).padStart(3, '0');
    
    return `${month}${year}${activityCode}-${classificationCode}-${fileNumber}`;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([...notifications, {
          id: Date.now(),
          message: 'يجب تسجيل الدخول أولاً',
          type: 'error',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      const url = selectedFile 
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files/${selectedFile.id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files`;
      
      const method = selectedFile ? 'PUT' : 'POST';
      
      const fileData = selectedFile 
        ? { ...formData, id: selectedFile.id, updatedAt: new Date().toISOString() }
        : { 
            id: generateFileId(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fileData)
      });

      if (!response.ok) throw new Error(selectedFile ? 'فشل تحديث الملف' : 'فشل إنشاء الملف');
      
      const result = await response.json();
      
      if (selectedFile) {
        setFiles(prev => prev.map(f => f.id === result.id ? result : f));
        setNotifications([...notifications, {
          id: Date.now(),
          message: `تم تحديث الملف: ${result.id}`,
          type: 'success',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setFiles([...files, result]);
        setNotifications([...notifications, {
          id: Date.now(),
          message: `تم إنشاء ملف جديد: ${result.id}`,
          type: 'success',
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Reset form and close modal on success
      setFormData({
        depositDate: '',
        sendDate: '',
        sendTime: '',
        status: 'انتظار',
        fileContent: 'دراسة تأثير',
        category: '',
        studyOffice: '',
        facilityCode: '',
        activityType: '',
        classification: '',
        activity: '',
        address: '',
        municipality: '',
        district: '',
        institutionType: 'public',
        privateType: '',
        phone: '',
        institutionName: '',
        operator: '',
        civilProtection: { reference: '', status: 'انتظار', date: '' },
        nationalGendarmerie: { reference: '', status: 'انتظار', date: '' },
        nationalSecurity: { reference: '', status: 'انتظار', date: '' },
        publicServices: { reference: '', status: 'انتظار', date: '' },
        irrigation: { reference: '', status: 'انتظار', date: '' },
        energyMines: { reference: '', status: 'انتظار', date: '' },
        industry: { reference: '', status: 'انتظار', date: '' },
        urbanization: { reference: '', status: 'انتظار', date: '' },
        municipalServices: { reference: '', status: 'انتظار', date: '' },
        nationalAgency: { reference: '', status: 'انتظار', date: '' },
        healthPopulation: { reference: '', status: 'انتظار', date: '' },
        insurance: { reference: '', status: 'انتظار', date: '' },
        publicInsurance: { reference: '', date: '' },
        approval: { reference: '', date: '', status: 'انتظار' },
        establishment: { reference: '', date: '' },
        operatingLicense: { 
          ministerSignature: false, 
          governorSignature: false, 
          mayorSignature: false, 
          reference: '', 
          date: '' 
        }
      });
      setSelectedFile(null);
      setShowCreateForm(false);
      setCurrentStep(1);
      
    } catch (error: any) {
      setNotifications([...notifications, {
        id: Date.now(),
        message: `خطأ: ${error.message}`,
        type: 'error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Dashboard table actions
  const handleView = (file: any) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleEdit = (file: any) => {
    setSelectedFile(file);
    setFormData({
      depositDate: file.depositDate || '',
      sendDate: file.sendDate || '',
      sendTime: file.sendTime || '',
      status: file.status || 'انتظار',
      fileContent: file.fileContent || 'دراسة تأثير',
      category: file.category || '',
      studyOffice: file.studyOffice || '',
      facilityCode: file.facilityCode || '',
      activityType: file.activityType || '',
      classification: file.classification || '',
      activity: file.activity || '',
      address: file.address || '',
      municipality: file.municipality || '',
      district: file.district || '',
      institutionType: file.institutionType || 'public',
      privateType: file.privateType || '',
      phone: file.phone || '',
      institutionName: file.institutionName || '',
      operator: file.operator || '',
      civilProtection: file.civilProtection || { reference: '', status: 'انتظار', date: '' },
      nationalGendarmerie: file.nationalGendarmerie || { reference: '', status: 'انتظار', date: '' },
      nationalSecurity: file.nationalSecurity || { reference: '', status: 'انتظار', date: '' },
      publicServices: file.publicServices || { reference: '', status: 'انتظار', date: '' },
      irrigation: file.irrigation || { reference: '', status: 'انتظار', date: '' },
      energyMines: file.energyMines || { reference: '', status: 'انتظار', date: '' },
      industry: file.industry || { reference: '', status: 'انتظار', date: '' },
      urbanization: file.urbanization || { reference: '', status: 'انتظار', date: '' },
      municipalServices: file.municipalServices || { reference: '', status: 'انتظار', date: '' },
      nationalAgency: file.nationalAgency || { reference: '', status: 'انتظار', date: '' },
      healthPopulation: file.healthPopulation || { reference: '', status: 'انتظار', date: '' },
      insurance: file.insurance || { reference: '', status: 'انتظار', date: '' },
      publicInsurance: file.publicInsurance || { reference: '', date: '' },
      approval: file.approval || { reference: '', date: '', status: 'انتظار' },
      establishment: file.establishment || { reference: '', date: '' },
      operatingLicense: file.operatingLicense || { 
        ministerSignature: false, 
        governorSignature: false, 
        mayorSignature: false, 
        reference: '', 
        date: '' 
      }
    });
    setShowCreateForm(true);
    setCurrentStep(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('فشل حذف الملف');

      setFiles((prev: any[]) => prev.filter((f) => f.id !== id));
      setNotifications(prev => ([
        ...prev,
        { id: Date.now(), message: `تم حذف الملف: ${id}`, type: 'info', timestamp: new Date().toISOString() }
      ]));
    } catch (error: any) {
      setNotifications(prev => ([
        ...prev,
        { id: Date.now(), message: `خطأ في الحذف: ${error.message}`, type: 'error', timestamp: new Date().toISOString() }
      ]));
    }
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = (file.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (file.institutionName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Form Steps Component
  const renderFormStep1 = () => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">📄 معلومات الملف</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-label mb-3 text-white font-medium">📅 تاريخ الإيداع</label>
            <input
              type="date"
              value={formData.depositDate}
              onChange={handlers.depositDate}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">📤 تاريخ الإرسال</label>
            <input
              type="date"
              value={formData.sendDate}
              onChange={(e) => handleInputChange('sendDate', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">⏰ وقت الإرسال</label>
            <input
              type="time"
              value={formData.sendTime}
              onChange={(e) => handleInputChange('sendTime', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">📊 الحالة</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.value}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-label mb-3 text-white font-medium">📄 محتوى الملف</label>
            <select
              value={formData.fileContent}
              onChange={(e) => handleInputChange('fileContent', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="دراسة تأثير">دراسة تأثير → دراسة خطر</option>
              <option value="موجز تأثير">موجز تأثير → تقرير مواد الخطر</option>
              <option value="دراسة الخطر">مراجعة البيئية - دراسة خطر</option>
              <option value="تقرير المواد الخطرة">مراجعة البيئية - تقرير المواد الخطرة</option>
              <option value="تقرير المواد الخطرة">مشروع - دراسة تأثير</option>
              <option value="تقرير المواد الخطرة">مشروع - موجز تأثير</option>
             
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep2 = () => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">🏢 المعلومات العامة الأساسية للمؤسسة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏷️ صنف الرخصة</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="">اختر الصنف</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏢 مكتب الدراسات</label>
            <input
              type="text"
              value={formData.studyOffice}
              onChange={(e) => handleInputChange('studyOffice', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اسم مكتب الدراسات"
            />
          </div>
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏢 خانة المنشأة</label>
            <input
              type="text"
              value={formData.facilityCode}
              onChange={(e) => handleInputChange('facilityCode', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اكتب الرمز الخانة  "
            />
          </div>
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏢  نوع النشاط</label>
            <input
              type="text"
              value={formData.activityType}
              onChange={(e) => handleInputChange('activityType', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اكتب النشاط الرئيسي  "
            />
          </div>
          
         
          
          {/* <div>
            <label className="block text-label mb-3 text-white font-medium">⚡ النشاط</label>
            <select
              value={formData.activity}
              onChange={(e) => handleInputChange('activity', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="">اختر النشاط</option>
              {activities.map(activity => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div> */}
          
          <div className="md:col-span-2">
            <label className="block text-label mb-3 text-white font-medium">📍 العنوان</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 mb-2 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="العنوان الكامل"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
              <label className="block text-label mb-3 text-white font-medium">🏛️ البلدية</label>
              <select
                value={formData.classification}
                onChange={(e) => handleInputChange('classification', e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
              >
                <option value="">اختر البلدية</option>
                {classifications.map(cls => (
                  <option key={cls.code} value={cls.name}>{cls.name} ({cls.code})</option>
                ))}
              </select>
            </div>
            <div>
            <label className="block text-label mb-3 text-white font-medium">🏢  الدائرة </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اكتب الدائرة هنا   "
            />
          </div>
            </div>
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏭 الطابع القانوني للمؤسسة</label>
            <select
              value={formData.institutionType}
              onChange={(e) => handleInputChange('institutionType', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              <option value="public">عامة</option>
              <option value="private">خاصة</option>
            </select>
          </div>
          
          {formData.institutionType === 'private' && (
            <div>
              <label className="block text-label mb-3 text-white font-medium">🏢 نوع المؤسسة الخاصة</label>
              <select
                value={formData.privateType}
                onChange={(e) => handleInputChange('privateType', e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
              >
                <option value="">اختر النوع</option>
                {privateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">📞 الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: '#E3EF26' }}
              placeholder="رقم الهاتف"
            />
          </div>
          
          <div>
            <label className="block text-label mb-3 text-white font-medium">🏢 اسم المؤسسة</label>
            <input
              type="text"
              value={formData.institutionName}
              onChange={(e) => handleInputChange('institutionName', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اسم المؤسسة"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-label mb-3 text-white font-medium">👤 المستغل</label>
            <input
              type="text"
              value={formData.operator}
              onChange={(e) => handleInputChange('operator', e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اسم المستغل"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep3 = useCallback(() => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">🏛️ الإدارة التنمية</h3>
        
        <div className="space-y-6">
          {/* Civil Protection */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الحماية المدنية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.civilProtection.reference}
                  onChange={(e) => handleInputChange('civilProtection', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.civilProtection.status}
                  onChange={(e) => handleInputChange('civilProtection', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.civilProtection.date}
                  onChange={(e) => handleInputChange('civilProtection', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* National Gendarmerie */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الدرك الوطني</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.nationalGendarmerie.reference}
                  onChange={(e) => handleInputChange('nationalGendarmerie', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.nationalGendarmerie.status}
                  onChange={(e) => handleInputChange('nationalGendarmerie', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.nationalGendarmerie.date}
                  onChange={(e) => handleInputChange('nationalGendarmerie', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* National Security */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الأمن الوطني</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.nationalSecurity.reference}
                  onChange={(e) => handleInputChange('nationalSecurity', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.nationalSecurity.status}
                  onChange={(e) => handleInputChange('nationalSecurity', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.nationalSecurity.date}
                  onChange={(e) => handleInputChange('nationalSecurity', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Public Services */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">المصالح العامة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.publicServices.reference}
                  onChange={(e) => handleInputChange('publicServices', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.publicServices.status}
                  onChange={(e) => handleInputChange('publicServices', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.publicServices.date}
                  onChange={(e) => handleInputChange('publicServices', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Irrigation */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الري</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.irrigation.reference}
                  onChange={(e) => handleInputChange('irrigation', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.irrigation.status}
                  onChange={(e) => handleInputChange('irrigation', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.irrigation.date}
                  onChange={(e) => handleInputChange('irrigation', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Energy and Mines */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الطاقة والمناجم</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.energyMines.reference}
                  onChange={(e) => handleInputChange('energyMines', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.energyMines.status}
                  onChange={(e) => handleInputChange('energyMines', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.energyMines.date}
                  onChange={(e) => handleInputChange('energyMines', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Industry */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الصناعة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.industry.reference}
                  onChange={(e) => handleInputChange('industry', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.industry.status}
                  onChange={(e) => handleInputChange('industry', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.industry.date}
                  onChange={(e) => handleInputChange('industry', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Urbanization */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">التعمير والهندسة المعمارية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.urbanization.reference}
                  onChange={(e) => handleInputChange('urbanization', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.urbanization.status}
                  onChange={(e) => handleInputChange('urbanization', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.urbanization.date}
                  onChange={(e) => handleInputChange('urbanization', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Municipal Services */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">مصالح البلدية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.municipalServices.reference}
                  onChange={(e) => handleInputChange('municipalServices', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.municipalServices.status}
                  onChange={(e) => handleInputChange('municipalServices', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.municipalServices.date}
                  onChange={(e) => handleInputChange('municipalServices', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* National Agency */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الوكالة الوطنية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.nationalAgency.reference}
                  onChange={(e) => handleInputChange('nationalAgency', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.nationalAgency.status}
                  onChange={(e) => handleInputChange('nationalAgency', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.nationalAgency.date}
                  onChange={(e) => handleInputChange('nationalAgency', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Health and Population */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الصحة والسكان</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.healthPopulation.reference}
                  onChange={(e) => handleInputChange('healthPopulation', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.healthPopulation.status}
                  onChange={(e) => handleInputChange('healthPopulation', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.healthPopulation.date}
                  onChange={(e) => handleInputChange('healthPopulation', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">التأمين والشؤون العامة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">المرجع نص</label>
                <input
                  type="text"
                  value={formData.insurance.reference}
                  onChange={(e) => handleInputChange('insurance', e.target.value, 'reference')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="نص المرجع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">الحالة</label>
                <select
                  value={formData.insurance.status}
                  onChange={(e) => handleInputChange('insurance', e.target.value, 'status')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">تاريخ المرجع</label>
                <input
                  type="date"
                  value={formData.insurance.date}
                  onChange={(e) => handleInputChange('insurance', e.target.value, 'date')}
                  className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                  style={{ borderColor: '#E3EF26' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [formData, handleInputChange, statuses]);

  const renderFormStep4 = useCallback(() => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">🛡️ التأمين العمومي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">المرجع</label>
            <input
              type="text"
              value={formData.publicInsurance.reference}
              onChange={(e) => handleInputChange('publicInsurance', e.target.value, 'reference')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="نص المرجع"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">تاريخه</label>
            <input
              type="date"
              value={formData.publicInsurance.date}
              onChange={(e) => handleInputChange('publicInsurance', e.target.value, 'date')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
        </div>
      </div>
    </div>
  ), [handleInputChange]);

  const renderFormStep5 = useCallback(() => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">✅ الموافقة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">المرجع</label>
            <input
              type="text"
              value={formData.approval.reference}
              onChange={(e) => handleInputChange('approval', e.target.value, 'reference')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="نص المرجع"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">تاريخه</label>
            <input
              type="date"
              value={formData.approval.date}
              onChange={(e) => handleInputChange('approval', e.target.value, 'date')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">حالته</label>
            <select
              value={formData.approval.status}
              onChange={(e) => handleInputChange('approval', e.target.value, 'status')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.value}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  ), [handleInputChange, statuses]);

  const renderFormStep6 = useCallback(() => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">🏗️ الإنشاء</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">المرجع</label>
            <input
              type="text"
              value={formData.establishment.reference}
              onChange={(e) => handleInputChange('establishment', e.target.value, 'reference')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
              placeholder="نص المرجع"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white">تاريخه</label>
            <input
              type="date"
              value={formData.establishment.date}
              onChange={(e) => handleInputChange('establishment', e.target.value, 'date')}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
              style={{ borderColor: '#E3EF26' }}
            />
          </div>
        </div>
      </div>
    </div>
  ), [formData, handleInputChange]);

  const renderFormStep7 = useCallback(() => (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border-2 shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, #0C342C 0%, #076653 100%)', 
          borderColor: '#E3EF26'
        }}
      >
        <h3 className="text-h3 mb-6 pb-3 border-b-2 border-white border-opacity-30 text-white">📜 رخصة الاشغال</h3>
        
        <div className="space-y-6">
          {/* Signatures */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">الامضاء من قبل</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.operatingLicense.ministerSignature}
                  onChange={(e) => handleInputChange('operatingLicense', e.target.checked, 'ministerSignature')}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-sm font-medium text-white">الوزير</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.operatingLicense.governorSignature}
                  onChange={(e) => handleInputChange('operatingLicense', e.target.checked, 'governorSignature')}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-sm font-medium text-white">الوالي</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.operatingLicense.mayorSignature}
                  onChange={(e) => handleInputChange('operatingLicense', e.target.checked, 'mayorSignature')}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-sm font-medium text-white">رئيس البلدية</label>
              </div>
            </div>
          </div>

          {/* Reference and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">المرجع</label>
              <input
                type="text"
                value={formData.operatingLicense.reference}
                onChange={(e) => handleInputChange('operatingLicense', e.target.value, 'reference')}
                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
                placeholder="نص المرجع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">التاريخ</label>
              <input
                type="date"
                value={formData.operatingLicense.date}
                onChange={(e) => handleInputChange('operatingLicense', e.target.value, 'date')}
                className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 bg-white transition-all duration-200"
                style={{ borderColor: '#E3EF26' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [formData, handleInputChange]);

  // Handle Document Generation
  const handleCreateDocument = async (fileId: string) => {
    console.log('handleCreateDocument called with id:', fileId);
    try {
      const token = await getBackendToken();
      console.log('Token obtained:', !!token);
      
      if (!token) {
        setNotifications(prev => ([...prev, { id: Date.now(), message: 'فشل التحقق من الهوية', type: 'error', timestamp: new Date().toISOString() }]));
        return;
      }

      setNotifications(prev => ([...prev, { id: Date.now(), message: 'جاري إنشاء الوثيقة...', type: 'info', timestamp: new Date().toISOString() }]));

      console.log('Fetching document from:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files/${fileId}/document`);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/environmental-files/${fileId}/document`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('فشل إنشاء الوثيقة');
      }

      const blob = await response.blob();
      console.log('Blob received, size:', blob.size);
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file-${fileId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotifications(prev => ([...prev, { id: Date.now(), message: 'تم إنشاء الوثيقة بنجاح', type: 'success', timestamp: new Date().toISOString() }]));

    } catch (error: any) {
      console.error('Error in handleCreateDocument:', error);
      setNotifications(prev => ([...prev, { id: Date.now(), message: `خطأ: ${error.message}`, type: 'error', timestamp: new Date().toISOString() }]));
    }
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-6 rounded-2xl shadow-sm border border-white/60 backdrop-blur-sm">
        <div>
          <h1 className="text-h1 mb-2 text-[#076653]">نظام إدارة رخص المؤسسات المصنفة لحماية البيئة</h1>
          <p className="text-body text-gray-600 font-medium">إدارة ومتابعة طلبات التصاريح البيئية</p>
        </div>
        <div className="flex items-center gap-6 bg-white/80 py-2 px-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell size={22} className="text-[#076653]" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -end-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <div className="bg-[#E3EF26]/20 p-2 rounded-full">
              <User size={20} className="text-[#076653]" />
            </div>
            <span className="text-[#0C342C] font-semibold text-lg">{user?.name || 'المستخدم'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statuses.map((status, index) => {
          let Icon = FileText;
          let gradient = 'linear-gradient(135deg, #076653 0%, #0C342C 100%)';
          
          switch(status.value) {
            case 'مقبول':
              Icon = CheckCircle;
              gradient = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
              break;
            case 'انتظار':
              Icon = Clock;
              gradient = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
              break;
            case 'مرفوض':
              Icon = XCircle;
              gradient = 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)';
              break;
            case 'تحفظ':
              Icon = AlertCircle;
              gradient = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
              break;
          }

          return (
            <div 
              key={status.value} 
              className="p-6 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              style={{ background: gradient, color: '#FFFFFF' }}
            >
              <div className="absolute -end-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-white/80 font-medium mb-1 text-lg">{status.value}</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {files.filter(f => f.status === status.value).length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-md shadow-inner">
                  <Icon size={28} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/40 p-4 rounded-xl border border-white/60">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={20} className="absolute start-4 top-1/2 transform -translate-y-1/2 text-[#076653]" />
            <input
              type="text"
              placeholder="البحث في الملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-11 pe-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#076653]/10 transition-all bg-white/80"
              style={{ borderColor: 'rgba(7, 102, 83, 0.2)' }}
            />
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-2 rounded-xl border-2 transition-all hover:border-[#076653]/50" style={{ borderColor: 'rgba(7, 102, 83, 0.2)' }}>
            <Filter size={20} className="text-[#076653] ms-2" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2.5 pe-8 ps-2 focus:outline-none bg-transparent font-medium text-gray-700 cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.value}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 text-[#0C342C] font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-md active:scale-95"
          style={{ background: 'linear-gradient(135deg, #E3EF26 0%, #D4E015 100%)' }}
        >
          <Plus size={22} className="text-[#0C342C]" />
          ملف جديد
        </button>
      </div>

      {/* Files Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg">
          <thead>
            <tr style={{ 
              background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)'
            }}>
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
            {filteredFiles.map((file, index) => (
              <tr 
                key={file.id} 
                className={`transition-colors duration-150 hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-3 text-center font-mono text-sm" style={{ color: '#0C342C' }}>{file.id}</td>
                <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.institutionName}</td>
                <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.activityType || file.activity}</td>
                <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.classification}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statuses.find(s => s.value === file.status)?.textColor}`} 
                        style={{ backgroundColor: `${statuses.find(s => s.value === file.status)?.color}20` }}>
                    {file.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center" style={{ color: '#0C342C' }}>{file.depositDate}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110" 
                      onClick={() => handleView(file)} 
                      title="عرض"
                      style={{ 
                        backgroundColor: 'rgba(7, 102, 83, 0.1)',
                        border: '1px solid rgba(7, 102, 83, 0.3)'
                      }}
                    >
                      <Eye size={18} style={{ color: '#076653' }} />
                    </button>
                    <button 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110" 
                      onClick={() => handleEdit(file)} 
                      title="تعديل"
                      style={{ 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <Edit size={18} style={{ color: '#f59e0b' }} />
                    </button>
                    <button 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110" 
                      onClick={() => {
                        console.log('Button clicked for file:', file.id);
                        handleCreateDocument(file.id);
                      }} 
                      title="إنشاء وثيقة"
                      style={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <FileText size={18} style={{ color: '#3b82f6' }} />
                    </button>
                    <button 
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110" 
                      onClick={() => handleDelete(file.id)} 
                      title="حذف"
                      style={{ 
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        border: '1px solid rgba(220, 38, 38, 0.3)'
                      }}
                    >
                      <Trash2 size={18} style={{ color: '#dc2626' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFiles.length === 0 && (
          <div className="text-center py-8" style={{ color: '#0C342C' }}>
            لا توجد ملفات مطابقة للبحث
          </div>
        )}
      </div>
    </div>
  );

  // Create Form Modal
  const renderCreateFormModal = () => (
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
            <h2 className="text-2xl font-bold text-white">إنشاء ملف جديد</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSelectedFile(null); // Clear selection on close
                setCurrentStep(1);
              }}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 space-x-2 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep ? 'bg-white text-green-600' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 7 && (
                  <div className={`w-8 h-1 mx-1 ${
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
          {currentStep === 3 && renderFormStep3()}
          {currentStep === 4 && renderFormStep4()}
          {currentStep === 5 && renderFormStep5()}
          {currentStep === 6 && renderFormStep6()}
          {currentStep === 7 && renderFormStep7()}
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
            {currentStep < 7 ? (
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
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
              >
                <Save size={20} />
                حفظ الملف
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // View File Modal
  const renderViewFileModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-screen overflow-y-auto">
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
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedFile && (
            <div className="space-y-8">
              {/* File Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  📄 معلومات الملف
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">رقم الملف</label>
                    <p className="text-h4 font-mono" style={{ color: '#0C342C' }}>{selectedFile.id}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">تاريخ الإيداع</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.depositDate}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">تاريخ الإرسال</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.sendDate}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">وقت الإرسال</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.sendTime}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">الحالة</label>
                    <span className={`px-4 py-2 rounded-full text-label font-medium ${statuses.find(s => s.value === selectedFile.status)?.textColor}`} 
                          style={{ backgroundColor: `${statuses.find(s => s.value === selectedFile.status)?.color}20` }}>
                      {selectedFile.status}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">محتوى الملف</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.fileContent}</p>
                  </div>
                </div>
              </div>

              {/* Institution Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  🏢 معلومات المؤسسة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">اسم المؤسسة</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.institutionName}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">النشاط</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.activity || selectedFile.activityType}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-label text-gray-600 mb-2">التصنيف</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.classification}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">الفئة</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.category}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">العنوان</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.address}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">البلدية</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.municipality}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">الدائرة</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.district}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">الهاتف</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.phone}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">المستغل</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.operator}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">مكتب الدراسات</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.studyOffice}</p>
                  </div>
                </div>
              </div>

              {/* Development Administration Agencies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  🏛️ إدارات التنمية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'الحماية المدنية', data: selectedFile.civilProtection },
                    { label: 'الدرك الوطني', data: selectedFile.nationalGendarmerie },
                    { label: 'الأمن الوطني', data: selectedFile.nationalSecurity },
                    { label: 'المصالح العمومية', data: selectedFile.publicServices },
                    { label: 'الري', data: selectedFile.irrigation },
                    { label: 'الطاقة والمناجم', data: selectedFile.energyMines },
                    { label: 'الصناعة', data: selectedFile.industry },
                    { label: 'التعمير', data: selectedFile.urbanization },
                    { label: 'المصالح البلدية', data: selectedFile.municipalServices },
                    { label: 'الوكالة الوطنية', data: selectedFile.nationalAgency },
                    { label: 'الصحة والسكان', data: selectedFile.healthPopulation },
                    { label: 'التأمينات', data: selectedFile.insurance }
                  ].map((agency, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                      <label className="text-label text-gray-600 mb-2 block font-semibold">{agency.label}</label>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">المرجع:</span> <span style={{ color: '#0C342C' }}>{agency.data?.reference || '-'}</span></p>
                        <p><span className="text-gray-500">الحالة:</span> <span className={`px-2 py-1 rounded ${statuses.find(s => s.value === agency.data?.status)?.textColor}`}>{agency.data?.status || '-'}</span></p>
                        <p><span className="text-gray-500">التاريخ:</span> <span style={{ color: '#0C342C' }}>{agency.data?.date || '-'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public Insurance */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  🛡️ التأمين العمومي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">المرجع</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.publicInsurance?.reference || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">التاريخ</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.publicInsurance?.date || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Approval */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  ✅ الموافقة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">المرجع</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.approval?.reference || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">التاريخ</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.approval?.date || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">الحالة</label>
                    <span className={`px-4 py-2 rounded-full text-label font-medium ${statuses.find(s => s.value === selectedFile.approval?.status)?.textColor}`}>
                      {selectedFile.approval?.status || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Establishment */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  🏗️ الإنشاء
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">المرجع</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.establishment?.reference || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">التاريخ</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.establishment?.date || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Operating License */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-h3 mb-6 pb-3 border-b-2" style={{ color: '#076653', borderColor: '#E3EF26' }}>
                  📜 رخصة الاستغلال
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">المرجع</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.operatingLicense?.reference || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="text-label text-gray-600 mb-2 block">التاريخ</label>
                    <p className="text-h4" style={{ color: '#0C342C' }}>{selectedFile.operatingLicense?.date || '-'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 md:col-span-2">
                    <label className="text-label text-gray-600 mb-2 block">التوقيعات</label>
                    <div className="flex gap-4 flex-wrap">
                      <span className={`px-3 py-1 rounded ${selectedFile.operatingLicense?.ministerSignature ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {selectedFile.operatingLicense?.ministerSignature ? '✓' : '✗'} الوزير
                      </span>
                      <span className={`px-3 py-1 rounded ${selectedFile.operatingLicense?.governorSignature ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {selectedFile.operatingLicense?.governorSignature ? '✓' : '✗'} الوالي
                      </span>
                      <span className={`px-3 py-1 rounded ${selectedFile.operatingLicense?.mayorSignature ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {selectedFile.operatingLicense?.mayorSignature ? '✓' : '✗'} رئيس البلدية
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedFile) {
                    handleEdit(selectedFile);
                    setShowViewModal(false);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#E3EF26', color: '#0C342C' }}
              >
                <Edit size={20} />
                تعديل
              </button>
              <button
                onClick={() => {
                  if (selectedFile) {
                    handleDelete(selectedFile.id);
                    setShowViewModal(false);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Upload Document Modal
  const renderUploadDocumentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div 
          className="p-6 border-b"
          style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)', borderColor: '#E3EF26' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">رفع وثيقة</h2>
            <button onClick={() => setShowUploadModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#0C342C' }}>الملف</label>
            <input
              type="file"
              onChange={(e) => setDocFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#0C342C' }}>اسم الوثيقة</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: '#E3EF26' }}
              placeholder="اسم قابل للقراءة"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-2" style={{ borderColor: '#076653' }}>
          <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 border rounded-lg" style={{ borderColor: '#E3EF26', color: '#0C342C' }}>إلغاء</button>
          <button
            onClick={handleDocumentUpload}
            disabled={isUploading}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
          >{isUploading ? 'جاري الرفع...' : 'رفع'}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto">
        <Dashboard />
        {showCreateForm && renderCreateFormModal()}
        {showViewModal && renderViewFileModal()}
        {showUploadModal && renderUploadDocumentModal()}
      </div>
    </div>
  );
}

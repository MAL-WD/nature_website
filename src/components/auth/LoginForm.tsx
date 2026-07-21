import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isRegistering) {
      result = await signUp(email, password, { name });
    } else {
      result = await signIn(email, password);
    }

    if (result.error) {
      setError(result.error.message || (isRegistering ? 'فشل إنشاء الحساب' : 'فشل تسجيل الدخول'));
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)'
    }}>
      <div className="max-w-md w-full mx-4">
        <div
          className="p-8 rounded-lg shadow-xl border-2"
          style={{
            background: 'linear-gradient(135deg, #E2FBCE 0%, #076653 100%)',
            borderColor: '#E3EF26'
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-200 mt-2">نظام إدارة تصاريح البيئة الصحية</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ borderColor: '#E3EF26' }}
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <User size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white"
                  style={{ borderColor: '#E3EF26' }}
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #076653 0%, #06231D 100%)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  {isRegistering ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-white hover:underline focus:outline-none"
            >
              {isRegistering
                ? 'لديك حساب بالفعل؟ تسجيل الدخول'
                : 'ليس لديك حساب؟ إنشاء حساب جديد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

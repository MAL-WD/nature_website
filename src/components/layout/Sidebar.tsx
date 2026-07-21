import React from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout, user }) => {
  const { unreadCount, isAuthenticated } = useNotifications();

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'files', label: 'الملفات', icon: FileText },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, showBadge: true },
    { id: 'users', label: 'المستخدمين', icon: Users, adminOnly: true },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div 
      className="w-64 h-screen shadow-2xl border-e relative flex flex-col"
      style={{ 
        background: 'linear-gradient(180deg, #0C342C 0%, #076653 100%)',
        borderColor: 'rgba(255,255,255,0.1)'
      }}
    >
      <div className="p-6 border-b border-white/10 flex flex-col items-center justify-center pt-8">
        <h2 className="text-h2 text-white">نظام البيئة</h2>
        <p className="text-sm text-[#E3EF26] mt-1 font-medium">إدارة التصاريح</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ background: '#E3EF26' }}>
            <User size={24} style={{ color: '#076653' }} />
          </div>
          <div>
            <p className="text-white font-medium text-lg">{user?.name || 'المستخدم'}</p>
            <p className="text-xs text-[#E3EF26] opacity-90 font-medium px-2 py-0.5 rounded-full bg-white/10 inline-block mt-1">
              {user?.role === 'admin' ? 'مدير' : 'موظف'}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'text-[#0C342C] shadow-md font-semibold transform scale-[1.02]' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:translate-x-[-4px]'
                }`}
                style={isActive ? { background: '#E3EF26' } : {}}
              >
                <Icon size={22} className={isActive ? 'text-[#076653]' : ''} />
                <span className="text-base">{item.label}</span>
                {item.showBadge && isAuthenticated && unreadCount > 0 && (
                  <span className="absolute start-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-100 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
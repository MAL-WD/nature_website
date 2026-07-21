import { type FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.tsx';
import Sidebar from './Sidebar';

const AppLayout: FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    navigate(`/${view}`);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Extract current view from pathname
  const currentView = location.pathname.slice(1) || 'dashboard';

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E0E7FF 100%)'
    }}>
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

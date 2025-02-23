import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Swords,
  Medal,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  Gamepad2,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
  { name: 'Teams', href: '/admin/teams', icon: Users },
  { name: 'Registrations', href: '/admin/registrations', icon: UserPlus },
  { name: 'Matches', href: '/admin/matches', icon: Swords },
  { name: 'Leaderboard', href: '/admin/leaderboard', icon: Medal },
  { name: 'Results', href: '/admin/results', icon: Star },
  { name: 'Featured Games', href: '/admin/featured-games', icon: Gamepad2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { session, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 border-b">
            <div className="flex items-center justify-between">
              <Trophy className="h-8 w-8 text-purple-600" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">Tournament Admin</h1>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

<div className="p-4 border-t">
  <div className="relative">
    <button
      onClick={() => setUserMenuOpen(!userMenuOpen)}
      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {session?.user?.user_metadata?.avatar_url ? (
        <img
          src={session.user.user_metadata.avatar_url}
          alt=""
          className="h-8 w-8 rounded-full mr-3 object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
          <Users className="h-4 w-4 text-purple-600" />
        </div>
      )}
      <span className="flex-1 text-left">
        {session?.user?.user_metadata?.full_name || session?.user?.email}
      </span>
      <ChevronDown className="h-5 w-5 text-gray-400" />
    </button>

    {userMenuOpen && (
      <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign out
        </button>
      </div>
    )}
  </div>
</div>

        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[280px] min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
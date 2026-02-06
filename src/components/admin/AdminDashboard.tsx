import { useState, useEffect } from 'react';
import { 
  Users, 
  Dumbbell, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Activity,
  AlertCircle,
  Home,
  Menu,
  X
} from 'lucide-react';
import { AdminHome } from './AdminHome';
import { AthleteManagement } from './AthleteManagement';
import { ExerciseAssignment } from './ExerciseAssignment';
import { ContractManagement } from './ContractManagement';
import { ProgramManagement } from './ProgramManagement';
import { SystemDebug } from './SystemDebug';
import { LogoUpload } from './LogoUpload';
import { projectId } from '../../utils/supabase/info';
import logo from 'figma:asset/77156f911092fcfd68f4fc3bdb99d1157f1b817d.png';

type Tab = 'overview' | 'athletes' | 'programs' | 'exercises' | 'contracts' | 'messages' | 'analytics' | 'settings' | 'debug';

interface AdminDashboardProps {
  user: any;
  onSignOut: () => void;
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  // Initialize activeTab from URL hash or default to 'overview'
  const getInitialTab = (): Tab => {
    const hash = window.location.hash.replace('#', '');
    const validTabs: Tab[] = ['overview', 'athletes', 'programs', 'exercises', 'contracts', 'messages', 'analytics', 'settings', 'debug'];
    return validTabs.includes(hash as Tab) ? (hash as Tab) : 'overview';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore tab from URL hash on mount and listen for hash changes
  useEffect(() => {
    const updateTabFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: Tab[] = ['overview', 'athletes', 'programs', 'exercises', 'contracts', 'messages', 'analytics', 'settings', 'debug'];
      if (validTabs.includes(hash as Tab)) {
        setActiveTab(hash as Tab);
      } else if (!hash) {
        // If no hash, default to overview but don't update URL
        setActiveTab('overview');
      }
    };

    // Set initial tab from hash
    updateTabFromHash();

    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', updateTabFromHash);

    return () => {
      window.removeEventListener('hashchange', updateTabFromHash);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signout`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      onSignOut();
    }
  };

  const tabs: { id: Tab, label: string, icon: any }[] = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'athletes', label: 'Athletes', icon: Users },
    { id: 'programs', label: 'Programs', icon: Activity },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'debug', label: 'Debug', icon: AlertCircle },
  ];

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    // Update URL hash to persist tab on refresh
    window.location.hash = tabId;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
        <img src={logo} alt="AFSP" className="h-8" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative inset-0 z-40 md:z-0
        w-64 bg-gray-900 border-r border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 -z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="p-6 border-b border-white/10 hidden md:block">
          <img src={logo} alt="AFSP" className="h-10 mb-2" />
          <p className="text-gray-400 text-sm mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'overview' && <AdminHome user={user} />}
        {activeTab === 'athletes' && <AthleteManagement user={user} />}
        {activeTab === 'programs' && <ProgramManagement user={user} />}
        {activeTab === 'exercises' && <ExerciseAssignment user={user} />}
        {activeTab === 'contracts' && <ContractManagement user={user} />}
        {activeTab === 'settings' && (
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
            <LogoUpload accessToken={localStorage.getItem('accessToken') || ''} />
          </div>
        )}
        {activeTab === 'debug' && <SystemDebug user={user} />}
      </main>
    </div>
  );
}
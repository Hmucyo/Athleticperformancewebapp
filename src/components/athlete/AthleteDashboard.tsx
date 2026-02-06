import { Home, MessageSquare, BookOpen, Dumbbell, User, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardHome } from "./DashboardHome";
import { ChatTab } from "./ChatTab";
import { JournalTab } from "./JournalTab";
import { ProgramsTab } from "./ProgramsTab";
import { ProfileTab } from "./ProfileTab";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import logo from "figma:asset/77156f911092fcfd68f4fc3bdb99d1157f1b817d.png";

interface AthleteDashboardProps {
  user: any;
  onSignOut: () => void;
}

export function AthleteDashboard({ user, onSignOut }: AthleteDashboardProps) {
  // Initialize activeTab from URL hash or default to 'home'
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['home', 'chat', 'journal', 'programs', 'profile'];
    return validTabs.includes(hash) ? hash : 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore tab from URL hash on mount and listen for hash changes
  useEffect(() => {
    const updateTabFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'chat', 'journal', 'programs', 'profile'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        // If no hash, default to home but don't update URL
        setActiveTab('home');
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
      // Still clear local storage even if request fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      onSignOut();
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'programs', label: 'Programs', icon: Dumbbell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabChange = (tabId: string) => {
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
        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 -z-10"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="p-6 border-b border-white/10 hidden md:block">
          <img src={logo} alt="AFSP" className="h-10 mb-2" />
          <p className="text-gray-400 text-sm mt-1">Athlete Portal</p>
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
        {activeTab === 'home' && <DashboardHome user={user} />}
        {activeTab === 'chat' && <ChatTab user={user} />}
        {activeTab === 'journal' && <JournalTab user={user} />}
        {activeTab === 'programs' && <ProgramsTab user={user} />}
        {activeTab === 'profile' && <ProfileTab user={user} />}
      </main>
    </div>
  );
}
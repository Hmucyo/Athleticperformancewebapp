import { Home, Users, Dumbbell, Calendar, LogOut, Menu, X, FileText } from "lucide-react";
import { useState } from "react";
import { AdminHome } from "./AdminHome";
import { AthleteManagement } from "./AthleteManagement";
import { ExerciseAssignment } from "./ExerciseAssignment";
import { ContractManagement } from "./ContractManagement";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import logo from "figma:asset/77156f911092fcfd68f4fc3bdb99d1157f1b817d.png";

interface AdminDashboardProps {
  user: any;
  onSignOut: () => void;
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'athletes', label: 'Athletes', icon: Users },
    { id: 'exercises', label: 'Exercises', icon: Dumbbell },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'contracts', label: 'Contracts', icon: FileText },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
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
        {activeTab === 'home' && <AdminHome user={user} />}
        {activeTab === 'athletes' && <AthleteManagement user={user} />}
        {activeTab === 'exercises' && <ExerciseAssignment user={user} />}
        {activeTab === 'calendar' && (
          <div className="p-8">
            <h1 className="text-white text-4xl font-bold mb-2">Calendar</h1>
            <p className="text-gray-400 mb-8">Manage schedules and bookings</p>
            <div className="bg-gray-900 border border-white/10 rounded-lg p-8 text-center">
              <p className="text-gray-400">Calendar feature coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'contracts' && <ContractManagement user={user} />}
      </main>
    </div>
  );
}
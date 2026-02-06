import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Programs } from "./components/Programs";
import { Metrics } from "./components/Metrics";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Navigation } from "./components/Navigation";
import { AuthModal } from "./components/AuthModal";
import { AthleteDashboard } from "./components/athlete/AthleteDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminLogin } from "./components/admin/AdminLogin";
import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    checkSession();
    
    // Listen for URL changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const checkSession = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        // Verify session is still valid
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/session`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Session invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData: any, accessToken: string) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleAdminLoginSuccess = (userData: any, accessToken: string) => {
    setUser(userData);
    // Stay on /admin path
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    
    // If admin, redirect to admin login
    if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
      window.history.pushState({}, '', '/admin');
      setCurrentPath('/admin');
    } else {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Admin Portal Route
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    if (user && user.role === 'admin') {
      return <AdminDashboard user={user} onSignOut={handleSignOut} />;
    } else {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
    }
  }

  // If user is logged in, show their dashboard
  if (user) {
    if (user.role === 'athlete') {
      return <AthleteDashboard user={user} onSignOut={handleSignOut} />;
    } else if (user.role === 'admin') {
      return <AdminDashboard user={user} onSignOut={handleSignOut} />;
    }
  }

  // Show landing page if not logged in
  return (
    <div className="min-h-screen bg-black">
      <Navigation onAuthClick={() => setIsAuthModalOpen(true)} />
      <Hero onAuthClick={() => setIsAuthModalOpen(true)} />
      <Features />
      <Metrics />
      <Programs />
      <Testimonials />
      <CTA onAuthClick={() => setIsAuthModalOpen(true)} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
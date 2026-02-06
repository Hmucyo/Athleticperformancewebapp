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
import { createClient } from "@supabase/supabase-js";

export default function App() {
  console.log("App component rendering...");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  console.log("App state:", { loading, user: !!user, currentPath });

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
      // Add timeout to prevent infinite loading (reduced to 2 seconds)
      const timeoutId = setTimeout(() => {
        console.warn('Session check taking too long, setting loading to false');
        setLoading(false);
      }, 2000);

      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (!accessToken || !storedUser) {
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // Parse stored user as fallback
      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // Use Supabase client directly to validate the session
      // This is more reliable than making a fetch call
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      // Validate the token with Supabase by passing it directly to getUser
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !authUser) {
        // Token is invalid or expired - clear storage
        console.log('Session invalid:', authError?.message || 'No user found');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      // Session is valid - try to get updated user info from backend
      // But if this fails, use stored user as fallback
      try {
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
          // Backend session check failed, but token is valid
          // Use stored user as fallback (network issue, not auth issue)
          console.warn('Backend session check failed, using stored user:', response.status);
          setUser(parsedUser);
        }
      } catch (networkError) {
        // Network error - don't log out, use stored user
        console.warn('Network error during session check, using stored user:', networkError);
        setUser(parsedUser);
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      // Unexpected error - only clear if it's an auth-related error
      console.error('Session check error:', error);
      
      // Only clear storage if we're certain it's an auth issue
      // For network errors, keep the user logged in with stored data
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (accessToken && storedUser) {
        // Try to use stored user as fallback
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          // Can't parse user, clear everything
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
        }
      }
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
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '14px', color: '#888' }}>If this takes too long, check the browser console</div>
        </div>
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
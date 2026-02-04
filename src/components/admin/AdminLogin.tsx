import { useState } from "react";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface AdminLoginProps {
  onLoginSuccess: (user: any, accessToken: string) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      // Check if Supabase credentials are properly configured
      if (!projectId || !publicAnonKey || projectId === 'your-project-id') {
        setError('Supabase is not properly configured. Please update /utils/supabase/info.tsx with your project credentials.');
        setLoading(false);
        return;
      }

      // Use Supabase client directly to sign in - this creates a valid token
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid admin credentials');
        return;
      }

      if (!authData.session || !authData.user) {
        setError('No session created');
        return;
      }

      // Get user role from metadata
      let userRole = authData.user.user_metadata?.role || 'athlete';
      const userName = authData.user.user_metadata?.name || authData.user.email;

      // If role is not set, update user metadata to set it as admin
      if (userRole !== 'admin') {
        // Check if this is the admin email
        if (authData.user.email === 'admin@afsp.com') {
          // Update user metadata to set role as admin
          const { error: updateError } = await supabase.auth.updateUser({
            data: { 
              role: 'admin',
              name: userName || 'Admin'
            }
          });
          
          if (updateError) {
            console.error('Failed to update user metadata:', updateError);
            setError('Failed to set admin role. Please contact support.');
            return;
          }
          
          userRole = 'admin';
        } else {
          setError('Access denied. Admin credentials required.');
          return;
        }
      }

      // Verify user is admin
      if (userRole !== 'admin') {
        setError('Access denied. Admin credentials required.');
        return;
      }

      // Create user object for the app
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
        fullName: userName
      };

      // Store credentials
      localStorage.setItem('accessToken', authData.session.access_token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess(user, authData.session.access_token);
    } catch (err) {
      console.error('Admin login error:', err);
      
      // Check if it's a network/CORS error
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Cannot connect to authentication server. The Supabase edge function may not be deployed. Please ensure your edge function is deployed at: /supabase/functions/server/');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black pointer-events-none"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-gray-400">Authentic Fitness & Sports Performance</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-white text-sm font-medium mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@afsp.com"
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3 text-gray-400 text-xs">
              <Shield className="flex-shrink-0 mt-0.5" size={16} />
              <p>
                This is a secure admin portal. All login attempts are monitored and logged.
                Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Main Site Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
}
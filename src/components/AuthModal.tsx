import { X } from "lucide-react";
import { useState } from "react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { validatePassword, validateEmail, sanitizeString } from '../utils/validation';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any, accessToken: string) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    phoneNumber: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate email
        if (!validateEmail(formData.email)) {
          setError("Please enter a valid email address");
          toast.error("Invalid email address");
          setLoading(false);
          return;
        }

        // Validate password strength
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          const errorMsg = passwordValidation.errors.join('. ');
          setError(errorMsg);
          toast.error("Password requirements not met", {
            description: passwordValidation.errors.join(', ')
          });
          setLoading(false);
          return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        // Sanitize inputs
        const sanitizedData = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          fullName: sanitizeString(formData.fullName),
          username: sanitizeString(formData.username),
          phoneNumber: sanitizeString(formData.phoneNumber)
        };

        // Sign up
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email: sanitizedData.email,
              password: sanitizedData.password,
              fullName: sanitizedData.fullName,
              username: sanitizedData.username,
              phoneNumber: sanitizedData.phoneNumber,
              role: 'athlete'
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Failed to sign up';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        toast.success("Account created successfully!");

        // After successful signup, sign in
        const signInResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email: sanitizedData.email,
              password: sanitizedData.password
            })
          }
        );

        const signInData = await signInResponse.json();

        if (!signInResponse.ok) {
          const errorMsg = signInData.error || 'Failed to sign in after signup';
          setError(errorMsg);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }

        // Store access token
        localStorage.setItem('accessToken', signInData.accessToken);
        localStorage.setItem('user', JSON.stringify(signInData.user));

        toast.success("Welcome! You're signed in.");
        if (onAuthSuccess) {
          onAuthSuccess(signInData.user, signInData.accessToken);
        }

        onClose();
      } else {
        // Sign in - validate email
        if (!validateEmail(formData.email)) {
          setError("Please enter a valid email address");
          toast.error("Invalid email address");
          setLoading(false);
          return;
        }

        // Sign in
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/signin`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email: formData.email.trim().toLowerCase(),
              password: formData.password
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          // Provide more helpful error messages
          let errorMessage = data.error || 'Failed to sign in';
          
          if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials or sign up for a new account.';
          }
          
          setError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
          return;
        }

        // Store access token
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success("Welcome back!");
        if (onAuthSuccess) {
          onAuthSuccess(data.user, data.accessToken);
        }

        onClose();
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-white text-3xl mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-400 mb-6">
          {isSignUp 
            ? "Sign up to start your athletic journey" 
            : "Sign in to continue your training"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required={isSignUp}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {isSignUp && (
            <div>
              <label htmlFor="username" className="block text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={isSignUp}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>
          )}

          {isSignUp && (
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required={isSignUp}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={isSignUp}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const email = window.prompt('Enter your email to receive a password reset link:', formData.email || '');
                  if (!email) return;

                  (async () => {
                    try {
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/request-password-reset`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${publicAnonKey}`
                          },
                          body: JSON.stringify({ email })
                        }
                      );

                      if (response.ok) {
                        toast.success('If an account exists for that email, a reset link has been sent.');
                      } else {
                        const data = await response.json().catch(() => ({}));
                        toast.error(data.error || 'Failed to request password reset');
                      }
                    } catch (e) {
                      console.error('Password reset request error:', e);
                      toast.error('Failed to request password reset');
                    }
                  })();
                }}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {isSignUp && (
            <div className="text-xs text-gray-400 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
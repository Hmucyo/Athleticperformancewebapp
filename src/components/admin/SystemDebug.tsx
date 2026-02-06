import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

export function SystemDebug() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setChecking(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // 1. Check localStorage
    const accessToken = localStorage.getItem('accessToken');
    const adminUser = localStorage.getItem('adminUser');
    
    diagnostics.checks.push({
      name: 'Access Token in localStorage',
      status: accessToken ? 'pass' : 'fail',
      details: accessToken ? `Token exists (${accessToken.length} chars)` : 'No token found',
      fix: !accessToken ? 'Log in again to get a fresh token' : null
    });

    diagnostics.checks.push({
      name: 'Admin User in localStorage',
      status: adminUser ? 'pass' : 'fail',
      details: adminUser ? JSON.parse(adminUser) : 'No user data',
      fix: !adminUser ? 'Log out and log back in' : null
    });

    // 2. Check Supabase config
    diagnostics.checks.push({
      name: 'Supabase Configuration',
      status: projectId && publicAnonKey ? 'pass' : 'fail',
      details: {
        projectId: projectId || 'Missing',
        anonKeyExists: !!publicAnonKey
      }
    });

    // 3. Test Edge Function connectivity
    try {
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/health`;
      const healthResponse = await fetch(healthUrl);
      
      diagnostics.checks.push({
        name: 'Edge Function Connectivity',
        status: healthResponse.ok ? 'pass' : 'fail',
        details: `Status: ${healthResponse.status} - ${healthResponse.statusText}`,
        fix: !healthResponse.ok ? 'Deploy the Edge Function to Supabase' : null
      });
    } catch (error) {
      diagnostics.checks.push({
        name: 'Edge Function Connectivity',
        status: 'fail',
        details: `Error: ${(error as Error).message}`,
        fix: 'Ensure Edge Function is deployed and CORS is configured'
      });
    }

    // 4. Test Authentication with current token
    if (accessToken) {
      try {
        const authUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/session`;
        const authResponse = await fetch(authUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const authData = await authResponse.json();
        
        diagnostics.checks.push({
          name: 'Token Validation',
          status: authResponse.ok ? 'pass' : 'fail',
          details: authResponse.ok ? authData.user : authData.error,
          fix: !authResponse.ok ? 'Token expired - log out and log back in' : null
        });
      } catch (error) {
        diagnostics.checks.push({
          name: 'Token Validation',
          status: 'fail',
          details: `Error: ${(error as Error).message}`
        });
      }
    }

    // 5. Test Admin Athletes endpoint
    if (accessToken) {
      try {
        const athletesUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/athletes`;
        const athletesResponse = await fetch(athletesUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const athletesData = await athletesResponse.json();
        
        diagnostics.checks.push({
          name: 'Admin Athletes Endpoint',
          status: athletesResponse.ok ? 'pass' : 'fail',
          details: athletesResponse.ok 
            ? `Found ${athletesData.athletes?.length || 0} athletes` 
            : `${athletesResponse.status}: ${athletesData.error || athletesData.details || 'Unknown error'}`,
          fix: !athletesResponse.ok 
            ? athletesResponse.status === 401 
              ? 'Log out and log back in for fresh token'
              : athletesResponse.status === 403
                ? 'User account does not have admin role'
                : 'Check Edge Function logs'
            : null
        });
      } catch (error) {
        diagnostics.checks.push({
          name: 'Admin Athletes Endpoint',
          status: 'fail',
          details: `Error: ${(error as Error).message}`,
          fix: 'Check Edge Function deployment and CORS settings'
        });
      }
    }

    // 6. Test Admin Exercises endpoint
    if (accessToken) {
      try {
        const exercisesUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises`;
        const exercisesResponse = await fetch(exercisesUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const exercisesData = await exercisesResponse.json();
        
        diagnostics.checks.push({
          name: 'Admin Exercises Endpoint',
          status: exercisesResponse.ok ? 'pass' : 'fail',
          details: exercisesResponse.ok 
            ? `Found ${exercisesData.exercises?.length || 0} exercises` 
            : `${exercisesResponse.status}: ${exercisesData.error || 'Unknown error'}`,
          fix: !exercisesResponse.ok ? 'Check token and admin role' : null
        });
      } catch (error) {
        diagnostics.checks.push({
          name: 'Admin Exercises Endpoint',
          status: 'fail',
          details: `Error: ${(error as Error).message}`
        });
      }
    }

    setResults(diagnostics);
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'fail':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <AlertCircle className="text-yellow-400" size={20} />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">System Diagnostics</h1>
        <p className="text-gray-400">Check system health and troubleshoot issues</p>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={checking}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={20} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">Diagnostic Results</h2>
              <span className="text-gray-400 text-sm">{new Date(results.timestamp).toLocaleString()}</span>
            </div>

            <div className="space-y-4">
              {results.checks.map((check: any, index: number) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    check.status === 'pass' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{check.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {typeof check.details === 'string' 
                          ? check.details 
                          : JSON.stringify(check.details, null, 2)
                        }
                      </p>
                      {check.fix && (
                        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <p className="text-yellow-400 text-sm">
                            <strong>Fix:</strong> {check.fix}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  toast.success('localStorage cleared. Please log in again.');
                  window.location.href = '/admin';
                }}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Clear localStorage & Logout
              </button>
              <button
                onClick={() => {
                  console.log('Access Token:', localStorage.getItem('accessToken'));
                  console.log('Admin User:', localStorage.getItem('adminUser'));
                  toast.info('Check browser console for details');
                }}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Log Current Session to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

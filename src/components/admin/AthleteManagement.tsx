import { useState, useEffect } from "react";
import { Search, Mail, Calendar, Award, RefreshCw, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AthleteManagementProps {
  user: any;
}

export function AthleteManagement({ user }: AthleteManagementProps) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = athletes.filter(athlete =>
        athlete.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAthletes(filtered);
    } else {
      setFilteredAthletes(athletes);
    }
  }, [searchQuery, athletes]);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const accessToken = localStorage.getItem('accessToken') || 
                   JSON.parse(localStorage.getItem('sb-kelawywzkwtpiqpdgzmh-auth-token') || '{}')?.access_token;
      const adminUser = localStorage.getItem('adminUser');
      
      console.log('=== ATHLETE FETCH DEBUG ===');
      console.log('1. Access Token exists:', !!accessToken);
      console.log('2. Access Token length:', accessToken?.length || 0);
      console.log('3. Access Token preview:', accessToken?.substring(0, 30) + '...');
      console.log('4. Admin User:', adminUser ? JSON.parse(adminUser) : null);
      console.log('5. Project ID:', projectId);
      console.log('6. Fetch URL:', `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/athletes`);
      
      if (!accessToken) {
        setError('No access token found. Please log in again.');
        setLoading(false);
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/athletes`;
      console.log('7. Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('8. Response status:', response.status);
      console.log('9. Response ok:', response.ok);
      console.log('10. Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('11. Response data:', data);

      if (response.ok) {
        setAthletes(data.athletes || []);
        console.log('12. Athletes loaded:', data.athletes?.length || 0);
      } else {
        console.error('13. Error response:', data);
        
        // Provide specific error messages based on status code
        if (response.status === 401) {
          setError(`Authentication failed: ${data.error || 'Invalid or expired session'}. Please log out and log back in.`);
        } else if (response.status === 403) {
          setError(`Access denied: ${data.error || 'Admin privileges required'}. Your account may not have admin role.`);
        } else if (response.status === 404) {
          setError('Server endpoint not found. The Edge Function may not be deployed.');
        } else {
          setError(data.error || `Failed to load athletes (Status: ${response.status})`);
        }
      }
      
      console.log('=== END ATHLETE FETCH DEBUG ===');
    } catch (error) {
      console.error('14. Fetch exception:', error);
      console.error('15. Error type:', error instanceof TypeError ? 'Network/CORS' : 'Other');
      console.error('16. Error message:', (error as Error).message);
      
      if (error instanceof TypeError) {
        setError(
          'Cannot connect to server. Possible causes:\n' +
          '1. Edge Function not deployed\n' +
          '2. Network connectivity issue\n' +
          '3. CORS configuration problem\n' +
          'Check browser console for details.'
        );
      } else {
        setError(`Failed to load athletes: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAthletes();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold mb-2">Athlete Management</h1>
          <p className="text-gray-400">View and manage all athletes</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-red-400/70 text-xs mt-1">Check browser console (F12) for more details</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Athletes List */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading athletes...</div>
      ) : filteredAthletes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAthletes.map((athlete) => (
            <div 
              key={athlete.id}
              className="bg-gray-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white text-xl font-semibold">{athlete.fullName}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                    <Mail size={14} />
                    {athlete.email}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={16} />
                  <span>Joined {new Date(athlete.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Award size={16} />
                  <span>{athlete.programs?.length || 0} program{athlete.programs?.length !== 1 ? 's' : ''} enrolled</span>
                </div>
              </div>

              {athlete.programs && athlete.programs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Enrolled Programs:</p>
                  <div className="flex flex-wrap gap-2">
                    {athlete.programs.slice(0, 3).map((program: any, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                      >
                        {program.programId}
                      </span>
                    ))}
                    {athlete.programs.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                        +{athlete.programs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  View Profile
                </button>
                <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors border border-white/10">
                  Assign Exercise
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            {searchQuery ? 'No athletes found matching your search' : 'No athletes yet'}
          </p>
        </div>
      )}
    </div>
  );
}
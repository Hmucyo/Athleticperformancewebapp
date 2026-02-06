import { useState, useEffect } from "react";
import { Users, Dumbbell, TrendingUp, Activity, Lock, Unlock } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from "sonner";

interface AdminHomeProps {
  user: any;
}

export function AdminHome({ user }: AdminHomeProps) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalChannelLocked, setGeneralChannelLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  useEffect(() => {
    fetchAthletes();
    fetchChannelStatus();
  }, []);

  const fetchChannelStatus = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/general/status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneralChannelLocked(data.locked || false);
      }
    } catch (error) {
      console.error('Failed to fetch channel status:', error);
    }
  };

  const handleToggleLock = async () => {
    setLockLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const endpoint = generalChannelLocked 
        ? '/chat/general/unlock'
        : '/chat/general/lock';
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        setGeneralChannelLocked(!generalChannelLocked);
      } else {
        toast.error('Failed to update channel lock status');
      }
    } catch (error) {
      console.error('Toggle lock error:', error);
      toast.error('Failed to update channel lock status');
    } finally {
      setLockLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/athletes`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAthletes(data.athletes || []);
      }
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEnrollments = athletes.reduce((sum, athlete) => 
    sum + (athlete.programs?.length || 0), 0
  );

  const recentAthletes = athletes
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">
          Welcome back, {user.fullName}!
        </h1>
        <p className="text-gray-400">Here's what's happening with your athletes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="text-blue-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Total Athletes</h3>
          </div>
          <p className="text-3xl font-bold text-white">{athletes.length}</p>
          <p className="text-gray-400 text-sm mt-1">Active users</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Dumbbell className="text-purple-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Programs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalEnrollments}</p>
          <p className="text-gray-400 text-sm mt-1">Total enrollments</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Growth</h3>
          </div>
          <p className="text-3xl font-bold text-white">+12%</p>
          <p className="text-gray-400 text-sm mt-1">This month</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Activity className="text-orange-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Avg. Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-white">8.5</p>
          <p className="text-gray-400 text-sm mt-1">Per athlete/month</p>
        </div>
      </div>

      {/* General Channel Control */}
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-semibold mb-2">General Chat Channel</h2>
            <p className="text-gray-400 text-sm">
              {generalChannelLocked 
                ? 'Channel is currently locked. Only admins can send messages.'
                : 'Channel is unlocked. All users can send messages.'}
            </p>
          </div>
          <button
            onClick={handleToggleLock}
            disabled={lockLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              generalChannelLocked
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {lockLoading ? (
              <>Loading...</>
            ) : generalChannelLocked ? (
              <>
                <Unlock size={20} />
                Unlock Channel
              </>
            ) : (
              <>
                <Lock size={20} />
                Lock Channel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Athletes */}
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
        <h2 className="text-white text-2xl font-semibold mb-4">Recent Athletes</h2>
        
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading athletes...</div>
        ) : recentAthletes.length > 0 ? (
          <div className="space-y-3">
            {recentAthletes.map((athlete) => (
              <div 
                key={athlete.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{athlete.fullName}</p>
                  <p className="text-gray-400 text-sm">{athlete.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">
                    {athlete.programs?.length || 0} program{athlete.programs?.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Joined {new Date(athlete.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">No athletes yet</div>
        )}
      </div>
    </div>
  );
}

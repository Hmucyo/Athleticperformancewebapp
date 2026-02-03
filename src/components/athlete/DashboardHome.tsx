import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DashboardHomeProps {
  user: any;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('day'); // day, week, month, 3months, 6months, year
  const [suggestedPrograms, setSuggestedPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchExercises();
    fetchSuggestedPrograms();
  }, []);

  const fetchExercises = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/exercises/daily`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedPrograms = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/public`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Show up to 3 random programs as suggestions
        const shuffled = [...(data.programs || [])].sort(() => 0.5 - Math.random());
        setSuggestedPrograms(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch suggested programs:', error);
    }
  };

  const completedCount = exercises.filter(ex => ex.completed).length;
  const totalCount = exercises.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: completedCount, color: '#3b82f6' },
    { name: 'Remaining', value: totalCount - completedCount, color: '#6b7280' }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCompleteExercise = async (exerciseId: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/exercises/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ exerciseId })
        }
      );

      if (response.ok) {
        // Refresh exercises
        fetchExercises();
      }
    } catch (error) {
      console.error('Failed to complete exercise:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">
          {getGreeting()}, {user.fullName}!
        </h1>
        <p className="text-gray-400">Let's make today count</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Progress</h3>
          </div>
          <p className="text-3xl font-bold text-white">{completionPercentage}%</p>
          <p className="text-gray-400 text-sm mt-1">Completion rate today</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Calendar className="text-purple-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Today's Tasks</h3>
          </div>
          <p className="text-3xl font-bold text-white">{completedCount}/{totalCount}</p>
          <p className="text-gray-400 text-sm mt-1">Exercises completed</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Award className="text-green-500" size={24} />
            </div>
            <h3 className="text-white font-semibold">Programs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{user.programs?.length || 0}</p>
          <p className="text-gray-400 text-sm mt-1">Active enrollments</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Exercise Completion</h2>
          
          {totalCount > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No exercises assigned yet
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Suggested for You</h2>
          <div className="space-y-3">
            {suggestedPrograms.map((program) => (
              <div 
                key={program.id}
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4"
              >
                <h3 className="text-white font-semibold mb-1">{program.name}</h3>
                <p className="text-gray-300 text-sm mb-3">
                  {program.description}
                </p>
                <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Exercises */}
      <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
        <h2 className="text-white text-xl font-semibold mb-4">Today's Exercises</h2>
        
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading exercises...</div>
        ) : exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div 
                key={exercise.id}
                className={`p-4 rounded-lg border transition-all ${
                  exercise.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{exercise.name}</h3>
                    {exercise.description && (
                      <p className="text-gray-400 text-sm mt-1">{exercise.description}</p>
                    )}
                    {exercise.sets && exercise.reps && (
                      <p className="text-gray-500 text-sm mt-1">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    )}
                  </div>
                  {!exercise.completed && (
                    <button
                      onClick={() => handleCompleteExercise(exercise.id)}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  {exercise.completed && (
                    <span className="ml-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No exercises assigned for today. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Dumbbell, Users, Trophy, Calendar, Plus, X, ArrowRight, FileText } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PaymentModal } from '../PaymentModal';
import { ContractModal } from '../ContractModal';

interface ProgramsTabProps {
  user: any;
}

const STANDARD_PROGRAMS = [
  {
    id: 'personal-training-bootcamp',
    name: 'Personal Training - Bootcamp',
    description: 'High-intensity group training sessions designed to push your limits and build strength, endurance, and mental toughness. Perfect for those who thrive in a team environment.',
    duration: '8 weeks',
    sessions: '3x per week',
    intensity: 'High',
    price: '$299/month',
    icon: Dumbbell,
    color: 'from-blue-600 to-cyan-600',
    features: [
      'Group training sessions',
      'Progressive workout plans',
      'Nutrition guidance',
      'Performance tracking'
    ]
  },
  {
    id: 'sports-performance-one-on-one',
    name: 'Sports Performance One-on-One',
    description: 'Individualized training program tailored to your specific sport and performance goals. Get dedicated coaching attention to maximize your athletic potential.',
    duration: 'Flexible',
    sessions: '2-4x per week',
    intensity: 'Custom',
    price: '$499/month',
    icon: Trophy,
    color: 'from-purple-600 to-pink-600',
    features: [
      'One-on-one coaching',
      'Sport-specific training',
      'Video analysis',
      'Personalized programming'
    ]
  },
  {
    id: 'authentikos-athletix-club',
    name: 'Authentikos Athletix Club',
    description: 'Join our elite training community with access to all facilities, group classes, and exclusive member events. Build lasting connections while achieving your fitness goals.',
    duration: 'Ongoing',
    sessions: 'Unlimited',
    intensity: 'Varied',
    price: '$199/month',
    icon: Users,
    color: 'from-green-600 to-teal-600',
    features: [
      'Unlimited facility access',
      'All group classes',
      'Community events',
      'Monthly assessments'
    ]
  },
  {
    id: 'drop-in-sessions',
    name: 'Drop In Sessions',
    description: 'Flexible training option for those with busy schedules. Pay per session and join any available class or training session that fits your schedule.',
    duration: 'Per session',
    sessions: 'As needed',
    intensity: 'Varied',
    price: '$35/session',
    icon: Calendar,
    color: 'from-orange-600 to-red-600',
    features: [
      'No commitment required',
      'Flexible scheduling',
      'All class types',
      'Pay as you go'
    ]
  }
];

export function ProgramsTab({ user }: ProgramsTabProps) {
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Contract modal state
  const [showContractModal, setShowContractModal] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<any>(null);

  // Custom program customization state
  const [customizationStep, setCustomizationStep] = useState(1);
  const [customProgram, setCustomProgram] = useState({
    name: '',
    goals: [] as string[],
    experienceLevel: '',
    daysPerWeek: 3,
    sessionDuration: 60,
    focusAreas: [] as string[],
    equipment: [] as string[]
  });

  useEffect(() => {
    fetchEnrolledPrograms();
  }, []);

  const fetchEnrolledPrograms = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/enrolled`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnrolledPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStandard = async () => {
    if (!selectedProgram) return;

    setEnrolling(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            programId: selectedProgram.id,
            programName: selectedProgram.name,
            customization: null
          })
        }
      );

      if (response.ok) {
        alert('Successfully enrolled in program!');
        setShowEnrollModal(false);
        setSelectedProgram(null);
        fetchEnrolledPrograms();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to enroll in program');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in program');
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrollCustom = async () => {
    if (!customProgram.name || customProgram.goals.length === 0) {
      alert('Please complete all customization steps');
      return;
    }

    setEnrolling(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/programs/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            programId: 'custom-program',
            programName: customProgram.name,
            customization: customProgram
          })
        }
      );

      if (response.ok) {
        alert('Custom program created successfully!');
        setShowCustomModal(false);
        setCustomizationStep(1);
        setCustomProgram({
          name: '',
          goals: [],
          experienceLevel: '',
          daysPerWeek: 3,
          sessionDuration: 60,
          focusAreas: [],
          equipment: []
        });
        fetchEnrolledPrograms();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create custom program');
      }
    } catch (error) {
      console.error('Custom program error:', error);
      alert('Failed to create custom program');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setCustomProgram(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleFocusArea = (area: string) => {
    setCustomProgram(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const toggleEquipment = (item: string) => {
    setCustomProgram(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(e => e !== item)
        : [...prev.equipment, item]
    }));
  };

  const isEnrolled = (programId: string) => {
    return enrolledPrograms.some(p => p.programId === programId);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Training Programs</h1>
        <p className="text-gray-400">Choose from our professional programs or create your own</p>
      </div>

      {/* Enrolled Programs */}
      {enrolledPrograms.length > 0 && (
        <div className="mb-12">
          <h2 className="text-white text-2xl font-semibold mb-4">My Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledPrograms.map((program) => (
              <div
                key={program.enrollmentId}
                className="bg-gray-900 border border-green-500/30 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-xl font-semibold">{program.programName}</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Enrolled
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  Started {new Date(program.enrolledAt).toLocaleDateString()}
                </p>
                {program.customization && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-gray-400 text-xs mb-2">Customized Program</p>
                    {program.customization.goals && (
                      <div className="flex flex-wrap gap-1">
                        {program.customization.goals.slice(0, 3).map((goal: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                            {goal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Programs */}
      <div className="mb-12">
        <h2 className="text-white text-2xl font-semibold mb-4">Standard Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STANDARD_PROGRAMS.map((program) => {
            const Icon = program.icon;
            const enrolled = isEnrolled(program.id);
            
            return (
              <div
                key={program.id}
                className={`bg-gradient-to-br ${program.color} bg-opacity-10 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all ${
                  enrolled ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${program.color} rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  {enrolled && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Enrolled
                    </span>
                  )}
                </div>

                <h3 className="text-white text-2xl font-bold mb-2">{program.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{program.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="text-white font-semibold">{program.duration}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Sessions</p>
                    <p className="text-white font-semibold">{program.sessions}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Intensity</p>
                    <p className="text-white font-semibold">{program.intensity}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Price</p>
                    <p className="text-white font-semibold">{program.price}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedProgram(program);
                    setShowEnrollModal(true);
                  }}
                  disabled={enrolled}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    enrolled
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${program.color} text-white hover:opacity-90`
                  }`}
                >
                  {enrolled ? 'Already Enrolled' : 'View Details'}
                  {!enrolled && <ArrowRight size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Custom Program Card */}
      <div className="mb-12">
        <h2 className="text-white text-2xl font-semibold mb-4">Custom Program</h2>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-all">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <Plus className="text-white" size={32} />
          </div>
          <h3 className="text-white text-2xl font-bold mb-2">Create Your Own Program</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Design a fully customized training program tailored to your specific goals, schedule, and preferences
          </p>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
          >
            Start Customization
          </button>
        </div>
      </div>

      {/* Standard Program Enrollment Modal */}
      {showEnrollModal && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEnrollModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className={`inline-flex p-4 bg-gradient-to-br ${selectedProgram.color} rounded-lg mb-4`}>
              {selectedProgram.icon && <selectedProgram.icon className="text-white" size={32} />}
            </div>

            <h2 className="text-white text-3xl font-bold mb-4">{selectedProgram.name}</h2>
            <p className="text-gray-300 mb-6">{selectedProgram.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Duration</p>
                <p className="text-white font-semibold text-lg">{selectedProgram.duration}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Sessions</p>
                <p className="text-white font-semibold text-lg">{selectedProgram.sessions}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Intensity</p>
                <p className="text-white font-semibold text-lg">{selectedProgram.intensity}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Investment</p>
                <p className="text-white font-semibold text-lg">{selectedProgram.price}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">What's Included:</h3>
              <ul className="space-y-2">
                {selectedProgram.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleEnrollStandard}
              disabled={enrolling}
              className={`w-full py-4 bg-gradient-to-r ${selectedProgram.color} text-white rounded-lg hover:opacity-90 transition-all font-semibold text-lg ${
                enrolling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </div>
        </div>
      )}

      {/* Custom Program Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCustomModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h2 className="text-white text-3xl font-bold mb-2">Create Custom Program</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={customizationStep >= 1 ? 'text-blue-500' : ''}>Step 1</span>
                <span>→</span>
                <span className={customizationStep >= 2 ? 'text-blue-500' : ''}>Step 2</span>
                <span>→</span>
                <span className={customizationStep >= 3 ? 'text-blue-500' : ''}>Step 3</span>
                <span>→</span>
                <span className={customizationStep >= 4 ? 'text-blue-500' : ''}>Step 4</span>
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {customizationStep === 1 && (
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Program Name</label>
                    <input
                      type="text"
                      value={customProgram.name}
                      onChange={(e) => setCustomProgram({ ...customProgram, name: e.target.value })}
                      placeholder="e.g., My Summer Training Plan"
                      className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Training Goals (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Strength', 'Endurance', 'Speed', 'Flexibility', 'Weight Loss', 'Muscle Gain'].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            customProgram.goals.includes(goal)
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Experience Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setCustomProgram({ ...customProgram, experienceLevel: level })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            customProgram.experienceLevel === level
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCustomizationStep(2)}
                  disabled={!customProgram.name || customProgram.goals.length === 0 || !customProgram.experienceLevel}
                  className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              </div>
            )}

            {/* Step 2: Schedule */}
            {customizationStep === 2 && (
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Training Schedule</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white mb-2">Days Per Week</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={customProgram.daysPerWeek}
                        onChange={(e) => setCustomProgram({ ...customProgram, daysPerWeek: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-white text-2xl font-bold w-12 text-center">{customProgram.daysPerWeek}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Session Duration (minutes)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="30"
                        max="120"
                        step="15"
                        value={customProgram.sessionDuration}
                        onChange={(e) => setCustomProgram({ ...customProgram, sessionDuration: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-white text-2xl font-bold w-16 text-center">{customProgram.sessionDuration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCustomizationStep(1)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCustomizationStep(3)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Focus Areas */}
            {customizationStep === 3 && (
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Focus Areas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Body Areas (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Cardio', 'Mobility'].map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleFocusArea(area)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            customProgram.focusAreas.includes(area)
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCustomizationStep(2)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCustomizationStep(4)}
                    disabled={customProgram.focusAreas.length === 0}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Equipment */}
            {customizationStep === 4 && (
              <div>
                <h3 className="text-white text-xl font-semibold mb-4">Available Equipment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">What equipment do you have access to?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Dumbbells', 'Barbells', 'Resistance Bands', 'Kettlebells', 'Pull-up Bar', 'Bodyweight Only'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleEquipment(item)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            customProgram.equipment.includes(item)
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 mt-6">
                    <h4 className="text-white font-semibold mb-3">Program Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300"><span className="text-gray-400">Name:</span> {customProgram.name}</p>
                      <p className="text-gray-300"><span className="text-gray-400">Goals:</span> {customProgram.goals.join(', ')}</p>
                      <p className="text-gray-300"><span className="text-gray-400">Level:</span> {customProgram.experienceLevel}</p>
                      <p className="text-gray-300"><span className="text-gray-400">Schedule:</span> {customProgram.daysPerWeek} days/week, {customProgram.sessionDuration} min/session</p>
                      <p className="text-gray-300"><span className="text-gray-400">Focus:</span> {customProgram.focusAreas.join(', ')}</p>
                      <p className="text-gray-300"><span className="text-gray-400">Equipment:</span> {customProgram.equipment.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCustomizationStep(3)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleEnrollCustom}
                    disabled={enrolling || customProgram.equipment.length === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Creating...' : 'Create Program'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
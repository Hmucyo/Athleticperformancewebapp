import { useState, useEffect } from "react";
import { Dumbbell, Users, Trophy, Calendar, Plus, X, ArrowRight, FileText } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { PaymentModal } from '../PaymentModal';
import { ContractModal } from '../ContractModal';
import { CustomProgramModal } from '../CustomProgramModal';
import { toast } from 'sonner';

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
  const [adminPrograms, setAdminPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);
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
    deliveryType: '', // 'online' or 'in-person'
    programCategory: '', // 'sport-performance' or 'fitness-wellness'
    // Common fields
    age: '',
    height: '',
    weight: '',
    sessionsPerWeek: '',
    daysPerWeek: '',
    timeAvailable: '',
    // Sport Performance specific
    sport: '',
    injuryHistory: '',
    performanceGoals: [] as string[],
    // Fitness & Wellness specific
    healthHistory: '',
    fitnessGoals: [] as string[],
    // Online specific
    equipmentAccess: '', // 'gym', 'home', 'none'
    gymName: '',
    homeEquipment: [] as string[],
    // Other
    otherInformation: ''
  });

  useEffect(() => {
    fetchEnrolledPrograms();
    fetchAdminPrograms();
  }, []);

  const fetchAdminPrograms = async () => {
    try {
      setProgramsLoading(true);
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
        setAdminPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin programs:', error);
    } finally {
      setProgramsLoading(false);
    }
  };

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
        toast.success('Successfully enrolled in program!');
        setShowEnrollModal(false);
        setSelectedProgram(null);
        fetchEnrolledPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to enroll in program');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll in program');
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrollCustom = async () => {
    // Validate required fields based on the selected path
    if (!customProgram.deliveryType || !customProgram.programCategory) {
      toast.error('Please complete all customization steps');
      return;
    }

    if (!customProgram.age || !customProgram.height || !customProgram.weight) {
      toast.error('Please provide your age, height, and weight');
      return;
    }

    if (customProgram.programCategory === 'sport-performance') {
      if (!customProgram.sport || customProgram.performanceGoals.length === 0) {
        toast.error('Please complete sport performance details');
        return;
      }
    } else {
      if (customProgram.fitnessGoals.length === 0) {
        toast.error('Please select at least one fitness goal');
        return;
      }
    }

    if (customProgram.deliveryType === 'online' && !customProgram.equipmentAccess) {
      toast.error('Please specify your equipment access');
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
            programName: `Custom ${customProgram.programCategory === 'sport-performance' ? 'Sport Performance' : 'Fitness & Wellness'} - ${customProgram.deliveryType}`,
            customization: customProgram
          })
        }
      );

      if (response.ok) {
        toast.success('Custom program created successfully!');
        setShowCustomModal(false);
        setCustomizationStep(1);
        setCustomProgram({
          deliveryType: '',
          programCategory: '',
          age: '',
          height: '',
          weight: '',
          sessionsPerWeek: '',
          daysPerWeek: '',
          timeAvailable: '',
          sport: '',
          injuryHistory: '',
          performanceGoals: [],
          healthHistory: '',
          fitnessGoals: [],
          equipmentAccess: '',
          gymName: '',
          homeEquipment: [],
          otherInformation: ''
        });
        fetchEnrolledPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create custom program');
      }
    } catch (error) {
      console.error('Custom program error:', error);
      toast.error('Failed to create custom program');
    } finally {
      setEnrolling(false);
    }
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

      {/* Admin-Created Programs */}
      <div className="mb-12">
        <h2 className="text-white text-2xl font-semibold mb-4">Available Programs</h2>
        {programsLoading ? (
          <div className="text-gray-400 text-center py-12">Loading programs...</div>
        ) : adminPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminPrograms.map((program) => {
              const enrolled = isEnrolled(program.id);
              const gradients = [
                'from-blue-600 to-cyan-600',
                'from-purple-600 to-pink-600',
                'from-green-600 to-teal-600',
                'from-orange-600 to-red-600',
                'from-indigo-600 to-purple-600',
                'from-yellow-600 to-orange-600'
              ];
              const gradientClass = gradients[Math.abs(program.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % gradients.length];
              
              return (
                <div
                  key={program.id}
                  className={`bg-gray-900 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all ${
                    enrolled ? 'opacity-60' : ''
                  }`}
                >
                  {/* Program Image or Gradient */}
                  <div className="relative h-48 overflow-hidden">
                    {program.imageUrl ? (
                      <img
                        src={program.imageUrl}
                        alt={program.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                        <h3 className="text-white text-2xl font-bold text-center px-6">{program.name}</h3>
                      </div>
                    )}
                    {enrolled && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 text-white text-xs rounded-full">
                        Enrolled
                      </span>
                    )}
                  </div>

                  {/* Program Details */}
                  <div className="p-6">
                    {program.imageUrl && (
                      <h3 className="text-white text-2xl font-bold mb-2">{program.name}</h3>
                    )}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{program.description}</p>

                    {/* Program Meta Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Delivery</p>
                        <p className="text-white font-semibold capitalize">{program.delivery}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Format</p>
                        <p className="text-white font-semibold capitalize">{program.format}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Category</p>
                        <p className="text-white font-semibold capitalize">{program.category?.replace('-', ' ')}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Price</p>
                        <p className="text-white font-semibold">${program.price}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(program.duration || program.maxParticipants || program.coachName) && (
                      <div className="space-y-2 mb-4 text-sm">
                        {program.duration && (
                          <p className="text-gray-400">
                            <span className="text-white font-medium">Duration:</span> {program.duration}
                          </p>
                        )}
                        {program.maxParticipants && (
                          <p className="text-gray-400">
                            <span className="text-white font-medium">Max Participants:</span> {program.maxParticipants}
                          </p>
                        )}
                        {program.coachName && (
                          <p className="text-gray-400">
                            <span className="text-white font-medium">Coach:</span> {program.coachName}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowEnrollModal(true);
                      }}
                      disabled={enrolled}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        enrolled
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${gradientClass} text-white hover:opacity-90`
                      }`}
                    >
                      {enrolled ? 'Already Enrolled' : 'View Details'}
                      {!enrolled && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-12">
            No programs available yet. Check back soon!
          </div>
        )}
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

      {/* Program Enrollment Modal */}
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

            {/* Program Image if available */}
            {selectedProgram.imageUrl && (
              <img
                src={selectedProgram.imageUrl}
                alt={selectedProgram.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <h2 className="text-white text-3xl font-bold mb-4">{selectedProgram.name}</h2>
            <p className="text-gray-300 mb-6">{selectedProgram.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Delivery</p>
                <p className="text-white font-semibold text-lg capitalize">{selectedProgram.delivery || 'N/A'}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Format</p>
                <p className="text-white font-semibold text-lg capitalize">{selectedProgram.format || 'N/A'}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Category</p>
                <p className="text-white font-semibold text-lg capitalize">{selectedProgram.category?.replace('-', ' ') || 'N/A'}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Price</p>
                <p className="text-white font-semibold text-lg">${selectedProgram.price || 'N/A'}</p>
              </div>
            </div>

            {(selectedProgram.duration || selectedProgram.maxParticipants || selectedProgram.coachName) && (
              <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Program Details:</h3>
                <div className="space-y-2">
                  {selectedProgram.duration && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Duration: {selectedProgram.duration}
                    </p>
                  )}
                  {selectedProgram.maxParticipants && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Max Participants: {selectedProgram.maxParticipants}
                    </p>
                  )}
                  {selectedProgram.coachName && (
                    <p className="text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Coach: {selectedProgram.coachName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedProgram.features && (
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
            )}

            <button
              onClick={handleEnrollStandard}
              disabled={enrolling}
              className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg ${
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
        <CustomProgramModal
          onClose={() => setShowCustomModal(false)}
          onEnroll={handleEnrollCustom}
          enrolling={enrolling}
          customizationStep={customizationStep}
          setCustomizationStep={setCustomizationStep}
          customProgram={customProgram}
          setCustomProgram={setCustomProgram}
        />
      )}
    </div>
  );
}
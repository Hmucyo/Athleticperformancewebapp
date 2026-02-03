import { X } from "lucide-react";

interface CustomProgramModalProps {
  onClose: () => void;
  onEnroll: () => void;
  enrolling: boolean;
  customProgram: any;
  setCustomProgram: (program: any) => void;
  customizationStep: number;
  setCustomizationStep: (step: number) => void;
}

export function CustomProgramModal({
  onClose,
  onEnroll,
  enrolling,
  customProgram,
  setCustomProgram,
  customizationStep,
  setCustomizationStep
}: CustomProgramModalProps) {
  const togglePerformanceGoal = (goal: string) => {
    setCustomProgram((prev: any) => ({
      ...prev,
      performanceGoals: prev.performanceGoals.includes(goal)
        ? prev.performanceGoals.filter((g: string) => g !== goal)
        : [...prev.performanceGoals, goal]
    }));
  };

  const toggleFitnessGoal = (goal: string) => {
    setCustomProgram((prev: any) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter((g: string) => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
  };

  const toggleHomeEquipment = (item: string) => {
    setCustomProgram((prev: any) => ({
      ...prev,
      homeEquipment: prev.homeEquipment.includes(item)
        ? prev.homeEquipment.filter((e: string) => e !== item)
        : [...prev.homeEquipment, item]
    }));
  };

  const getTotalSteps = () => {
    if (customProgram.deliveryType === 'in-person' && customProgram.programCategory === 'sport-performance') return 4;
    if (customProgram.deliveryType === 'in-person' && customProgram.programCategory === 'fitness-wellness') return 4;
    if (customProgram.deliveryType === 'online' && customProgram.programCategory === 'sport-performance') return 5;
    if (customProgram.deliveryType === 'online' && customProgram.programCategory === 'fitness-wellness') return 5;
    return 2;
  };

  const totalSteps = getTotalSteps();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-white text-3xl font-bold mb-2">Create Custom Program</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i}>
                <span className={customizationStep >= i + 1 ? 'text-blue-500' : ''}>
                  Step {i + 1}
                </span>
                {i < totalSteps - 1 && <span className="mx-1">→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Step 1: Choose Delivery Type */}
        {customizationStep === 1 && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Choose Delivery Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCustomProgram({ ...customProgram, deliveryType: 'online' })}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  customProgram.deliveryType === 'online'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl font-bold mb-2">Online</div>
                <p className="text-sm">Train remotely with our virtual coaching platform</p>
              </button>
              <button
                onClick={() => setCustomProgram({ ...customProgram, deliveryType: 'in-person' })}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  customProgram.deliveryType === 'in-person'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl font-bold mb-2">In-Person</div>
                <p className="text-sm">Train at our facility with hands-on coaching</p>
              </button>
            </div>

            <button
              onClick={() => setCustomizationStep(2)}
              disabled={!customProgram.deliveryType}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        )}

        {/* Step 2: Choose Program Category */}
        {customizationStep === 2 && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Choose Program Category</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCustomProgram({ ...customProgram, programCategory: 'sport-performance' })}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  customProgram.programCategory === 'sport-performance'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl font-bold mb-2">Sport Performance</div>
                <p className="text-sm">Enhance athletic performance for your specific sport</p>
              </button>
              <button
                onClick={() => setCustomProgram({ ...customProgram, programCategory: 'fitness-wellness' })}
                className={`p-6 rounded-lg border-2 transition-all text-center ${
                  customProgram.programCategory === 'fitness-wellness'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl font-bold mb-2">Fitness & Wellness</div>
                <p className="text-sm">General fitness, health, and wellness goals</p>
              </button>
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
                disabled={!customProgram.programCategory}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Basic Information (for all paths) */}
        {customizationStep === 3 && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Age</label>
                  <input
                    type="number"
                    value={customProgram.age}
                    onChange={(e) => setCustomProgram({ ...customProgram, age: e.target.value })}
                    placeholder="25"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Height (in)</label>
                  <input
                    type="text"
                    value={customProgram.height}
                    onChange={(e) => setCustomProgram({ ...customProgram, height: e.target.value })}
                    placeholder="5'10&quot;"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    value={customProgram.weight}
                    onChange={(e) => setCustomProgram({ ...customProgram, weight: e.target.value })}
                    placeholder="170"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Sessions Per Week</label>
                  <input
                    type="number"
                    value={customProgram.sessionsPerWeek}
                    onChange={(e) => setCustomProgram({ ...customProgram, sessionsPerWeek: e.target.value })}
                    placeholder="3"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Days Per Week</label>
                  <input
                    type="number"
                    value={customProgram.daysPerWeek}
                    onChange={(e) => setCustomProgram({ ...customProgram, daysPerWeek: e.target.value })}
                    placeholder="4"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Time Available for Training</label>
                <input
                  type="text"
                  value={customProgram.timeAvailable}
                  onChange={(e) => setCustomProgram({ ...customProgram, timeAvailable: e.target.value })}
                  placeholder="e.g., 60 minutes per session"
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
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
                disabled={!customProgram.age || !customProgram.height || !customProgram.weight}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Sport Performance Specific */}
        {customizationStep === 4 && customProgram.programCategory === 'sport-performance' && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Sport Performance Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Sport of Choice</label>
                <input
                  type="text"
                  value={customProgram.sport}
                  onChange={(e) => setCustomProgram({ ...customProgram, sport: e.target.value })}
                  placeholder="e.g., Basketball, Soccer, Track"
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Injury History</label>
                <textarea
                  value={customProgram.injuryHistory}
                  onChange={(e) => setCustomProgram({ ...customProgram, injuryHistory: e.target.value })}
                  placeholder="Describe any past or current injuries"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Performance Goals (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Agility', 'Endurance', 'Speed', 'Strength', 'Coordination', 'Other'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => togglePerformanceGoal(goal)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        customProgram.performanceGoals.includes(goal)
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
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
                onClick={() => {
                  if (customProgram.deliveryType === 'online') {
                    setCustomizationStep(5); // Equipment step for online
                  } else {
                    onEnroll(); // Final step for in-person
                  }
                }}
                disabled={!customProgram.sport || customProgram.performanceGoals.length === 0}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {customProgram.deliveryType === 'online' ? 'Next Step' : 'Create Program'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Fitness & Wellness Specific */}
        {customizationStep === 4 && customProgram.programCategory === 'fitness-wellness' && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Fitness & Wellness Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Health History</label>
                <textarea
                  value={customProgram.healthHistory}
                  onChange={(e) => setCustomProgram({ ...customProgram, healthHistory: e.target.value })}
                  placeholder="Describe any health conditions, medications, or concerns"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Fitness Goals (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Fat Loss', 'Endurance', 'Hypertrophy', 'Maintenance', 'Other'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleFitnessGoal(goal)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        customProgram.fitnessGoals.includes(goal)
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
                <label className="block text-white mb-2">Other Information</label>
                <textarea
                  value={customProgram.otherInformation}
                  onChange={(e) => setCustomProgram({ ...customProgram, otherInformation: e.target.value })}
                  placeholder="Any additional information you'd like to share"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
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
                onClick={() => {
                  if (customProgram.deliveryType === 'online') {
                    setCustomizationStep(5); // Equipment step for online
                  } else {
                    onEnroll(); // Final step for in-person
                  }
                }}
                disabled={customProgram.fitnessGoals.length === 0}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {customProgram.deliveryType === 'online' ? 'Next Step' : 'Create Program'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Equipment Access (Online only) */}
        {customizationStep === 5 && customProgram.deliveryType === 'online' && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Equipment Access</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">What equipment do you have access to?</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setCustomProgram({ ...customProgram, equipmentAccess: 'gym' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      customProgram.equipmentAccess === 'gym'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Gym Membership
                  </button>
                  <button
                    onClick={() => setCustomProgram({ ...customProgram, equipmentAccess: 'home' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      customProgram.equipmentAccess === 'home'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Home Equipment
                  </button>
                  <button
                    onClick={() => setCustomProgram({ ...customProgram, equipmentAccess: 'none' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      customProgram.equipmentAccess === 'none'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    No Equipment
                  </button>
                </div>
              </div>

              {customProgram.equipmentAccess === 'gym' && (
                <div>
                  <label className="block text-white mb-2">Gym Name</label>
                  <input
                    type="text"
                    value={customProgram.gymName}
                    onChange={(e) => setCustomProgram({ ...customProgram, gymName: e.target.value })}
                    placeholder="e.g., LA Fitness, Gold's Gym"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {customProgram.equipmentAccess === 'home' && (
                <div>
                  <label className="block text-white mb-2">Available Home Equipment (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Dumbbells', 'Barbells', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Bike', 'Treadmill', 'Yoga Mat'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleHomeEquipment(item)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          customProgram.homeEquipment.includes(item)
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCustomizationStep(4)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
              >
                Back
              </button>
              <button
                onClick={onEnroll}
                disabled={enrolling || !customProgram.equipmentAccess}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
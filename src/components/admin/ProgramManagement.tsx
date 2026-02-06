import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, DollarSign, Clock, X, MapPin, TrendingUp, Upload, Image as ImageIcon } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from "sonner";

interface ProgramManagementProps {
  user: any;
}

export function ProgramManagement({ user }: ProgramManagementProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    delivery: 'in-person',
    format: 'individual',
    category: 'sport-performance',
    coachId: '',
    exercises: [] as string[],
    duration: '',
    maxParticipants: ''
  });

  useEffect(() => {
    fetchPrograms();
    fetchCoaches();
    fetchExercises();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/programs`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      } else {
        console.error('Failed to fetch programs');
      }
    } catch (error) {
      console.error('Fetch programs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/coaches`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCoaches(data.coaches || []);
      }
    } catch (error) {
      console.error('Fetch coaches error:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises`,
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
      console.error('Fetch exercises error:', error);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        coachId: formData.coachId || null
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/programs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (selectedImage) {
          await uploadProgramImage(data.program.id);
        }
        setShowCreateModal(false);
        resetForm();
        fetchPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create program');
      }
    } catch (error) {
      console.error('Create program error:', error);
      toast.error('Failed to create program');
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProgram) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        coachId: formData.coachId || null
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/programs/${editingProgram.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (selectedImage) {
          await uploadProgramImage(data.program.id);
        }
        setEditingProgram(null);
        resetForm();
        fetchPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update program');
      }
    } catch (error) {
      console.error('Update program error:', error);
      toast.error('Failed to update program');
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/programs/${programId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchPrograms();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete program');
      }
    } catch (error) {
      console.error('Delete program error:', error);
      toast.error('Failed to delete program');
    }
  };

  const startEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description,
      price: program.price?.toString() || '',
      delivery: program.delivery,
      format: program.format,
      category: program.category,
      coachId: program.coachId || '',
      exercises: program.exercises || [],
      duration: program.duration || '',
      maxParticipants: program.maxParticipants?.toString() || ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      delivery: 'in-person',
      format: 'individual',
      category: 'sport-performance',
      coachId: '',
      exercises: [],
      duration: '',
      maxParticipants: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const toggleExercise = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.includes(exerciseId)
        ? prev.exercises.filter(id => id !== exerciseId)
        : [...prev.exercises, exerciseId]
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProgramImage = async (programId: string) => {
    if (!selectedImage) return;

    try {
      setUploadingImage(true);
      const accessToken = localStorage.getItem('accessToken');
      
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/programs/${programId}/image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      return true;
    } catch (error) {
      console.error('Upload image error:', error);
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const getCategoryBadge = (value: string, type: 'delivery' | 'format' | 'category') => {
    const colors = {
      delivery: { 'in-person': 'bg-blue-500/20 text-blue-400', 'online': 'bg-green-500/20 text-green-400' },
      format: { 'individual': 'bg-purple-500/20 text-purple-400', 'group': 'bg-orange-500/20 text-orange-400' },
      category: { 'sport-performance': 'bg-red-500/20 text-red-400', 'fitness-wellness': 'bg-teal-500/20 text-teal-400' }
    };

    const labels = {
      delivery: { 'in-person': 'In Person', 'online': 'Online' },
      format: { 'individual': 'Individual', 'group': 'Group' },
      category: { 'sport-performance': 'Sport Performance', 'fitness-wellness': 'Fitness & Wellness' }
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[type][value as keyof typeof colors[typeof type]]}`}>
        {labels[type][value as keyof typeof labels[typeof type]]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold mb-2">Program Management</h1>
          <p className="text-gray-400">Create and manage training programs</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus size={20} />
          Create Program
        </button>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading programs...</div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div 
              key={program.id}
              className="bg-gray-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white text-xl font-semibold mb-2">{program.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{program.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getCategoryBadge(program.delivery, 'delivery')}
                    {getCategoryBadge(program.format, 'format')}
                    {getCategoryBadge(program.category, 'category')}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {program.coachName && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users size={16} />
                    <span>Coach: {program.coachName}</span>
                  </div>
                )}

                {program.price && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <DollarSign size={16} />
                    <span>${program.price}</span>
                  </div>
                )}

                {program.duration && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock size={16} />
                    <span>{program.duration}</span>
                  </div>
                )}

                {program.exercises && program.exercises.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <TrendingUp size={16} />
                    <span>{program.exercises.length} exercise{program.exercises.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(program)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProgram(program.id)}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-2">No programs yet</p>
          <p className="text-gray-500 text-sm mb-6">Create your first training program</p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Create Program
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProgram) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowCreateModal(false);
              setEditingProgram(null);
              resetForm();
            }}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingProgram(null);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-3xl mb-6">
              {editingProgram ? 'Edit Program' : 'Create New Program'}
            </h2>

            <form onSubmit={editingProgram ? handleUpdateProgram : handleCreateProgram} className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-white mb-2">Program Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Personal Training - Bootcamp"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe the program..."
                />
              </div>

              {/* Categories */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Delivery *</label>
                  <select
                    value={formData.delivery}
                    onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="in-person">In Person</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Format *</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="sport-performance">Sport Performance</option>
                    <option value="fitness-wellness">Fitness & Wellness</option>
                  </select>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., 45 minutes, 8 weeks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Assign Coach</label>
                  <select
                    value={formData.coachId}
                    onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">No Coach</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.format === 'group' && (
                  <div>
                    <label className="block text-white mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g., 10"
                    />
                  </div>
                )}
              </div>

              {/* Exercise Selection */}
              <div>
                <label className="block text-white mb-2">Select Exercises (Optional)</label>
                <div className="max-h-64 overflow-y-auto bg-black/30 border border-white/10 rounded p-4 space-y-2">
                  {exercises.length > 0 ? (
                    exercises.map((exercise) => (
                      <label key={exercise.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.exercises.includes(exercise.id)}
                          onChange={() => toggleExercise(exercise.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-white text-sm">{exercise.name}</span>
                          <span className="text-gray-500 text-xs ml-2">({exercise.category})</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No exercises available</p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {formData.exercises.length} exercise{formData.exercises.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-white mb-2">Upload Program Image (Optional)</label>
                <div className="flex items-start gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="program-image"
                  />
                  <label
                    htmlFor="program-image"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    <Upload size={16} />
                    Choose Image
                  </label>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border border-white/20"
                      />
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Upload a program image to display on the landing page
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? 'Uploading...' : editingProgram ? 'Update Program' : 'Create Program'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
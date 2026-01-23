import { useState, useEffect } from "react";
import { Plus, X, Search, Filter, Upload, Link as LinkIcon, Video, Image as ImageIcon, Users, User, Tag } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ExerciseAssignmentProps {
  user: any;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  url?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export function ExerciseAssignment({ user }: ExerciseAssignmentProps) {
  // Exercise Library State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Exercise Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    category: '',
    customCategory: '',
    url: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'group'>('individual');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [assignmentDetails, setAssignmentDetails] = useState({
    sets: '',
    reps: '',
    duration: '',
    assignedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchExercises();
    fetchAthletes();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [selectedCategory, searchQuery, exercises]);

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises/categories`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
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
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    const category = createFormData.category === 'other' 
      ? createFormData.customCategory 
      : createFormData.category;

    if (!createFormData.name || !category) {
      alert('Please provide exercise name and category');
      return;
    }

    try {
      setUploading(true);
      const accessToken = localStorage.getItem('accessToken');

      // Upload media if present
      let mediaUrl = '';
      let mediaType: 'image' | 'video' | undefined;

      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaUrl = uploadData.url;
          mediaType = uploadedFile.type.startsWith('image/') ? 'image' : 'video';
        } else {
          alert('Failed to upload media');
          return;
        }
      }

      // Create exercise
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: createFormData.name,
            description: createFormData.description,
            category,
            url: createFormData.url,
            mediaUrl,
            mediaType
          })
        }
      );

      if (response.ok) {
        alert('Exercise created successfully!');
        setShowCreateModal(false);
        resetCreateForm();
        fetchExercises();
        fetchCategories(); // Refresh categories in case new one was added
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create exercise');
      }
    } catch (error) {
      console.error('Create exercise error:', error);
      alert('Failed to create exercise');
    } finally {
      setUploading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      description: '',
      category: '',
      customCategory: '',
      url: ''
    });
    setUploadedFile(null);
    setUploadPreview('');
  };

  const handleOpenAssignModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowAssignModal(true);
  };

  const handleAssignExercise = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAthletes.length === 0) {
      alert('Please select at least one athlete');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/exercises/${selectedExercise?.id}/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            athleteIds: selectedAthletes,
            sets: assignmentDetails.sets ? parseInt(assignmentDetails.sets) : undefined,
            reps: assignmentDetails.reps ? parseInt(assignmentDetails.reps) : undefined,
            duration: assignmentDetails.duration,
            assignedDate: assignmentDetails.assignedDate,
            notes: assignmentDetails.notes
          })
        }
      );

      if (response.ok) {
        alert(`Exercise assigned to ${selectedAthletes.length} athlete(s) successfully!`);
        setShowAssignModal(false);
        resetAssignmentForm();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign exercise');
      }
    } catch (error) {
      console.error('Assign exercise error:', error);
      alert('Failed to assign exercise');
    }
  };

  const resetAssignmentForm = () => {
    setSelectedExercise(null);
    setSelectedAthletes([]);
    setAssignmentType('individual');
    setAssignmentDetails({
      sets: '',
      reps: '',
      duration: '',
      assignedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const toggleAthleteSelection = (athleteId: string) => {
    if (selectedAthletes.includes(athleteId)) {
      setSelectedAthletes(selectedAthletes.filter(id => id !== athleteId));
    } else {
      setSelectedAthletes([...selectedAthletes, athleteId]);
    }
  };

  const selectAllAthletes = () => {
    setSelectedAthletes(athletes.map(a => a.id));
  };

  const deselectAllAthletes = () => {
    setSelectedAthletes([]);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-4xl font-bold mb-2">Exercise Library</h1>
          <p className="text-gray-400">Manage and assign exercises to athletes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus size={20} />
          Create Exercise
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
          }`}
        >
          All Exercises
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading exercises...</div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div 
              key={exercise.id}
              className="bg-gray-900 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all"
            >
              {/* Media Preview */}
              {exercise.mediaUrl && (
                <div className="aspect-video bg-black/50 flex items-center justify-center overflow-hidden">
                  {exercise.mediaType === 'image' ? (
                    <img 
                      src={exercise.mediaUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={exercise.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white text-xl font-semibold">{exercise.name}</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded flex items-center gap-1">
                    <Tag size={12} />
                    {exercise.category}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {exercise.description || 'No description provided'}
                </p>

                {exercise.url && (
                  <a
                    href={exercise.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm flex items-center gap-2 mb-4 hover:text-blue-300 transition-colors"
                  >
                    <LinkIcon size={14} />
                    Reference Link
                  </a>
                )}

                <button
                  onClick={() => handleOpenAssignModal(exercise)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                >
                  Assign to Athletes
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-12 text-center">
          <p className="text-gray-400">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No exercises found matching your filters' 
              : 'No exercises yet. Create your first exercise to get started!'}
          </p>
        </div>
      )}

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-3xl mb-6">Create New Exercise</h2>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              {/* Exercise Name */}
              <div>
                <label className="block text-white mb-2">Exercise Name *</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Barbell Squats, Push-ups, Sprint intervals"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white mb-2">Category *</label>
                <select
                  value={createFormData.category}
                  onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="other">Other (Create New Category)</option>
                </select>
              </div>

              {/* Custom Category */}
              {createFormData.category === 'other' && (
                <div>
                  <label className="block text-white mb-2">New Category Name *</label>
                  <input
                    type="text"
                    value={createFormData.customCategory}
                    onChange={(e) => setCreateFormData({ ...createFormData, customCategory: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., Mobility, Plyometrics"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Detailed instructions for this exercise..."
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-white mb-2">Reference URL</label>
                <input
                  type="url"
                  value={createFormData.url}
                  onChange={(e) => setCreateFormData({ ...createFormData, url: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-white mb-2">Upload Media (Image or Video)</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-white/20 transition-colors">
                  {uploadPreview ? (
                    <div className="space-y-4">
                      <div className="max-h-48 overflow-hidden rounded-lg">
                        {uploadedFile?.type.startsWith('image/') ? (
                          <img src={uploadPreview} alt="Preview" className="mx-auto max-h-48 object-contain" />
                        ) : (
                          <video src={uploadPreview} controls className="mx-auto max-h-48 object-contain" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadPreview('');
                        }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-400 mb-1">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">PNG, JPG, MP4, MOV (max 50MB)</p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Creating...' : 'Create Exercise'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAssignModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-3xl mb-2">Assign Exercise</h2>
            <p className="text-gray-400 mb-6">Assigning: <span className="text-white font-semibold">{selectedExercise.name}</span></p>

            <form onSubmit={handleAssignExercise} className="space-y-6">
              {/* Assignment Type */}
              <div>
                <label className="block text-white mb-3">Assignment Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentType('individual');
                      setSelectedAthletes([]);
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      assignmentType === 'individual'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <User size={20} />
                    Individual Athletes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentType('group')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      assignmentType === 'group'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Users size={20} />
                    Group Assignment
                  </button>
                </div>
              </div>

              {/* Select Athletes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white">Select Athletes *</label>
                  {assignmentType === 'group' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllAthletes}
                        className="text-blue-400 text-sm hover:text-blue-300"
                      >
                        Select All
                      </button>
                      <span className="text-gray-600">|</span>
                      <button
                        type="button"
                        onClick={deselectAllAthletes}
                        className="text-blue-400 text-sm hover:text-blue-300"
                      >
                        Deselect All
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {athletes.length > 0 ? (
                    athletes.map((athlete) => (
                      <label
                        key={athlete.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAthletes.includes(athlete.id)}
                          onChange={() => toggleAthleteSelection(athlete.id)}
                          className="w-4 h-4 rounded border-white/10"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">{athlete.fullName}</p>
                          <p className="text-gray-400 text-xs">{athlete.email}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-2">No athletes available</p>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {selectedAthletes.length} athlete(s) selected
                </p>
              </div>

              {/* Exercise Parameters */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Sets</label>
                  <input
                    type="number"
                    value={assignmentDetails.sets}
                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, sets: e.target.value })}
                    min="1"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Reps</label>
                  <input
                    type="number"
                    value={assignmentDetails.reps}
                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, reps: e.target.value })}
                    min="1"
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Duration</label>
                  <input
                    type="text"
                    value={assignmentDetails.duration}
                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, duration: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="30 min"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-white mb-2">Assigned Date</label>
                <input
                  type="date"
                  value={assignmentDetails.assignedDate}
                  onChange={(e) => setAssignmentDetails({ ...assignmentDetails, assignedDate: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white mb-2">Notes (Optional)</label>
                <textarea
                  value={assignmentDetails.notes}
                  onChange={(e) => setAssignmentDetails({ ...assignmentDetails, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Additional instructions for athletes..."
                />
              </div>

              <button
                type="submit"
                disabled={selectedAthletes.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to {selectedAthletes.length} Athlete(s)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

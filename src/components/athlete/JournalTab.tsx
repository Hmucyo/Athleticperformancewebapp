import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image, Video, FileText, X, Smile, Meh, Frown } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface JournalTabProps {
  user: any;
}

export function JournalTab({ user }: JournalTabProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/journal/entries`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('Title and content are required');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/journal/entries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ title: '', content: '', mood: '', tags: [] });
        fetchEntries();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Create entry error:', error);
      alert('Failed to create entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/journal/entries/${entryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchEntries();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Delete entry error:', error);
      alert('Failed to delete entry');
    }
  };

  const handleMediaUpload = async (entryId: string, file: File) => {
    setUploadingMedia(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/journal/entries/${entryId}/media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formDataToSend
        }
      );

      if (response.ok) {
        fetchEntries();
        // Update selected entry if viewing
        if (selectedEntry?.id === entryId) {
          const updatedEntry = entries.find(e => e.id === entryId);
          if (updatedEntry) {
            setSelectedEntry(updatedEntry);
          }
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Upload media error:', error);
      alert('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <Smile className="text-green-400" size={20} />;
      case 'neutral':
        return <Meh className="text-yellow-400" size={20} />;
      case 'sad':
        return <Frown className="text-red-400" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-4xl font-bold mb-2">Journal</h1>
          <p className="text-gray-400">Track your training progress and thoughts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Plus size={20} />
          New Entry
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading entries...</div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white text-xl font-semibold flex-1">{entry.title}</h3>
                {entry.mood && getMoodIcon(entry.mood)}
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">{entry.content}</p>
              
              {entry.media && entry.media.length > 0 && (
                <div className="flex items-center gap-1 mb-3 text-gray-500 text-sm">
                  <Image size={16} />
                  <span>{entry.media.length} attachment{entry.media.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-500 text-xs">
                {new Date(entry.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-12 text-center">
          <FileText className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 mb-2">No journal entries yet</p>
          <p className="text-gray-500 text-sm mb-6">Start documenting your training journey</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Create Your First Entry
          </button>
        </div>
      )}

      {/* Create Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-2xl p-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-white text-3xl mb-6">New Journal Entry</h2>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Entry title"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Mood</label>
                <div className="flex gap-3">
                  {['happy', 'neutral', 'sad'].map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood })}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        formData.mood === mood
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {getMoodIcon(mood)}
                        <span className="text-white capitalize">{mood}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                Create Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white text-3xl mb-2">{selectedEntry.title}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(selectedEntry.createdAt).toLocaleDateString()} at {new Date(selectedEntry.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {selectedEntry.mood && (
                <div className="flex items-center gap-2">
                  {getMoodIcon(selectedEntry.mood)}
                  <span className="text-gray-400 capitalize">{selectedEntry.mood}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{selectedEntry.content}</p>
            </div>

            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedEntry.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {selectedEntry.media && selectedEntry.media.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Attachments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEntry.media.map((media: any, index: number) => (
                    <div key={index} className="relative">
                      {media.type.startsWith('image/') ? (
                        <img 
                          src={media.url} 
                          alt={media.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : media.type.startsWith('video/') ? (
                        <video 
                          src={media.url}
                          controls
                          className="w-full h-48 rounded-lg bg-black"
                        />
                      ) : (
                        <div className="w-full h-48 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                          <FileText className="text-gray-500" size={48} />
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mt-2 truncate">{media.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-6 flex gap-3">
              <label className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpload(selectedEntry.id, file);
                    }
                  }}
                  disabled={uploadingMedia}
                />
                {uploadingMedia ? 'Uploading...' : 'Add Media'}
              </label>
              
              <button
                onClick={() => handleDeleteEntry(selectedEntry.id)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
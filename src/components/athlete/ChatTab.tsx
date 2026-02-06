import { useState, useEffect, useRef } from "react";
import { Send, Users, Hash, Search, X, Lock } from "lucide-react";
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ChatTabProps {
  user: any;
}

export function ChatTab({ user }: ChatTabProps) {
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchChannels();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
      
      // Poll for new messages every 3 seconds
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedChannel.id, true);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async (preserveSelection = false) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Store current selection to preserve it
      const currentChannelId = preserveSelection && selectedChannel ? selectedChannel.id : null;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/channels`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
        
        if (preserveSelection && currentChannelId) {
          // Find and restore the previously selected channel
          const preservedChannel = data.channels?.find((c: any) => c.id === currentChannelId);
          if (preservedChannel) {
            setSelectedChannel(preservedChannel);
          } else if (data.channels && data.channels.length > 0) {
            // If preserved channel not found, select first channel
            setSelectedChannel(data.channels[0]);
          }
        } else {
          // Auto-select first channel only on initial load
          if (data.channels && data.channels.length > 0 && !selectedChannel) {
            setSelectedChannel(data.channels[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string, silent = false) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/messages/${channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch messages:', error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim() || !selectedChannel) {
      return;
    }

    setSending(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Determine recipientId for direct messages
      let recipientId = null;
      if (selectedChannel.type === 'direct') {
        // Extract recipientId from channel ID (format: dm:userId)
        recipientId = selectedChannel.id.startsWith('dm:') 
          ? selectedChannel.id.replace('dm:', '')
          : selectedChannel.recipientId || selectedChannel.id.split(':')[1];
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            channelId: selectedChannel.id,
            content: messageContent,
            recipientId: recipientId
          })
        }
      );

      if (response.ok) {
        setMessageContent('');
        fetchMessages(selectedChannel.id, true);
        // Refresh channels list to include new conversations, but preserve current selection
        fetchChannels(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (message: any) => {
    return message.senderId === user.id;
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query);
    }, 300);
  };

  const searchUsers = async (query: string) => {
    try {
      setSearchLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/search-users?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = async (selectedUser: any) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Create or get DM channel with this user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/chat/dm-channel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            recipientId: selectedUser.id
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedChannel(data.channel);
        setSearchQuery('');
        setIsSearching(false);
        setSearchResults([]);
        // Refresh channels list to include the new conversation, but preserve the selected channel
        fetchChannels(true);
      }
    } catch (error) {
      console.error('Create DM error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Channels Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">Channels</h2>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              placeholder="Search people..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results or Channels */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            /* Search Results */
            <>
              {searchLoading ? (
                <div className="p-4 text-gray-400 text-sm">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
                    Search Results
                  </div>
                  {searchResults.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleUserSelect(person)}
                      className="w-full p-4 text-left border-b border-white/5 transition-colors text-gray-400 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {person.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-white">{person.fullName}</p>
                          <p className="text-xs text-gray-500 truncate capitalize">{person.role}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-gray-500 text-sm">No people found</div>
              ) : null}
            </>
          ) : (
            /* Regular Channels */
            <>
              {loading ? (
                <div className="p-4 text-gray-400 text-sm">Loading channels...</div>
              ) : channels.length > 0 ? (
                channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full p-4 text-left border-b border-white/5 transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {channel.type === 'group' ? (
                        <Hash size={20} />
                      ) : (
                        <Users size={20} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{channel.name}</p>
                        {channel.description && (
                          <p className="text-xs opacity-75 truncate">{channel.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-sm">No channels available</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 bg-gray-900 border-b border-white/10">
              <div className="flex items-center gap-3">
                {selectedChannel.type === 'group' ? (
                  <Hash className="text-gray-400" size={24} />
                ) : (
                  <Users className="text-gray-400" size={24} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white text-xl font-semibold">{selectedChannel.name}</h2>
                    {selectedChannel.locked && (
                      <Lock className="text-yellow-500" size={18} title="Channel is locked" />
                    )}
                  </div>
                  {selectedChannel.description && (
                    <p className="text-gray-400 text-sm">{selectedChannel.description}</p>
                  )}
                  {selectedChannel.locked && (
                    <p className="text-yellow-500 text-xs mt-1">This channel is locked. Only admins can send messages.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isMyMessage(message) ? 'order-2' : 'order-1'}`}>
                      {!isMyMessage(message) && (
                        <p className="text-gray-400 text-xs mb-1 px-3">{message.senderName}</p>
                      )}
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          isMyMessage(message)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${isMyMessage(message) ? 'text-white/70' : 'text-gray-500'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-900 border-t border-white/10">
              {selectedChannel.locked && user.role !== 'admin' ? (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <Lock className="text-yellow-500" size={18} />
                  <p className="text-yellow-500 text-sm">This channel is locked. Only admins can send messages.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageContent.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
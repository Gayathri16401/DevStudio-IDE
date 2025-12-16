import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Terminal, Trash2, Copy, Edit2, Check, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ClearConsoleDialog } from "./ClearConsoleDialog";
import { DeleteMessageDialog } from "./DeleteMessageDialog";

interface ChatTabProps {
  user: string;
  isActive?: boolean;
}

interface LogEntry {
  id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: string;
  created_at: string;
  acknowledgement: string | null;
}

export interface ChatTabRef {
  clearConsole: () => Promise<void>;
}

const ChatTab = forwardRef<ChatTabRef, ChatTabProps>(({ user, isActive = true }, ref) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user: authUser } = useAuth();
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  // Expose clearConsole method to parent
  useImperativeHandle(ref, () => ({
    clearConsole: handleClearForMe
  }));

  // Load username on mount
  useEffect(() => {
    if (authUser) {
      loadUsername();
    }
  }, [authUser]);

  // Load messages only once on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadMessages();
      hasLoadedRef.current = true;
    } else {
      // If already loaded, set loading to false immediately
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time updates with error handling and reconnection
  useEffect(() => {
    const channel = supabase
      .channel('console_messages', {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.console'
        },
        (payload) => {
          console.log('Real-time INSERT received:', payload);
          setLogs(prev => {
            // Prevent duplicates
            if (prev.some(log => log.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new as LogEntry];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.console'
        },
        (payload) => {
          console.log('Real-time DELETE received:', payload);
          // Remove deleted message from local state instead of reloading
          setLogs(prev => prev.filter(log => log.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.console'
        },
        (payload) => {
          console.log('Real-time UPDATE received:', payload);
          // Update message in local state
          setLogs(prev => prev.map(log =>
            log.id === payload.new.id ? payload.new as LogEntry : log
          ));
        }
      )
      .subscribe((status, err) => {
        console.log('Subscription status:', status);
        if (err) {
          console.error('Subscription error:', err);
          toast.error('Connection issue detected. Reconnecting...');
        }
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, reloading messages...');
          loadMessages();
        }
        if (status === 'TIMED_OUT') {
          console.error('Subscription timed out, reloading messages...');
          loadMessages();
        }
      });

    return () => {
      console.log('Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive or tab becomes active
  useEffect(() => {
    if (isActive && logs.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      });
    }
  }, [logs, isActive]);

  // Scroll to bottom when tab becomes active
  useEffect(() => {
    if (isActive && consoleRef.current && logs.length > 0) {
      requestAnimationFrame(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      });
    }
  }, [isActive]);

  // Focus input when tab becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      // Small delay to ensure the tab transition is complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isActive]);

  const loadUsername = async () => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading username:', error);
      } else if (data) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('console_messages')
        .select('*')
        .eq('chat_type', 'console')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('console_messages')
        .select('*')
        .eq('chat_type', 'console')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLogs(data || []);
      toast.success('Console refreshed');
    } catch (error) {
      console.error('Error refreshing console:', error);
      toast.error('Failed to refresh console');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && authUser && username) {
      try {
        const { error } = await supabase
          .from('console_messages')
          .insert({
            user_id: authUser.id,
            username: username,
            content: newMessage.trim(),
            message_type: 'message',
            chat_type: 'console'
          });

        if (error) throw error;
        setNewMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };

  const handleClearForMe = async () => {
    if (!authUser) return;
    
    try {
      const { error } = await supabase
        .from('console_messages')
        .delete()
        .eq('user_id', authUser.id)
        .eq('chat_type', 'console');

      if (error) throw error;
      
      // Immediately update local state by filtering out user's messages
      setLogs(prev => prev.filter(log => log.user_id !== authUser.id));
      
      toast.success('Your messages cleared');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error('Failed to clear messages');
    }
  };

  const handleClearForEveryone = async () => {
    try {
      const { error } = await supabase
        .from('console_messages')
        .delete()
        .eq('chat_type', 'console')
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      
      // Immediately clear all local messages
      setLogs([]);
      
      toast.success('Console cleared for everyone');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing console:', error);
      toast.error('Failed to clear console');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  const getLogColor = (type: string) => {
    return type === 'system' ? 'text-green-400' : 'text-yellow-400';
  };

  const copyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('console_messages')
        .delete()
        .eq('id', messageToDelete);

      if (error) throw error;
      
      // Immediately update local state
      setLogs(prev => prev.filter(log => log.id !== messageToDelete));
      
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const startEditing = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const saveEdit = async (messageId: string) => {
    if (!editedContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('console_messages')
        .update({ content: editedContent.trim() })
        .eq('id', messageId);

      if (error) throw error;
      
      toast.success('Message updated');
      setEditingMessageId(null);
      setEditedContent("");
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };


  return (
    <>
      <ClearConsoleDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onClearForMe={handleClearForMe}
        onClearForEveryone={handleClearForEveryone}
      />
      
      <DeleteMessageDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteMessage}
      />
      
      <div className="h-full flex flex-col bg-black relative">
        {/* Terminal Header - looks like VS Code terminal */}
        <div className="relative flex items-center justify-between px-2 sm:px-3 py-1.5 bg-[#1e1e1e] border-b border-[#2d2d2d]">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-gray-400 font-mono whitespace-nowrap">bash</span>
          <span className="text-[10px] sm:text-xs text-gray-600 hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-xs text-gray-500 font-mono whitespace-nowrap hidden sm:inline">node v18.17.0</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 sm:h-6 px-1 sm:px-2 transition-colors flex-shrink-0"
            title="Refresh console"
          >
            <RefreshCw className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowClearDialog(true)}
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 sm:h-6 px-1 sm:px-2 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
        </div>
      </div>
      
        {/* Terminal Console Area - authentic terminal look */}
        <div ref={consoleRef} className="p-2 sm:p-3 bg-black overflow-y-auto terminal-scrollbar" style={{ height: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div className="text-gray-500 text-[10px] sm:text-xs font-mono">
              <span className="text-green-400">✓</span> Loading workspace...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-gray-600 text-[10px] sm:text-xs font-mono space-y-1">
              <div><span className="text-blue-400">info</span> Development server running</div>
              <div><span className="text-green-400">ready</span> Compiled successfully</div>
              <div className="text-gray-700 mt-2">Waiting for file changes...</div>
            </div>
          ) : (
            <div className="space-y-0 font-mono text-[10px] sm:text-xs leading-relaxed">
              {logs.map((log) => {
                const isCurrentUser = authUser && log.user_id === authUser.id;
                const isEditing = editingMessageId === log.id;
                return (
                  <div key={log.id}>
                    {log.message_type === 'message' ? (
                      <div className="group mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-gray-700">
                              [{formatDateTime(log.created_at)}]
                            </span>
                            <span className={isCurrentUser ? "text-green-400" : "text-blue-400"}>
                              {isCurrentUser ? "►" : "◄"}
                            </span>
                            <span className={`${isCurrentUser ? "text-green-400" : "text-blue-400"} inline-block w-[32px]`}>
                              {isCurrentUser ? "DEBUG" : "INFO"}
                            </span>
                            {/* Show acknowledgement field only on hover */}
                            <div className={`min-w-[20px] max-w-[100px] bg-[#1a1a1a] border rounded px-1.5 py-0.5 text-[9px] transition-all whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 ${
                              isCurrentUser
                                ? 'border-green-700/40 text-green-400/70 hover:border-green-600/60 focus:border-green-500 focus:text-green-400'
                                : 'border-blue-700/40 text-blue-400/70 cursor-text hover:border-blue-600/60 focus:border-blue-500 focus:text-blue-400'
                            } ${!isCurrentUser ? 'focus:bg-[#252525]' : ''}`}
                                 contentEditable={!isCurrentUser}
                                 suppressContentEditableWarning={true}
                                 title={isCurrentUser ? "Acknowledgement (read-only)" : "Acknowledgement"}
                                 style={{ outline: 'none', minHeight: '20px', display: 'inline-flex', alignItems: 'center' }}
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     e.preventDefault();
                                   }
                                 }}
                                 onBlur={async (e) => {
                                   if (isCurrentUser) return; // Don't allow editing own message acknowledgements
                                   const target = e.target as HTMLDivElement;
                                   const ackValue = target.textContent?.trim() || null;
                                   try {
                                     await supabase
                                       .from('console_messages')
                                       .update({ acknowledgement: ackValue })
                                       .eq('id', log.id);
                                     // Update local state
                                     setLogs(prev => prev.map(l =>
                                       l.id === log.id ? { ...l, acknowledgement: ackValue } : l
                                     ));
                                   } catch (error) {
                                     console.error('Error saving acknowledgement:', error);
                                   }
                                 }}
                                 onInput={(e) => {
                                   const target = e.target as HTMLDivElement;
                                   target.style.width = 'auto';
                                 }}>
                              {log.acknowledgement || ''}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {isCurrentUser && !isEditing && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(log.id, log.content)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 w-5 p-0 transition-opacity"
                                  title="Edit message"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(log.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-[#2d2d2d] h-5 w-5 p-0 transition-opacity"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(log.content, log.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 w-5 p-0 transition-opacity"
                              title="Copy message"
                            >
                              {copiedMessageId === log.id ? (
                                <span className="text-[9px]">✓</span>
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="flex-1 bg-[#1e1e1e] border-gray-700 text-gray-300 font-mono text-[10px] sm:text-xs h-6 sm:h-7"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEdit(log.id);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEdit(log.id)}
                              className="text-green-400 hover:text-green-300 hover:bg-[#2d2d2d] h-6 w-6 p-0"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="text-red-400 hover:text-red-300 hover:bg-[#2d2d2d] h-6 w-6 p-0"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-gray-300 break-all overflow-wrap-anywhere mt-0.5">
                            {log.content}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-green-400 break-words text-[10px] sm:text-xs">
                        <span className="text-gray-600">›</span> {log.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      
        {/* Terminal Input Area - command prompt style */}
        <div className="border-t border-[#2d2d2d] p-1 bg-[#1e1e1e]">
          <form onSubmit={handleSend} className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-green-400 font-mono text-xs sm:text-sm font-bold select-none">❯</span>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="npm run dev"
              className="flex-1 bg-black border-none text-gray-300 font-mono text-[10px] sm:text-xs h-6 sm:h-7 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-700 px-1 sm:px-2"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim()}
              className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-400 hover:text-gray-300 h-6 sm:h-7 px-2 sm:px-3 disabled:opacity-30 text-[10px] sm:text-xs font-mono border-none transition-colors"
            >
              <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
});

ChatTab.displayName = 'ChatTab';

export default ChatTab;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Terminal, Trash2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ClearConsoleDialog } from "./ClearConsoleDialog";

interface ChatTabProps {
  user: string;
}

interface LogEntry {
  id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: string;
  created_at: string;
}

const ChatTab = ({ user }: ChatTabProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  // Load username on mount
  useEffect(() => {
    if (authUser) {
      loadUsername();
    }
  }, [authUser]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('console_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.console'
        },
        (payload) => {
          setLogs(prev => [...prev, payload.new as LogEntry]);
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
        () => {
          loadMessages(); // Reload all messages when any is deleted
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  return (
    <>
      <ClearConsoleDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onClearForMe={handleClearForMe}
        onClearForEveryone={handleClearForEveryone}
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
          <Button
            onClick={() => setShowClearDialog(true)}
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 sm:h-6 px-1 sm:px-2 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
        </div>
      
        {/* Terminal Console Area - authentic terminal look */}
        <div className="p-2 sm:p-3 bg-black overflow-y-auto terminal-scrollbar" style={{ height: 'calc(100vh - 200px)' }}>
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
                return (
                  <div key={log.id}>
                    {log.message_type === 'message' ? (
                      <div className="group">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-600">
                            <span className="text-gray-700">
                              [{formatDateTime(log.created_at)}]
                            </span>
                            <span className={isCurrentUser ? "text-green-400 ml-2" : "text-blue-400 ml-2"}>
                              {isCurrentUser ? "►" : "◄"}
                            </span>
                            <span className={isCurrentUser ? "text-green-400 ml-1" : "text-blue-400 ml-1"}>
                              {isCurrentUser ? "DEBUG" : "INFO"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(log.content, log.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-5 w-5 p-0 transition-opacity"
                          >
                            {copiedMessageId === log.id ? (
                              <span className="text-[9px]">✓</span>
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </Button>
                        </div>
                        <div className="text-gray-300 break-all overflow-wrap-anywhere mb-3">
                          {log.content}
                        </div>
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
};

export default ChatTab;

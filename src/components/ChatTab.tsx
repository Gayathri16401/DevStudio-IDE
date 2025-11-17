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
        <div className="relative flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400 font-mono">bash</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500 font-mono">node v18.17.0</span>
          </div>
          <Button
            onClick={() => setShowClearDialog(true)}
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d] h-6 px-2 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      
        {/* Terminal Console Area - authentic terminal look */}
        <div className="p-3 bg-black overflow-y-auto terminal-scrollbar" style={{ height: 'calc(100vh - 235px)' }}>
          {loading ? (
            <div className="text-gray-500 text-xs font-mono">
              <span className="text-green-400">✓</span> Loading workspace...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-gray-600 text-xs font-mono space-y-1">
              <div><span className="text-blue-400">info</span> Development server running at http://localhost:5173</div>
              <div><span className="text-green-400">ready</span> Compiled successfully in 234ms</div>
              <div className="text-gray-700 mt-2">Waiting for file changes...</div>
            </div>
          ) : (
            <div className="space-y-0 font-mono text-xs leading-relaxed">
              {logs.map((log) => (
                <div key={log.id}>
                  {log.message_type === 'message' ? (
                    <div className="group">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-600">
                          <span className="text-gray-700">[{formatTime(log.created_at)}]</span>
                          <span className="text-blue-400 ml-2">DEBUG</span>
                          <span className="text-gray-500 ml-2">@{log.username}</span>
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
                    <div className="text-green-400 break-words">
                      <span className="text-gray-600">›</span> {log.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      
        {/* Terminal Input Area - command prompt style */}
        <div className="border-t border-[#2d2d2d] p-1 bg-[#1e1e1e]">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <span className="text-green-400 font-mono text-sm font-bold select-none">❯</span>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="npm run dev"
              className="flex-1 bg-black border-none text-gray-300 font-mono text-xs h-7 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-700 px-2"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim()}
              className="bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-400 hover:text-gray-300 h-7 px-3 disabled:opacity-30 text-xs font-mono border-none transition-colors"
            >
              <Send className="w-3 h-3" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatTab;

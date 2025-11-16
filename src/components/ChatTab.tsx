import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Terminal, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UsernameDialog } from "./UsernameDialog";
import { ClearConsoleDialog } from "./ClearConsoleDialog";

interface ChatTabProps {
  user: string;
}

interface LogEntry {
  id: string;
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
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
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
          table: 'console_messages'
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
          table: 'console_messages'
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
        if (error.code === 'PGRST116') {
          // No profile found, show username dialog
          setShowUsernameDialog(true);
        } else {
          throw error;
        }
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
            message_type: 'message'
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
        .eq('user_id', authUser.id);

      if (error) throw error;
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
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
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

  return (
    <>
      <UsernameDialog 
        open={showUsernameDialog} 
        onComplete={(newUsername) => {
          setUsername(newUsername);
          setShowUsernameDialog(false);
        }} 
      />
      
      <ClearConsoleDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onClearForMe={handleClearForMe}
        onClearForEveryone={handleClearForEveryone}
      />
      
      <div className="h-full flex flex-col bg-slate-900">
        <div className="flex items-center justify-between p-2 border-b border-slate-700">
          <div className="flex items-center">
            <Terminal className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-sm font-medium text-slate-300">Console Output</span>
          </div>
          <Button
            onClick={() => setShowClearDialog(true)}
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-slate-400 text-sm font-mono">Loading messages...</div>
        ) : logs.length === 0 ? (
          <div className="text-slate-400 text-sm font-mono">No messages yet. Start chatting!</div>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="flex">
                <span className="text-slate-500 mr-3">
                  {formatTime(log.created_at)}
                </span>
                <span className={getLogColor(log.message_type)}>
                  {log.message_type === 'message' ? `[USER:${log.username}]` : ''} {log.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t border-slate-700 p-3">
        <form onSubmit={handleSend} className="flex space-x-2">
          <span className="text-green-400 text-sm font-mono flex items-center">$</span>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter command or message..."
            className="flex-1 bg-slate-800 border-slate-600 text-slate-100 font-mono text-sm"
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      </div>
    </>
  );
};

export default ChatTab;

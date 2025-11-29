import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Send, User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ClearMessagesDialog } from "./ClearMessagesDialog";

interface NormalChatProps {
  user: string;
  onLogout: () => void;
}

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  message_type: string;
  created_at: string;
}

const NormalChat = ({ user, onLogout }: NormalChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
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
      .channel('normal_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.normal'
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'console_messages',
          filter: 'chat_type=eq.normal'
        },
        () => {
          loadMessages();
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
        .eq('chat_type', 'normal')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
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
            chat_type: 'normal'
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
        .eq('chat_type', 'normal');

      if (error) throw error;
      
      // Immediately update local state by filtering out user's messages
      setMessages(prev => prev.filter(msg => msg.user_id !== authUser.id));
      
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
        .eq('chat_type', 'normal')
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      
      // Immediately clear all local messages
      setMessages([]);
      
      toast.success('Messages cleared for everyone');
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error('Failed to clear messages');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // If message is from today, show only time
    if (messageDate.getTime() === today.getTime()) {
      return time;
    }
    // If message is from yesterday
    else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday ${time}`;
    }
    // If message is from this year, show date without year
    else if (date.getFullYear() === now.getFullYear()) {
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} ${time}`;
    }
    // If message is from a previous year, show full date
    else {
      const dateStr = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      return `${dateStr} ${time}`;
    }
  };

  return (
    <>
      <ClearMessagesDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onClearForMe={handleClearForMe}
        onClearForEveryone={handleClearForEveryone}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto h-screen sm:h-auto">
          <Card className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-3 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">SecuChat - Welcome!</span>
              </CardTitle>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  className="text-white hover:bg-white/20 h-8 px-2 sm:px-3"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-white hover:bg-white/20 h-8 px-2 sm:px-3"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </CardHeader>
          
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-3 sm:p-6">
                {loading ? (
                  <div className="text-gray-500 text-xs sm:text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500 text-xs sm:text-sm">No messages yet. Start chatting!</div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                            message.username === username
                              ? 'bg-blue-600 text-white'
                              : message.message_type === 'system'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-medium mb-1">{message.username}</div>
                          <div className="text-xs sm:text-sm break-words">{message.content}</div>
                          <div className={`text-[10px] sm:text-xs mt-1 ${
                            message.username === username ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            
            <div className="border-t p-2 sm:p-4">
              <form onSubmit={handleSend} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 text-sm h-9 sm:h-10"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-9 w-9 sm:h-10 sm:w-10 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NormalChat;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Send, User } from "lucide-react";

interface NormalChatProps {
  user: string;
  onLogout: () => void;
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

const NormalChat = ({ user, onLogout }: NormalChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "System",
      text: "Welcome to SecureChat! You're in Normal Mode.",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user,
        text: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-2rem)] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>SecureChat - Welcome, {user}</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user === user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.user === user
                          ? 'bg-blue-600 text-white'
                          : message.user === 'System'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{message.user}</div>
                      <div className="text-sm">{message.text}</div>
                      <div className={`text-xs mt-1 ${
                        message.user === user ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <form onSubmit={handleSend} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NormalChat;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Terminal } from "lucide-react";

interface ChatTabProps {
  user: string;
}

interface LogEntry {
  id: string;
  type: 'system' | 'user' | 'message';
  user?: string;
  content: string;
  timestamp: Date;
}

const ChatTab = ({ user }: ChatTabProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      type: "system",
      content: "[INFO] Application started successfully",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "system",
      content: "[DEBUG] Database connection established",
      timestamp: new Date(),
    },
    {
      id: "3",
      type: "system",
      content: "[INFO] Server listening on port 3000",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const entry: LogEntry = {
        id: Date.now().toString(),
        type: "message",
        user,
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      setLogs(prev => [...prev, entry]);
      setNewMessage("");
      
      // Simulate system response
      setTimeout(() => {
        const response: LogEntry = {
          id: (Date.now() + 1).toString(),
          type: "system",
          content: `[INFO] Message processed: "${newMessage.trim()}"`,
          timestamp: new Date(),
        };
        setLogs(prev => [...prev, response]);
      }, 1000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'text-green-400';
      case 'user':
        return 'text-blue-400';
      case 'message':
        return 'text-yellow-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center p-2 border-b border-slate-700">
        <Terminal className="w-4 h-4 mr-2 text-green-400" />
        <span className="text-sm font-medium text-slate-300">Console Output</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log) => (
            <div key={log.id} className="flex">
              <span className="text-slate-500 mr-3">
                {formatTime(log.timestamp)}
              </span>
              <span className={getLogColor(log.type)}>
                {log.type === 'message' ? `[USER:${log.user}]` : ''} {log.content}
              </span>
            </div>
          ))}
        </div>
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
  );
};

export default ChatTab;

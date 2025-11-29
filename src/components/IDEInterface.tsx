
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  File,
  Folder,
  Play,
  Square,
  Settings,
  Terminal,
  MessageSquare,
  Lock,
  Unlock,
  FolderOpen,
  FileText,
  Coffee
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import ChatTab from "./ChatTab";
import EncryptionTab from "./EncryptionTab";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface IDEInterfaceProps {
  user: string;
  onLogout: () => void;
}

const IDEInterface = ({ user, onLogout }: IDEInterfaceProps) => {
  const [activeTab, setActiveTab] = useState("main.js");
  const [username, setUsername] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  // Load username on mount
  useEffect(() => {
    if (authUser) {
      loadUsername();
    }
  }, [authUser]);

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Menu Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <span className="font-semibold text-sm sm:text-base">DevStudio</span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-slate-400">
            <File className="w-4 h-4" />
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Run</span>
            <span>Tools</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-400 hover:text-white hover:bg-slate-700 text-xs sm:text-sm"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-2 sm:px-4 py-1 flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs whitespace-nowrap">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Run</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs whitespace-nowrap">
          <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Stop</span>
        </Button>
        <div className="h-4 w-px bg-slate-600 mx-1 sm:mx-2" />
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700 text-xs whitespace-nowrap">
          <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden lg:flex w-48 xl:w-64 bg-slate-800 border-r border-slate-700 flex-col">
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <FolderOpen className="w-4 h-4" />
              <span>Project Explorer</span>
            </div>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-700 rounded text-sm">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>src</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-700 rounded text-sm ml-4">
                <FileText className="w-4 h-4 text-green-400" />
                <span>main.js</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-700 rounded text-sm ml-4">
                <FileText className="w-4 h-4 text-green-400" />
                <span>utils.js</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-700 rounded text-sm">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>components</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-700 rounded text-sm">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span>package.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-slate-800 border-b border-slate-700 justify-start rounded-none h-auto p-0 overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="main.js"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none border-r border-slate-700 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">main.js</span>
                <span className="sm:hidden">Code</span>
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none border-r border-slate-700 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Console Output</span>
                <span className="sm:hidden">Console</span>
              </TabsTrigger>
              <TabsTrigger
                value="encryption"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Security Tools</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="main.js" className="h-full m-0">
                <CodeEditor />
              </TabsContent>
              <TabsContent value="chat" className="h-full m-0">
                <ChatTab user={user} />
              </TabsContent>
              <TabsContent value="encryption" className="h-full m-0">
                <EncryptionTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-2 sm:px-4 py-1 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 overflow-x-auto">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span>Ready</span>
          <span className="hidden sm:inline">JavaScript</span>
          <span className="hidden md:inline">Line 42, Column 15</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden md:inline">LF</span>
          <span>v2.1.0</span>
        </div>
      </div>
    </div>
  );
};

export default IDEInterface;

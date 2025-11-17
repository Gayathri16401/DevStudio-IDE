
import { useState } from "react";
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

interface IDEInterfaceProps {
  user: string;
  onLogout: () => void;
}

const IDEInterface = ({ user, onLogout }: IDEInterfaceProps) => {
  const [activeTab, setActiveTab] = useState("main.js");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Menu Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">DevStudio</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <File className="w-4 h-4" />
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Run</span>
            <span>Tools</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">User: {user}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-1 flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
          <Play className="w-4 h-4 mr-1" />
          Run
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
          <Square className="w-4 h-4 mr-1" />
          Stop
        </Button>
        <div className="h-4 w-px bg-slate-600 mx-2" />
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <FolderOpen className="w-4 h-4" />
              <span>Project Explorer</span>
            </div>
          </div>
          <div className="flex-1 p-2">
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
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-slate-800 border-b border-slate-700 justify-start rounded-none h-auto p-0">
              <TabsTrigger 
                value="main.js" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none border-r border-slate-700 px-4 py-2"
              >
                <FileText className="w-4 h-4 mr-2" />
                main.js
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none border-r border-slate-700 px-4 py-2"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Console Output
              </TabsTrigger>
              <TabsTrigger 
                value="encryption" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-none px-4 py-2"
              >
                <Lock className="w-4 h-4 mr-2" />
                Security Tools
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
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>JavaScript</span>
          <span>Line 42, Column 15</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>LF</span>
          <span>DevStudio v2.1.0</span>
        </div>
      </div>
    </div>
  );
};

export default IDEInterface;

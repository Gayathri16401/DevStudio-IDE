
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  File,
  Folder,
  Play,
  Square,
  Settings,
  MessageSquare,
  Lock,
  FolderOpen,
  FileText,
  Coffee,
  Save
} from "lucide-react";
import CodeEditor from "./CodeEditor";
import AppFileViewer from "./AppFileViewer";
import PackageJsonViewer from "./PackageJsonViewer";
import ChatTab, { ChatTabRef } from "./ChatTab";
import EncryptionTab, { EncryptionTabRef } from "./EncryptionTab";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IDEInterfaceProps {
  user: string;
  onLogout: () => void;
}

const IDEInterface = ({ user, onLogout }: IDEInterfaceProps) => {
  const [activeTab, setActiveTab] = useState("main.tsx");
  const [username, setUsername] = useState<string | null>(null);
  const { user: authUser } = useAuth();
  const chatTabRef = useRef<ChatTabRef>(null);
  const encryptionTabRef = useRef<EncryptionTabRef>(null);

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

  const handleSaveAll = () => {
    // Clear all console messages locally (from current user's view only)
    if (chatTabRef.current) {
      chatTabRef.current.clearAllLocally();
    }
    
    // Clear encryption data
    if (encryptionTabRef.current) {
      encryptionTabRef.current.clearAll();
    }
    
    // No toast notifications - silent operation
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Menu Bar */}
      <div className="bg-card border-b border-border px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <span className="font-semibold text-sm sm:text-base">DevStudio</span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <File className="w-4 h-4" />
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Run</span>
            <span>Tools</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground hover:bg-accent text-xs sm:text-sm"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border-b border-border px-2 sm:px-4 py-1 flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent text-xs whitespace-nowrap">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Run</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent text-xs whitespace-nowrap">
          <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Stop</span>
        </Button>
        <div className="h-4 w-px bg-border mx-1 sm:mx-2" />
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent text-xs whitespace-nowrap">
          <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
        <div className="h-4 w-px bg-border mx-1 sm:mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveAll}
          className="text-muted-foreground hover:text-foreground hover:bg-accent text-xs whitespace-nowrap"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden sm:inline">Save All</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden lg:flex w-48 xl:w-64 bg-card border-r border-border flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <FolderOpen className="w-4 h-4" />
              <span>Project Explorer</span>
            </div>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>.gitignore</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>index.html</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span>package.json</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>README.md</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>tsconfig.json</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">node_modules</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>public</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>favicon.svg</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>placeholder.svg</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>src</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>index.tsx</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>App.tsx</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>main.tsx</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>api</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-8 cursor-pointer">
                <FileText className="w-4 h-4 text-green-400" />
                <span>client.ts</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>hooks</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-8 cursor-pointer">
                <FileText className="w-4 h-4 text-green-400" />
                <span>useAuth.ts</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>pages</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-8 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Home.tsx</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-8 cursor-pointer">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Dashboard.tsx</span>
              </div>
              <div className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded text-sm ml-4 cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>utils</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-card border-b border-border justify-start rounded-none h-auto p-0 overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="main.tsx"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none border-r border-border px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                main.tsx
              </TabsTrigger>
              <TabsTrigger
                value="App.tsx"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none border-r border-border px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                App.tsx
              </TabsTrigger>
              <TabsTrigger
                value="package.json"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none border-r border-border px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                package.json
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none border-r border-border px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Console Output</span>
                <span className="sm:hidden">Console</span>
              </TabsTrigger>
              <TabsTrigger
                value="encryption"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Configurations</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="main.tsx" className="h-full m-0">
                <CodeEditor />
              </TabsContent>
              <TabsContent value="App.tsx" className="h-full m-0">
                <AppFileViewer />
              </TabsContent>
              <TabsContent value="package.json" className="h-full m-0">
                <PackageJsonViewer />
              </TabsContent>
              <div className={activeTab === "chat" ? "h-full" : "hidden h-full"}>
                <ChatTab ref={chatTabRef} user={user} isActive={activeTab === "chat"} />
              </div>
              <div className={activeTab === "encryption" ? "h-full" : "hidden h-full"}>
                <EncryptionTab ref={encryptionTabRef} />
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t border-border px-2 sm:px-4 py-1 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground overflow-x-auto">
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

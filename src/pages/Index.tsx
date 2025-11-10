
import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import NormalChat from "@/components/NormalChat";
import IDEInterface from "@/components/IDEInterface";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  console.log('Index component rendering')
  
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = useState<"normal" | "hard">("hard");

  console.log('Index state:', { user: !!user, loading, mode })

  const handleModeSelect = (selectedMode: "normal" | "hard") => {
    console.log('mode selected:', selectedMode)
    setMode(selectedMode);
  };

  const handleLogout = async () => {
    console.log('logout clicked')
    await signOut();
    setMode("hard");
  };

  // Show loading while checking auth state
  if (loading) {
    console.log('showing loading screen')
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    console.log('showing login screen')
    return <LoginScreen onModeSelect={handleModeSelect} />;
  }

  console.log('showing main interface, mode:', mode)
  // Show selected interface based on mode
  if (mode === "normal") {
    return <NormalChat user={user.user_metadata?.full_name || user.email || 'User'} onLogout={handleLogout} />;
  }

  return <IDEInterface user={user.user_metadata?.full_name || user.email || 'User'} onLogout={handleLogout} />;
};

export default Index;

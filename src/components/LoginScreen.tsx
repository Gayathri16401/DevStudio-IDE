import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageCircle, Code2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SettingsDialog from "@/components/SettingsDialog";

interface LoginScreenProps {
  onModeSelect: (mode: "normal" | "hard") => void;
}

const LoginScreen = ({ onModeSelect }: LoginScreenProps) => {
  const [mode, setMode] = useState<"normal" | "hard">("hard");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account Created",
          description: "Please check your email for verification.",
        });
      } else {
        await signIn(email, password);
        onModeSelect(mode);
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg w-16 h-16 flex items-center justify-center">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">DevStudio</CardTitle>
          <CardDescription className="text-slate-300">
            Professional Development Environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-slate-200 text-sm font-medium">Workspace Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: "normal" | "hard") => setMode(value)}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 transition-colors">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Standard Workspace</div>
                    <div className="text-slate-400 text-sm">Clean interface for development</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 transition-colors">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <Code2 className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Advanced Workspace</div>
                    <div className="text-slate-400 text-sm">Full IDE with advanced tools</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
            
            <div className="text-center">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-400 hover:text-white"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </Button>
            </div>
            
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>Configure connection</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default LoginScreen;

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UsernameDialogProps {
  open: boolean;
  onComplete: (username: string) => void;
}

export const UsernameDialog = ({ open, onComplete }: UsernameDialogProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: username.trim()
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Username already taken. Please choose another.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Username set successfully!');
      onComplete(username.trim());
    } catch (error) {
      console.error('Error setting username:', error);
      toast.error('Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
          <DialogDescription>
            Choose a username that will be displayed with your messages
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username..."
            maxLength={20}
            required
          />
          <Button type="submit" disabled={loading || !username.trim()} className="w-full">
            {loading ? 'Setting...' : 'Set Username'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

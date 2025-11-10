import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { setSupabaseConfig } from '@/lib/supabase'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setUrl(localStorage.getItem('supabase_url') ?? '')
      setAnonKey(localStorage.getItem('supabase_anon_key') ?? '')
    }
  }, [open])

  const handleSave = () => {
    try {
      if (!url || !anonKey) {
        toast({ title: 'Missing values', description: 'Please provide both URL and anon key.', variant: 'destructive' })
        return
      }
      setSupabaseConfig(url, anonKey)
      toast({ title: 'Saved', description: 'Supabase connection saved. Reloading...' })
      setTimeout(() => window.location.reload(), 600)
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Connection</DialogTitle>
          <DialogDescription>
            Paste your Supabase Project URL and public anon key. This is safe to store on the client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sb-url">Supabase URL</Label>
            <Input id="sb-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-key">Supabase Anon Key</Label>
            <Input id="sb-key" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="eyJhbGci..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog

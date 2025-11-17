import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClearMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearForMe: () => void;
  onClearForEveryone: () => void;
}

export const ClearMessagesDialog = ({
  open,
  onOpenChange,
  onClearForMe,
  onClearForEveryone,
}: ClearMessagesDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="text-base font-medium">Clear Messages</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500">
            Choose who you want to clear messages for:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearForMe}
            className="bg-slate-600 hover:bg-slate-700 text-xs h-8"
          >
            Clear for Me
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onClearForEveryone}
            className="bg-red-600 hover:bg-red-700 text-xs h-8"
          >
            Clear for Everyone
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

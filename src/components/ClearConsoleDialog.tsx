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

interface ClearConsoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearForMe: () => void;
  onClearForEveryone: () => void;
}

export const ClearConsoleDialog = ({
  open,
  onOpenChange,
  onClearForMe,
  onClearForEveryone,
}: ClearConsoleDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Console</AlertDialogTitle>
          <AlertDialogDescription>
            How would you like to clear the console?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearForMe}
            className="bg-slate-600 hover:bg-slate-700"
          >
            Clear My Messages
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onClearForEveryone}
            className="bg-red-600 hover:bg-red-700"
          >
            Clear For Everyone
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

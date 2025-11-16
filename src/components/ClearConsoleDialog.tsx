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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle className="text-base font-medium">Clear Console Output</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500">
            Select console clearing scope:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearForMe}
            className="bg-slate-600 hover:bg-slate-700 text-xs h-8"
          >
            Clear Local Logs
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onClearForEveryone}
            className="bg-red-600 hover:bg-red-700 text-xs h-8"
          >
            Clear All Logs
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

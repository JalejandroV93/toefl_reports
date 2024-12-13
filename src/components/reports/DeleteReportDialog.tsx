// components/reports/DeleteReportDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteReportDialogProps {
  reportId: string;
  onDelete: () => Promise<void>;
}

export function DeleteReportDialog({ onDelete }: DeleteReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (deleteKey !== process.env.NEXT_PUBLIC_DELETE_KEY) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid deletion key",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onDelete();
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Please enter the deletion key to confirm:</p>
          <Input
            type="password"
            value={deleteKey}
            onChange={(e) => setDeleteKey(e.target.value)}
            placeholder="Enter deletion key"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
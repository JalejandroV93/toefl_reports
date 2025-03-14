// components/reports/DeleteReportDialog.tsx
import { useState } from "react";
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
  const [deleteKey, setDeleteKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // Validar la clave primero
      const response = await fetch("/api/reports/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteKey }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid deletion key",
        });
        return;
      }

      setIsLoading(true);
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
        <Button variant="destructive" size="lg">
          <Trash2 className="h-10 w-10" />
          <p>Eliminar Reportes</p>
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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

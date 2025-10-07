import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DurationInput } from "./DurationInput";
import { Observation } from "@/hooks/useObservations";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface EditObservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: Observation | null;
  onSave: (id: string, updates: Partial<Observation>) => void;
}

export const EditObservationDialog = ({
  open,
  onOpenChange,
  observation,
  onSave,
}: EditObservationDialogProps) => {
  const [observer, setObserver] = useState("");
  const [student, setStudent] = useState("");
  const [status, setStatus] = useState<"on-task" | "off-task" | "transitioning">("on-task");
  const [duration, setDuration] = useState(0);
  const [who, setWho] = useState<string[]>([]);
  const [what, setWhat] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [why, setWhy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (observation) {
      setObserver(observation.observer);
      setStudent(observation.student);
      setStatus(observation.status);
      setDuration(observation.duration);
      setWho(observation.context.who);
      setWhat(observation.context.what);
      setWhen(observation.context.when);
      setWhere(observation.context.where);
      setWhy(observation.context.why);
      setNotes(observation.context.notes);
    }
  }, [observation]);

  const handleSave = () => {
    if (!observer.trim() || !student.trim()) {
      toast({
        title: "Validation Error",
        description: "Observer and Student are required fields.",
        variant: "destructive",
      });
      return;
    }

    if (observation) {
      onSave(observation.id, {
        observer: observer.trim(),
        student: student.trim(),
        status,
        duration,
        context: {
          who: who,
          what: what.trim(),
          when: when.trim(),
          where: where.trim(),
          why: why.trim(),
          notes: notes.trim(),
        },
      });
      toast({
        title: "Success",
        description: "Observation updated successfully.",
      });
      onOpenChange(false);
    }
  };

  if (!observation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Observation</DialogTitle>
          <DialogDescription>
            Modify any field and save your changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="observer">Observer *</Label>
            <Input
              id="observer"
              value={observer}
              onChange={(e) => setObserver(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Student Initials *</Label>
            <Input
              id="student"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-task">On-Task</SelectItem>
                <SelectItem value="off-task">Off-Task</SelectItem>
                <SelectItem value="transitioning">Transitioning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DurationInput value={duration} onChange={setDuration} />

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Context (5W's)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="who">Who (Others Present)</Label>
              <div className="flex flex-wrap gap-2">
                {["Peers", "Teacher", "Para", "Admin", "Parent", "Therapist", "Substitute", "Volunteer", "Other"].map((option) => (
                  <Badge
                    key={option}
                    variant={who.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setWho((prev) =>
                        prev.includes(option)
                          ? prev.filter((w) => w !== option)
                          : [...prev, option]
                      );
                    }}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
              {who.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {who.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="what">What</Label>
              <Input
                id="what"
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="when">When</Label>
              <Input
                id="when"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="where">Where</Label>
              <Input
                id="where"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why">Why</Label>
              <Input
                id="why"
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

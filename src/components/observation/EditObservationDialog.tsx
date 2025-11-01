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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DurationInput } from "./DurationInput";
import { Observation } from "@/hooks/useObservations";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const [behavior, setBehavior] = useState<string>("");
  const [behaviorOther, setBehaviorOther] = useState<string>("");
  const [who, setWho] = useState<string[]>([]);
  const [what, setWhat] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [why, setWhy] = useState("");
  const [notes, setNotes] = useState("");
  const [prompts, setPrompts] = useState<{type: string, effectiveness?: string}[]>([]);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (observation) {
      const data = {
        observer: observation.observer,
        student: observation.student,
        behavior: observation.behavior || observation.context.behavior || "",
        status: observation.status,
        duration: observation.duration,
        who: observation.context.who,
        what: observation.context.what,
        when: observation.context.when,
        where: observation.context.where,
        why: observation.context.why,
        notes: observation.context.notes,
        prompts: observation.context.prompts || [],
      };
      
      setObserver(data.observer);
      setStudent(data.student);
      setBehavior(data.behavior);
      setBehaviorOther("");
      setStatus(data.status);
      setDuration(data.duration);
      setWho(data.who);
      setWhat(data.what);
      setWhen(data.when);
      setWhere(data.where);
      setWhy(data.why);
      setNotes(data.notes);
      setPrompts(data.prompts.map((p: any) => ({ 
        type: p.type, 
        effectiveness: p.effectiveness 
      })));
      setOriginalData(data);
    }
  }, [observation]);

  const handleRevert = () => {
    if (originalData) {
      setObserver(originalData.observer);
      setStudent(originalData.student);
      setStatus(originalData.status);
      setDuration(originalData.duration);
      setWho(originalData.who);
      setWhat(originalData.what);
      setWhen(originalData.when);
      setWhere(originalData.where);
      setWhy(originalData.why);
      setNotes(originalData.notes);
      setPrompts(originalData.prompts.map((p: any) => ({ 
        type: p.type, 
        effectiveness: p.effectiveness 
      })));
      toast({
        title: "Changes Reverted",
        description: "All changes have been reset to original values.",
      });
    }
  };

  const handleSave = () => {
    if (!observer.trim() || !student.trim()) {
      toast({
        title: "Validation Error",
        description: "Observer and Student are required.",
        variant: "destructive",
      });
      return;
    }

    if (observation) {
      const promptsWithTimestamps = prompts.map((p) => ({
        type: p.type,
        timestamp: new Date(),
        effectiveness: p.effectiveness as "effective" | "partially-effective" | "ineffective" | undefined,
      }));

      onSave(observation.id, {
        observer: observer.trim(),
        student: student.trim(),
        behavior: behavior && behavior !== "Other" ? behavior : (behavior === "Other" && behaviorOther.trim() ? behaviorOther.trim() : ""),
        status,
        duration,
        context: {
          who: who,
          what: what.trim(),
          when: when.trim(),
          where: where.trim(),
          why: why.trim(),
          notes: notes.trim(),
          prompts: promptsWithTimestamps,
          behavior: behavior && behavior !== "Other" ? behavior : (behavior === "Other" && behaviorOther.trim() ? behaviorOther.trim() : ""),
        },
      });
      toast({
        title: "Success",
        description: "Observation updated successfully.",
      });
      onOpenChange(false);
    }
  };

  const toggleWho = (option: string) => {
    setWho((prev) =>
      prev.includes(option)
        ? prev.filter((w) => w !== option)
        : [...prev, option]
    );
  };

  const togglePrompt = (promptType: string) => {
    setPrompts((prev) => {
      const exists = prev.find((p) => p.type === promptType);
      if (exists) {
        return prev.filter((p) => p.type !== promptType);
      }
      return [...prev, { type: promptType }];
    });
  };

  const updatePromptEffectiveness = (promptType: string, effectiveness: string) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.type === promptType ? { ...p, effectiveness } : p
      )
    );
  };

  if (!observation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editing: {observation.student} - {format(observation.createdAt, "MM/dd/yyyy HH:mm")}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div>Created: {format(observation.createdAt, "MM/dd/yyyy HH:mm:ss")}</div>
            {observation.lastModified && (
              <div>Last Modified: {format(observation.lastModified, "MM/dd/yyyy HH:mm:ss")}</div>
            )}
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

        {/* Behavior — optional. */}
        <div className="space-y-2">
          <Label htmlFor="behavior">Behavior — optional.</Label>
          <div className="grid md:grid-cols-2 gap-2">
            <Select value={behavior} onValueChange={setBehavior}>
              <SelectTrigger id="behavior">
                <SelectValue placeholder="Select behavior (you can add this later)" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Verbal Outburst">Verbal Outburst</SelectItem>
                <SelectItem value="Physical Aggression">Physical Aggression</SelectItem>
                <SelectItem value="Off-Task Behavior">Off-Task Behavior</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Self-Injury">Self-Injury</SelectItem>
                <SelectItem value="Tantrum">Tantrum</SelectItem>
                <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                <SelectItem value="Positive Participation">Positive Participation</SelectItem>
                <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
                <SelectItem value="Attention Seeking">Attention Seeking</SelectItem>
                <SelectItem value="Fidgeting">Fidgeting</SelectItem>
                <SelectItem value="Spitting">Spitting</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {behavior === "Other" && (
              <Input
                placeholder="Specify behavior..."
                value={behaviorOther}
                onChange={(e) => setBehaviorOther(e.target.value)}
              />
            )}
          </div>
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

          {/* Episodes Summary */}
          {observation.episodes && observation.episodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Episodes Recorded ({observation.episodes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {observation.episodes.map((episode, idx) => (
                    <div key={episode.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">Episode {idx + 1}: </span>
                        <Badge
                          variant={
                            episode.status === "on-task"
                              ? "default"
                              : episode.status === "off-task"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {episode.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, "0")} at{" "}
                        {format(episode.startTime, "HH:mm:ss")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Context (5W's)</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="who">Who (Others Present)</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWho(["Peers", "Teacher", "Para", "Admin", "Parent", "Therapist", "Substitute", "Volunteer"])}
                    className="text-xs text-primary hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setWho([])}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Peers", "Teacher", "Para", "Admin", "Parent", "Therapist", "Substitute", "Volunteer", "Other"].map((option) => (
                  <Badge
                    key={option}
                    variant={who.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleWho(option)}
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

            {/* Prompts Section */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">
                Prompts/Interventions Used
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Verbal Prompt",
                  "Visual Prompt", 
                  "Physical Prompt",
                  "Gestural Prompt",
                  "Positional Prompt",
                  "Model/Demo",
                  "Wait Time",
                  "Choice Offered",
                  "Break Provided",
                  "Redirection",
                  "Behavior Praise",
                  "Token/Reward",
                  "Environmental Mod",
                  "Other"
                ].map((promptType) => (
                  <div key={promptType} className="space-y-1">
                    <Badge
                      variant={prompts.find((p) => p.type === promptType) ? "default" : "outline"}
                      className="cursor-pointer w-full justify-center"
                      onClick={() => togglePrompt(promptType)}
                    >
                      {promptType}
                    </Badge>
                    {prompts.find((p) => p.type === promptType) && (
                      <Select
                        value={prompts.find((p) => p.type === promptType)?.effectiveness || ""}
                        onValueChange={(value) => updatePromptEffectiveness(promptType, value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Effectiveness?" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="effective">Effective</SelectItem>
                          <SelectItem value="partially-effective">Partially</SelectItem>
                          <SelectItem value="ineffective">Ineffective</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
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

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleRevert}>
            Revert Changes
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

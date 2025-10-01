import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContextData {
  student: string;
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
  notes: string;
}

interface ContextCaptureProps {
  onContextChange: (context: ContextData) => void;
  recentStudents: string[];
  isTimerRunning: boolean;
}

const getCurrentTimeBlock = () => {
  const hour = new Date().getHours();
  if (hour < 8.5) return "Warm-up";
  if (hour < 10) return "Core Instruction";
  if (hour < 11) return "Practice";
  if (hour < 12) return "Centers";
  if (hour < 13) return "Specials";
  if (hour < 14) return "Core Instruction";
  if (hour < 15) return "End of Day";
  return "Transition";
};

export function ContextCapture({ onContextChange, recentStudents, isTimerRunning }: ContextCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [context, setContext] = useState<ContextData>({
    student: "",
    who: "None",
    what: "Independent Work",
    when: getCurrentTimeBlock(),
    where: "Classroom",
    why: "Unclear",
    notes: "",
  });
  const [whatOther, setWhatOther] = useState("");
  const [whenOther, setWhenOther] = useState("");
  const [whereOther, setWhereOther] = useState("");
  const [whyOther, setWhyOther] = useState("");

  useEffect(() => {
    onContextChange(context);
  }, [context, onContextChange]);

  const updateContext = (field: keyof ContextData, value: string) => {
    setContext((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-2">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle>Context Capture (5W Framework)</CardTitle>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Student Selection (WHO - Primary) */}
          <div className="space-y-2">
            <Label htmlFor="student" className="text-base font-semibold">
              Student <span className="text-destructive">*</span>
            </Label>
            {recentStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Recent:</span>
                {recentStudents.slice(0, 3).map((student) => (
                  <Badge
                    key={student}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => updateContext("student", student)}
                  >
                    {student}
                  </Badge>
                ))}
              </div>
            )}
            <Input
              id="student"
              placeholder="Enter student name or initials"
              value={context.student}
              onChange={(e) => updateContext("student", e.target.value)}
              disabled={isTimerRunning}
              className="text-base"
            />
          </div>

          {/* WHO - Others Present */}
          <div className="space-y-2">
            <Label htmlFor="who" className="text-sm font-medium">
              Others Present (WHO)
            </Label>
            <div className="flex flex-wrap gap-2">
              {["Peers", "Teacher", "Para", "None", "Other"].map((option) => (
                <Badge
                  key={option}
                  variant={context.who === option ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateContext("who", option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* WHAT - Activity/Task */}
          <div className="space-y-2">
            <Label htmlFor="what" className="text-sm font-medium">
              Activity/Task (WHAT)
            </Label>
            <Select value={context.what} onValueChange={(value) => updateContext("what", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Independent Work">Independent Work</SelectItem>
                <SelectItem value="Group Work">Group Work</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Math">Math</SelectItem>
                <SelectItem value="Discussion">Discussion</SelectItem>
                <SelectItem value="Centers">Centers</SelectItem>
                <SelectItem value="Free Choice">Free Choice</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {context.what === "Other" && (
              <Input
                placeholder="Specify activity..."
                value={whatOther}
                onChange={(e) => setWhatOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* WHEN - Schedule Block */}
          <div className="space-y-2">
            <Label htmlFor="when" className="text-sm font-medium">
              Schedule Block (WHEN)
            </Label>
            <Select value={context.when} onValueChange={(value) => updateContext("when", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Warm-up">Warm-up</SelectItem>
                <SelectItem value="Core Instruction">Core Instruction</SelectItem>
                <SelectItem value="Practice">Practice</SelectItem>
                <SelectItem value="Centers">Centers</SelectItem>
                <SelectItem value="Specials">Specials</SelectItem>
                <SelectItem value="Transition">Transition</SelectItem>
                <SelectItem value="End of Day">End of Day</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {context.when === "Other" && (
              <Input
                placeholder="Specify schedule block..."
                value={whenOther}
                onChange={(e) => setWhenOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* WHERE - Location */}
          <div className="space-y-2">
            <Label htmlFor="where" className="text-sm font-medium">
              Location (WHERE)
            </Label>
            <Select value={context.where} onValueChange={(value) => updateContext("where", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Classroom">Classroom</SelectItem>
                <SelectItem value="Small Group Room">Small Group Room</SelectItem>
                <SelectItem value="Hallway">Hallway</SelectItem>
                <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                <SelectItem value="Playground">Playground</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {context.where === "Other" && (
              <Input
                placeholder="Specify location..."
                value={whereOther}
                onChange={(e) => setWhereOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* WHY - Function/Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="why" className="text-sm font-medium">
              Function/Hypothesis (WHY)
            </Label>
            <Select value={context.why} onValueChange={(value) => updateContext("why", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Escape/Avoid">Escape/Avoid</SelectItem>
                <SelectItem value="Attention-Seeking">Attention-Seeking</SelectItem>
                <SelectItem value="Sensory">Sensory</SelectItem>
                <SelectItem value="Access to Tangible">Access to Tangible</SelectItem>
                <SelectItem value="Skill Deficit">Skill Deficit</SelectItem>
                <SelectItem value="Fatigue">Fatigue</SelectItem>
                <SelectItem value="Motivation">Motivation</SelectItem>
                <SelectItem value="Unclear">Unclear</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {context.why === "Other" && (
              <Input
                placeholder="Specify function/hypothesis..."
                value={whyOther}
                onChange={(e) => setWhyOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Contextual Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional observations or context..."
              value={context.notes}
              onChange={(e) => updateContext("notes", e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

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
import { BehaviorSelector } from "./BehaviorSelector";

export interface Prompt {
  type: string;
  timestamp: Date;
  effectiveness?: "effective" | "partially-effective" | "ineffective";
}

interface ContextData {
  who: string[];
  what: string;
  when: string;
  where: string;
  why: string;
  notes: string;
  prompts?: Prompt[];
  behavior?: string;
}

interface ContextCaptureProps {
  onContextChange: (context: ContextData) => void;
  recentStudents: string[];
  isTimerRunning: boolean;
  shouldResetForm?: boolean;
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

export function ContextCapture({ onContextChange, recentStudents, isTimerRunning, shouldResetForm }: ContextCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("context5WExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [context, setContext] = useState<ContextData>({
    who: [],
    what: "Independent Work",
    when: getCurrentTimeBlock(),
    where: "Classroom",
    why: "Unclear",
    notes: "",
    prompts: [],
  });
  const [whatOther, setWhatOther] = useState("");
  const [whenOther, setWhenOther] = useState("");
  const [whereOther, setWhereOther] = useState("");
  const [whyOther, setWhyOther] = useState("");
  const [promptOther, setPromptOther] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<{type: string, effectiveness?: string}[]>([]);
  const [behavior, setBehavior] = useState<string>("");
  const [behaviorOther, setBehaviorOther] = useState<string>("");

  // Reset form to defaults when shouldResetForm changes
  useEffect(() => {
    if (shouldResetForm) {
      setContext({
        who: [],
        what: "Independent Work",
        when: getCurrentTimeBlock(),
        where: "Classroom",
        why: "Unclear",
        notes: "",
        prompts: [],
        behavior: "",
      });
      setBehavior("");
      setBehaviorOther("");
      setWhatOther("");
      setWhenOther("");
      setWhereOther("");
      setWhyOther("");
      setPromptOther("");
      setSelectedPrompts([]);
    }
  }, [shouldResetForm]);

  useEffect(() => {
    onContextChange(context);
  }, [context, onContextChange]);

  const updateContext = (field: keyof ContextData, value: string) => {
    setContext((prev) => ({ ...prev, [field]: value }));
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem("context5WExpanded", JSON.stringify(newExpanded));
  };

  const toggleWho = (option: string) => {
    setContext((prev) => {
      const newWho = prev.who.includes(option)
        ? prev.who.filter((w) => w !== option)
        : [...prev.who, option];
      return { ...prev, who: newWho };
    });
  };

  const togglePrompt = (promptType: string) => {
    setSelectedPrompts((prev) => {
      const exists = prev.find((p) => p.type === promptType);
      if (exists) {
        return prev.filter((p) => p.type !== promptType);
      }
      return [...prev, { type: promptType }];
    });
  };

  const updatePromptEffectiveness = (promptType: string, effectiveness: string) => {
    setSelectedPrompts((prev) =>
      prev.map((p) =>
        p.type === promptType ? { ...p, effectiveness } : p
      )
    );
  };

  useEffect(() => {
    const promptsWithTimestamps = selectedPrompts.map((p) => ({
      type: p.type === "Other" && promptOther ? promptOther : p.type,
      timestamp: new Date(),
      effectiveness: p.effectiveness as "effective" | "partially-effective" | "ineffective" | undefined,
    }));
    setContext((prev) => ({ ...prev, prompts: promptsWithTimestamps }));
  }, [selectedPrompts, promptOther]);

  // Keep top-level behavior in context up to date
  useEffect(() => {
    const resolved = behavior === "Other" && behaviorOther ? behaviorOther : behavior;
    setContext((prev) => ({ ...prev, behavior: resolved }));
  }, [behavior, behaviorOther]);

  const getSummaryText = () => {
    const parts = [
      `Who: ${context.who.length > 0 ? context.who.join(", ") : "None"}`,
      `What: ${context.what === "Other" && whatOther ? whatOther : context.what}`,
      `When: ${context.when === "Other" && whenOther ? whenOther : context.when}`,
      `Where: ${context.where === "Other" && whereOther ? whereOther : context.where}`,
      `Why: ${context.why === "Other" && whyOther ? whyOther : context.why}`,
    ];
    if (context.prompts && context.prompts.length > 0) {
      parts.push(`Prompts: ${context.prompts.length}`);
    }
    if (context.notes) {
      parts.push("📝 Has notes");
    }
    return parts.join(" | ");
  };

  return (
    <Card className="border-2">
      <CardHeader className="cursor-pointer" onClick={toggleExpanded}>
        <div className="flex items-center justify-between">
          <CardTitle>Context (5W's)</CardTitle>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>
      
      {!isExpanded && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground truncate">{getSummaryText()}</p>
        </CardContent>
      )}
      
      {isExpanded && (
        <CardContent className="space-y-4 animate-accordion-down">
          {/* WHO - Others Present (Multi-Select) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="who" className="text-sm font-medium">
                Others Present (WHO)
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContext((prev) => ({ ...prev, who: ["Peers", "Teacher", "Para", "Admin", "Parent", "Therapist", "Substitute", "Volunteer"] }))}
                  className="text-xs text-primary hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setContext((prev) => ({ ...prev, who: [] }))}
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
                  variant={context.who.includes(option) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleWho(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
            {context.who.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {context.who.join(", ")}
              </p>
            )}
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

          {/* PROMPTS - Interventions Used */}
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
                    variant={selectedPrompts.find((p) => p.type === promptType) ? "default" : "outline"}
                    className="cursor-pointer w-full justify-center"
                    onClick={() => togglePrompt(promptType)}
                  >
                    {promptType}
                  </Badge>
                  {selectedPrompts.find((p) => p.type === promptType) && (
                    <Select
                      value={selectedPrompts.find((p) => p.type === promptType)?.effectiveness || ""}
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
            {selectedPrompts.find((p) => p.type === "Other") && (
              <Input
                placeholder="Specify other prompt..."
                value={promptOther}
                onChange={(e) => setPromptOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* BEHAVIOR - Behavior Observed (Optional) - Moved to top for better hierarchy */}
          <div className="space-y-2 border-t pt-4">
            <BehaviorSelector
              value={behavior}
              otherValue={behaviorOther}
              onChange={setBehavior}
              onOtherChange={setBehaviorOther}
              disabled={false}
            />
          </div>

          {/* Observer Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Observer Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional observations or context..."
              value={context.notes}
              onChange={(e) => updateContext("notes", e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Notes will be searchable in reports
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

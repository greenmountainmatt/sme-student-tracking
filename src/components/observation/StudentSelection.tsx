import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

interface StudentSelectionProps {
  onStudentChange: (student: string) => void;
  currentStudent: string;
  recentStudents: string[];
  isTimerRunning: boolean;
}

export function StudentSelection({
  onStudentChange,
  currentStudent,
  recentStudents,
  isTimerRunning,
}: StudentSelectionProps) {
  return (
    <Card className="border-2 border-primary/20 bg-accent/10">
      <CardContent className="pt-6 space-y-3">
        <Label htmlFor="student" className="text-base font-semibold flex items-center gap-2">
          <UserCircle className="w-4 h-4" />
          Student <span className="text-destructive">*</span>
        </Label>
        
        {recentStudents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Recent:</span>
            {recentStudents.slice(0, 3).map((student) => (
              <Badge
                key={student}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => !isTimerRunning && onStudentChange(student)}
              >
                {student}
              </Badge>
            ))}
          </div>
        )}
        
        <Input
          id="student"
          placeholder="Enter student initials"
          value={currentStudent}
          onChange={(e) => onStudentChange(e.target.value)}
          disabled={isTimerRunning}
          className="text-sm h-10"
        />
      </CardContent>
    </Card>
  );
}

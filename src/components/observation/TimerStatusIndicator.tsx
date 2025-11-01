import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimerStatusIndicatorProps {
  student: string;
  elapsedTime: number;
  isPaused: boolean;
}

export function TimerStatusIndicator({
  student,
  elapsedTime,
  isPaused,
}: TimerStatusIndicatorProps) {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 border-2 border-primary bg-card shadow-lg">
      <div className="p-3 flex items-center gap-3">
        <Timer className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">
            {isPaused ? "Paused:" : "Observing:"} {student}
          </p>
          <p className="text-sm font-bold tabular-nums">{formatTime(elapsedTime)}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/")}
          className="min-h-[44px]"
        >
          Return
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

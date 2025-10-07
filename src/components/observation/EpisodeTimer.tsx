import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Square, Timer } from "lucide-react";
import { toast } from "sonner";

interface EpisodeTimerProps {
  status: "on-task" | "off-task" | "transitioning";
  onEpisodeEnd: (duration: number, status: "on-task" | "off-task" | "transitioning") => void;
  isActive: boolean;
  onCancel: () => void;
}

export function EpisodeTimer({ status, onEpisodeEnd, isActive, onCancel }: EpisodeTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEnd = () => {
    if (elapsedTime === 0) {
      toast.error("Episode duration must be greater than 0");
      return;
    }
    onEpisodeEnd(elapsedTime, status);
    setElapsedTime(0);
  };

  if (!isActive) return null;

  const statusColors = {
    "on-task": "bg-success/10 border-success",
    "off-task": "bg-destructive/10 border-destructive",
    "transitioning": "bg-warning/10 border-warning"
  };

  const statusText = {
    "on-task": "On Task",
    "off-task": "Off Task",
    "transitioning": "Transitioning"
  };

  return (
    <Card className={`p-3 border-2 ${statusColors[status]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <span className="text-sm font-medium">Episode: {statusText[status]}</span>
        </div>
        <div className="text-lg font-bold tabular-nums">
          {formatTime(elapsedTime)}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEnd}
          >
            <Square className="mr-1 h-3 w-3" />
            End
          </Button>
        </div>
      </div>
    </Card>
  );
}
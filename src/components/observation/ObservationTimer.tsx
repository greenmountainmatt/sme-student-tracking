import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";

interface ObservationTimerProps {
  onStatusChange: (status: "on-task" | "off-task" | "transitioning") => void;
  currentStatus: "on-task" | "off-task" | "transitioning" | null;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerEnd: (duration: number) => void;
  isRunning: boolean;
  isPaused: boolean;
  observer: string;
  student: string;
}

export function ObservationTimer({
  onStatusChange,
  currentStatus,
  onTimerStart,
  onTimerPause,
  onTimerEnd,
  isRunning,
  isPaused,
  observer,
  student,
}: ObservationTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!observer) {
      toast.error("Please enter your name as observer");
      return;
    }
    if (!student) {
      toast.error("Please enter student initials");
      return;
    }
    if (!currentStatus) {
      toast.error("Please select a task status first");
      return;
    }
    setElapsedTime(0);
    onTimerStart();
    toast.success("Timer started");
  };

  const handlePauseResume = () => {
    onTimerPause();
    toast.info(isPaused ? "Timer resumed" : "Timer paused");
  };

  const handleEnd = () => {
    if (elapsedTime === 0) {
      toast.error("Cannot end timer with zero duration");
      return;
    }
    onTimerEnd(elapsedTime);
    setElapsedTime(0);
    toast.success("Observation saved");
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-center">Observation Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Status</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="status-active"
              size="lg"
              onClick={() => onStatusChange("on-task")}
              data-active={currentStatus === "on-task"}
              disabled={isRunning || !observer}
            >
              On Task
            </Button>
            <Button
              variant="status-inactive"
              size="lg"
              onClick={() => onStatusChange("off-task")}
              data-active={currentStatus === "off-task"}
              disabled={isRunning || !observer}
            >
              Off Task
            </Button>
            <Button
              variant="status-transition"
              size="lg"
              onClick={() => onStatusChange("transitioning")}
              data-active={currentStatus === "transitioning"}
              disabled={isRunning || !observer}
            >
              Transitioning
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-6xl font-bold text-timer-display tabular-nums">
            {formatTime(elapsedTime)}
          </div>
          {isPaused && (
            <div className="text-sm text-warning font-medium">PAUSED</div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="space-y-3">
          {!isRunning ? (
            <>
              <Button
                variant="success"
                size="xl"
                className="w-full"
                onClick={handleStart}
                disabled={!observer || !student}
              >
                <Play className="mr-2" />
                START Timer
              </Button>
              {(!observer || !student) && (
                <p className="text-xs text-center text-muted-foreground">
                  Enter observer and student to begin
                </p>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={isPaused ? "success" : "warning"}
                size="xl"
                onClick={handlePauseResume}
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2" />
                    RESUME
                  </>
                ) : (
                  <>
                    <Pause className="mr-2" />
                    PAUSE
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="xl"
                onClick={handleEnd}
              >
                <Square className="mr-2" />
                END
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

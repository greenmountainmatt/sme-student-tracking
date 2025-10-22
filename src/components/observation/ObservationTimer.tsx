import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square, Zap } from "lucide-react";
import { toast } from "sonner";
import { EpisodeTimer } from "./EpisodeTimer";
import { BehaviorEpisode } from "@/hooks/useObservations";

interface ObservationTimerProps {
  onStatusChange: (status: "on-task" | "off-task" | "transitioning") => void;
  currentStatus: "on-task" | "off-task" | "transitioning" | null;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerEnd: (duration: number, episodes: BehaviorEpisode[]) => void;
  isRunning: boolean;
  isPaused: boolean;
  observer: string;
  student: string;
  hasBehavior: boolean;
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
  hasBehavior,
}: ObservationTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [episodes, setEpisodes] = useState<BehaviorEpisode[]>([]);
  const [episodeStatus, setEpisodeStatus] = useState<"on-task" | "off-task" | "transitioning" | null>(null);
  const [episodeStartTime, setEpisodeStartTime] = useState<Date | null>(null);

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

  // Wake Lock functionality
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        toast.success("Screen wake lock activated");
      }
    } catch (err) {
      console.error('Wake lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        toast.info("Screen wake lock released");
      } catch (err) {
        console.error('Wake lock release error:', err);
      }
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
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
    // Behavior is optional; proceed even if not set
    if (!currentStatus) {
      toast.error("Please select a task status first");
      return;
    }
    setElapsedTime(0);
    setEpisodes([]);
    setEpisodeStatus(null);
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
    if (episodeStatus) {
      toast.error("Please end the current episode first");
      return;
    }
    // Validate and finalize episodes before saving
    // 1) Drop invalid episodes (non-positive duration)
    let finalizedEpisodes: BehaviorEpisode[] = episodes.filter((ep) => ep.duration > 0);

    // 2) Ensure total episode time does not exceed elapsed time
    let episodeTime = finalizedEpisodes.reduce((sum, ep) => sum + ep.duration, 0);
    if (episodeTime > elapsedTime) {
      const overflow = episodeTime - elapsedTime;
      toast.info(`Episode durations exceed total by ${overflow}s. Trimming to fit.`);
      // Trim from the last recorded episodes backwards until we fit into elapsedTime
      const trimmed: BehaviorEpisode[] = [...finalizedEpisodes];
      let remainingOverflow = overflow;
      for (let i = trimmed.length - 1; i >= 0 && remainingOverflow > 0; i--) {
        const reducible = Math.min(trimmed[i].duration, remainingOverflow);
        trimmed[i] = {
          ...trimmed[i],
          duration: trimmed[i].duration - reducible,
          endTime: new Date(
            trimmed[i].startTime.getTime() + (trimmed[i].duration - reducible) * 1000
          ),
        };
        remainingOverflow -= reducible;
      }
      finalizedEpisodes = trimmed.filter((ep) => ep.duration > 0);
      episodeTime = finalizedEpisodes.reduce((sum, ep) => sum + ep.duration, 0);
    }

    // 3) Add primary status episode for any unaccounted time
    const primaryDuration = Math.max(0, elapsedTime - episodeTime);
    if (primaryDuration > 0 && currentStatus) {
      const primaryEpisode: BehaviorEpisode = {
        id: `primary-${Date.now()}`,
        status: currentStatus,
        startTime: new Date(Date.now() - elapsedTime * 1000), // Approximate observation start
        endTime: new Date(),
        duration: primaryDuration,
      };
      finalizedEpisodes = [...finalizedEpisodes, primaryEpisode];
      toast.info(
        `Added primary ${currentStatus.replace("-", " ")} episode of ${primaryDuration}s to complete observation.`
      );
    }

    // 4) Sort episodes by start time for consistency
    finalizedEpisodes.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // 5) Save
    onTimerEnd(elapsedTime, finalizedEpisodes);
    setElapsedTime(0);
    setEpisodes([]);
    toast.success("Observation saved");
  };

  const startEpisode = (status: "on-task" | "off-task" | "transitioning") => {
    if (status === currentStatus) {
      toast.error(`Already recording ${status} behavior`);
      return;
    }
    setEpisodeStatus(status);
    setEpisodeStartTime(new Date());
    toast.info(`Started recording ${status} episode`);
  };

  const endEpisode = (duration: number, status: "on-task" | "off-task" | "transitioning") => {
    const newEpisode: BehaviorEpisode = {
      id: `${Date.now()}-${Math.random()}`,
      status,
      startTime: episodeStartTime || new Date(),
      endTime: new Date(),
      duration,
    };
    setEpisodes((prev) => [...prev, newEpisode]);
    setEpisodeStatus(null);
    setEpisodeStartTime(null);
    toast.success(`${status} episode saved (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`);
  };

  const cancelEpisode = () => {
    setEpisodeStatus(null);
    setEpisodeStartTime(null);
    toast.info("Episode cancelled");
  };

  return (
    <Card className="border">
      <div className="p-4 bg-[hsl(var(--surface-100))] text-foreground border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Observation Timer</CardTitle>
          {wakeLock && (
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Wake Lock Active
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-3xl font-extrabold tabular-nums">{formatTime(elapsedTime)}</div>
          {isPaused && <div className="text-xs font-medium">PAUSED</div>}
        </div>
      </div>
      <CardContent className="space-y-4">
        {/* Episode Timer */}
        {isRunning && episodeStatus && (
          <EpisodeTimer
            status={episodeStatus}
            onEpisodeEnd={endEpisode}
            isActive={!!episodeStatus}
            onCancel={cancelEpisode}
          />
        )}

        {/* Quick Episode Buttons */}
        {isRunning && !isPaused && !episodeStatus && (
          <div className="flex gap-2">
            {currentStatus !== "on-task" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-success text-success hover:bg-success/10"
                onClick={() => startEpisode("on-task")}
              >
                Quick On Task
              </Button>
            )}
            {currentStatus !== "off-task" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => startEpisode("off-task")}
              >
                Quick Off Task
              </Button>
            )}
            {currentStatus !== "transitioning" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-warning text-warning hover:bg-warning/10"
                onClick={() => startEpisode("transitioning")}
              >
                Quick Transition
              </Button>
            )}
          </div>
        )}

        {/* Episodes Summary */}
        {episodes.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Episodes recorded: {episodes.length} ({episodes.filter(e => e.status === "on-task").length} on-task, {episodes.filter(e => e.status === "off-task").length} off-task, {episodes.filter(e => e.status === "transitioning").length} transitioning)
          </div>
        )}
        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Status</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="status-active"
              size="default"
              onClick={() => onStatusChange("on-task")}
              data-active={currentStatus === "on-task"}
              disabled={isRunning || !observer}
            >
              On Task
            </Button>
            <Button
              variant="status-inactive"
              size="default"
              onClick={() => onStatusChange("off-task")}
              data-active={currentStatus === "off-task"}
              disabled={isRunning || !observer}
            >
              Off Task
            </Button>
            <Button
              variant="status-transition"
              size="default"
              onClick={() => onStatusChange("transitioning")}
              data-active={currentStatus === "transitioning"}
              disabled={isRunning || !observer}
            >
              Transitioning
            </Button>
          </div>
        </div>

        {/* Timer Display moved to hero header above */}

        {/* Timer Controls */}
        <div className="space-y-2">
          {!isRunning ? (
            <>
              <Button
                variant="success"
                size="lg"
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
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isPaused ? "success" : "warning"}
                size="lg"
                className="h-12 rounded-md font-semibold"
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
              <Button variant="destructive" size="lg" className="h-12 rounded-md font-semibold" onClick={handleEnd}>
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

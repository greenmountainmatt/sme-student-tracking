import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  hasBehavior: _hasBehavior,
}: ObservationTimerProps) {
  type TimerPhase = "idle" | "running" | "paused" | "stopped";

  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("idle");
  const [lastRecordedDuration, setLastRecordedDuration] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const endingRef = useRef(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [episodes, setEpisodes] = useState<BehaviorEpisode[]>([]);
  const [episodeStatus, setEpisodeStatus] = useState<"on-task" | "off-task" | "transitioning" | null>(null);
  const [episodeStartTime, setEpisodeStartTime] = useState<Date | null>(null);
  const renderCountRef = useRef(0);
  const canStartTimer = useMemo(() => Boolean(observer.trim() && student.trim()), [observer, student]);
  const currentTime = timerPhase === "stopped" && lastRecordedDuration !== null ? lastRecordedDuration : elapsedTime;

  renderCountRef.current += 1;
  const renderCount = renderCountRef.current;

  const timerDebugState = useMemo(
    () => ({
      elapsedTime,
      timerPhase,
      lastRecordedDuration,
      episodes: episodes.map((episode) => ({
        id: episode.id,
        status: episode.status,
        duration: episode.duration,
        startTime: episode.startTime?.toISOString?.() ?? null,
        endTime: episode.endTime?.toISOString?.() ?? null,
      })),
      episodeStatus,
      episodeStartTime: episodeStartTime?.toISOString?.() ?? null,
      wakeLockActive: Boolean(wakeLock),
    }),
    [elapsedTime, timerPhase, lastRecordedDuration, episodes, episodeStatus, episodeStartTime, wakeLock]
  );

  useEffect(() => {
    console.debug(`[ObservationTimer] phase changed to ${timerPhase}`);

    if (timerPhase === "running") {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      console.debug("[ObservationTimer] interval started");
    } else if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.debug(`[ObservationTimer] interval cleared (phase=${timerPhase})`);
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerPhase]);

  useEffect(() => {
    console.debug("[ObservationTimer] sync effect", {
      isRunning,
      isPaused,
      timerPhase,
      endingRef: endingRef.current,
      lastRecordedDuration,
      elapsedTime,
    });

    if (endingRef.current) {
      if (!isRunning) {
        console.debug("[ObservationTimer] external state confirmed stop");
        endingRef.current = false;
      } else {
        console.debug("[ObservationTimer] awaiting parent stop acknowledgement");
        return;
      }
    }

    if (!isRunning) {
      const nextPhase: TimerPhase = lastRecordedDuration !== null ? "stopped" : "idle";
      if (timerPhase !== nextPhase) {
        setTimerPhase(nextPhase);
      }

      if (nextPhase === "idle") {
        if (lastRecordedDuration !== null) {
          console.debug("[ObservationTimer] clearing last recorded duration for idle reset");
          setLastRecordedDuration(null);
        }
        if (elapsedTime !== 0) {
          setElapsedTime(0);
        }
      }

      return;
    }

    const desiredPhase: TimerPhase = isPaused ? "paused" : "running";
    if (timerPhase !== desiredPhase) {
      setTimerPhase(desiredPhase);
    }
  }, [isRunning, isPaused, timerPhase, lastRecordedDuration, elapsedTime]);

  // Wake Lock functionality
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        toast.success("Screen wake lock activated");
        console.debug("[ObservationTimer] wake lock requested");
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
        console.debug("[ObservationTimer] wake lock released");
      } catch (err) {
        console.error('Wake lock release error:', err);
      }
    }
  };

  useEffect(() => {
    if (timerPhase === "running") {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [timerPhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    console.log("[ObservationTimer] Start pressed", {
      observer,
      student,
      currentStatus,
    });
    
    // Validate BEFORE calling onTimerStart (which triggers form clear)
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
    
    // Reset internal state
    endingRef.current = false;
    setLastRecordedDuration(null);
    setElapsedTime(0);
    setTimerPhase("running");
    setEpisodes([]);
    setEpisodeStatus(null);
    setEpisodeStartTime(null);
    
    // NOW call parent to start timer (which triggers form clear)
    onTimerStart();
    toast.success("Timer started");
  };

  const handlePauseResume = () => {
    const nextPhase = isPaused ? "running" : "paused";
    console.log("[ObservationTimer] Pause/Resume pressed", {
      currentPhase: timerPhase,
      nextPhase,
    });
    setTimerPhase(nextPhase);
    onTimerPause();
    toast.info(isPaused ? "Timer resumed" : "Timer paused");
  };

  const handleEnd = () => {
    console.log("[ObservationTimer] End pressed", {
      elapsedTime,
      currentPhase: timerPhase,
      activeEpisodeStatus: episodeStatus,
    });
    if (elapsedTime === 0) {
      toast.error("Cannot end timer with zero duration");
      return;
    }
    if (episodeStatus) {
      toast.error("Please end the current episode first");
      return;
    }
    endingRef.current = true;
    setTimerPhase("stopped");
    setLastRecordedDuration(elapsedTime);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.debug("[ObservationTimer] interval cleared from End handler");
    }
    releaseWakeLock();
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

    // 5) Save and reset timer state
    onTimerEnd(elapsedTime, finalizedEpisodes);
    setEpisodeStatus(null);
    setEpisodeStartTime(null);
    setEpisodes([]);
    setElapsedTime(0);
    setLastRecordedDuration(null);
    toast.success("Observation saved");
  };

  const startEpisode = (status: "on-task" | "off-task" | "transitioning") => {
    console.log("[ObservationTimer] Quick episode start pressed", {
      status,
      timerPhase,
    });
    if (status === currentStatus) {
      toast.error(`Already recording ${status} behavior`);
      return;
    }
    setEpisodeStatus(status);
    setEpisodeStartTime(new Date());
    toast.info(`Started recording ${status} episode`);
  };

  const endEpisode = (duration: number, status: "on-task" | "off-task" | "transitioning") => {
    console.log("[ObservationTimer] Episode completed", {
      status,
      duration,
    });
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
    console.log("[ObservationTimer] Episode cancelled", {
      activeStatus: episodeStatus,
    });
    setEpisodeStatus(null);
    setEpisodeStartTime(null);
    toast.info("Episode cancelled");
  };

  const startDisabled = !canStartTimer;

  console.log("=== TIMER COMPLETE DEBUG ===");
  console.log("Timer state object:", JSON.stringify(timerDebugState, null, 2));
  console.log("Is running:", isRunning);
  console.log("Current time value:", currentTime);
  console.log("Timer status/phase:", timerPhase);
  console.log("Start button props:", {
    disabled: startDisabled,
    onClick: handleStart,
  });
  console.log("Component render count:", renderCount);

  const displayedTime = currentTime;

  const showPausedLabel = timerPhase === "paused";
  const showCompletedLabel = timerPhase === "stopped" && lastRecordedDuration !== null;

  return (
    <Card className="border overflow-hidden">
      <div className="p-4 bg-[hsl(var(--surface-100))] text-foreground border-b">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold">Observation Timer</p>
          {wakeLock && (
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Wake Lock Active
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div className="text-6xl md:text-7xl font-extrabold text-foreground tabular-nums">
            {formatTime(displayedTime)}
          </div>
          {showPausedLabel && (
            <div className="text-sm text-white/90 font-medium">PAUSED</div>
          )}
          {showCompletedLabel && (
            <div className="text-sm text-white font-semibold tracking-wide">COMPLETED</div>
          )}
        </div>
      </div>
      <CardContent className="space-y-4">
        {isRunning && episodeStatus && (
          <EpisodeTimer
            status={episodeStatus}
            onEpisodeEnd={endEpisode}
            isActive={!!episodeStatus}
            onCancel={cancelEpisode}
          />
        )}

        {isRunning && !isPaused && !episodeStatus && (
          <div className="flex gap-2">
            {currentStatus !== "on-task" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-success text-success hover:bg-success/10 min-h-[44px]"
                onClick={() => startEpisode("on-task")}
              >
                Quick On Task
              </Button>
            )}
            {currentStatus !== "off-task" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10 min-h-[44px]"
                onClick={() => startEpisode("off-task")}
              >
                Quick Off Task
              </Button>
            )}
            {currentStatus !== "transitioning" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-warning text-warning hover:bg-warning/10 min-h-[44px]"
                onClick={() => startEpisode("transitioning")}
              >
                Quick Transition
              </Button>
            )}
          </div>
        )}

        {episodes.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Episodes recorded: {episodes.length} ({episodes.filter((e) => e.status === "on-task").length} on-task, {episodes.filter((e) => e.status === "off-task").length} off-task, {episodes.filter((e) => e.status === "transitioning").length} transitioning)
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Task Status</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="status-active"
              onClick={() => onStatusChange("on-task")}
              data-active={currentStatus === "on-task"}
              disabled={isRunning || !observer}
              className="min-h-[48px]"
            >
              On Task
            </Button>
            <Button
              variant="status-inactive"
              onClick={() => onStatusChange("off-task")}
              data-active={currentStatus === "off-task"}
              disabled={isRunning || !observer}
              className="min-h-[48px]"
            >
              Off Task
            </Button>
            <Button
              variant="status-transition"
              onClick={() => onStatusChange("transitioning")}
              data-active={currentStatus === "transitioning"}
              disabled={isRunning || !observer}
              className="min-h-[48px]"
            >
              Transitioning
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {!isRunning ? (
            <>
              <Button
                variant="success"
                size="lg"
                className="w-full min-h-[48px] text-base font-semibold"
                onClick={handleStart}
                disabled={!canStartTimer}
              >
                <Play className="mr-2" />
                Start Timer
              </Button>
              {!canStartTimer && (
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
                className="h-12 min-h-[48px] rounded-md font-semibold"
                onClick={handlePauseResume}
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="h-12 min-h-[48px] rounded-md font-semibold"
                onClick={handleEnd}
              >
                <Square className="mr-2" />
                End
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

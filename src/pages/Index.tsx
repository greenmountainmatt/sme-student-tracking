import { useState, useEffect } from "react";
import { ObserverIdentification } from "@/components/observation/ObserverIdentification";
import { StudentSelection } from "@/components/observation/StudentSelection";
import { ObservationTimer } from "@/components/observation/ObservationTimer";
import { ContextCapture } from "@/components/observation/ContextCapture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, List, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObservations } from "@/hooks/useObservations";
import { toast } from "sonner";


const Index = () => {
  const navigate = useNavigate();
  const { observations, addObservation } = useObservations();
  const [observer, setObserver] = useState("");
  const [student, setStudent] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"on-task" | "off-task" | "transitioning" | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  function getCurrentTimeBlock() {
    const hour = new Date().getHours();
    if (hour < 8.5) return "Warm-up";
    if (hour < 10) return "Core Instruction";
    if (hour < 11) return "Practice";
    if (hour < 12) return "Centers";
    if (hour < 13) return "Specials";
    if (hour < 14) return "Core Instruction";
    if (hour < 15) return "End of Day";
    return "Transition";
  }

  const createDefaultContext = () => ({
    who: [],
    what: "Independent Work",
    when: getCurrentTimeBlock(),
    where: "Classroom",
    why: "Unclear",
    notes: "",
    prompts: [],
    behavior: "",
  });

  const [currentContext, setCurrentContext] = useState(createDefaultContext());
  const [recentStudents, setRecentStudents] = useState<string[]>([]);

  // Save active timer state to localStorage
  useEffect(() => {
    if (isTimerRunning) {
      const timerState = {
        isRunning: true,
        isPaused: isTimerPaused,
        student,
        status: currentStatus,
        observer,
      };
      localStorage.setItem("activeSession_primary", JSON.stringify(timerState));
    } else {
      localStorage.removeItem("activeSession_primary");
    }
  }, [isTimerRunning, isTimerPaused, student, currentStatus, observer]);

  // Load recent students from localStorage
  useEffect(() => {
    const savedRecent = localStorage.getItem("recentStudents");
    if (savedRecent) {
      setRecentStudents(JSON.parse(savedRecent));
    }
  }, []);

  // Reset observation context at START of observation
  const resetObservationContext = () => {
    setCurrentContext(createDefaultContext());
  };

  const handleTimerStart = () => {
    resetObservationContext();
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const handleTimerPause = () => {
    setIsTimerPaused(!isTimerPaused);
  };

  const handleTimerEnd = (duration: number, episodes: any[]) => {
    const trimmedStudent = student.trim();
    if (!trimmedStudent || !currentStatus || !observer.trim()) {
      toast.error("Missing observer, student, or status. Observation not saved.");
      return;
    }

    const contextSnapshot = currentContext ?? createDefaultContext();
    const resolvedBehavior = contextSnapshot.behavior?.trim?.() || "";

    const newObservation = {
      id: Date.now().toString(),
      createdAt: new Date(),
      observer: observer.trim(),
      student: trimmedStudent,
      behavior: resolvedBehavior || "Unspecified",
      status: currentStatus,
      duration,
      episodes,
      context: {
        who: contextSnapshot.who || [],
        what: contextSnapshot.what,
        when: contextSnapshot.when,
        where: contextSnapshot.where,
        why: contextSnapshot.why,
        notes: contextSnapshot.notes || "",
        prompts: contextSnapshot.prompts || [],
        behavior: resolvedBehavior || "Unspecified",
      },
    };

    try {
      addObservation(newObservation);
      toast.success("Observation saved");
    } catch (error) {
      console.error("Failed to persist observation", error);
      toast.error("Failed to save observation. Please try again.");
      return;
    }

    // Update recent students
    const updatedRecent = [
      trimmedStudent,
      ...recentStudents.filter((s) => s !== trimmedStudent),
    ].slice(0, 5);
    setRecentStudents(updatedRecent);
    localStorage.setItem("recentStudents", JSON.stringify(updatedRecent));

    // Reset timer state only (form already cleared at start)
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setCurrentStatus(null);
    resetObservationContext();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      "on-task": "default",
      "off-task": "destructive",
      "transitioning": "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-5">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Behavioral Observation</h1>
              <p className="text-xs text-muted-foreground">Real-time classroom data collection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            {observer && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Observer</p>
                <p className="text-sm font-semibold">{observer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Observer Identification */}
        <ObserverIdentification onObserverChange={setObserver} />

        {/* Student Selection */}
        <StudentSelection
          onStudentChange={setStudent}
          currentStudent={student}
          recentStudents={recentStudents}
          isTimerRunning={isTimerRunning}
        />

        {/* Active Student Header */}
        {student && (
          <Card className="border-accent">
            <CardContent className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Observing:</span>
                  <span className="ml-2 text-sm font-semibold">{student}</span>
                </div>
                {currentStatus && getStatusBadge(currentStatus)}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-6">
            <ObservationTimer
              onStatusChange={setCurrentStatus}
              currentStatus={currentStatus}
              onTimerStart={handleTimerStart}
              onTimerPause={handleTimerPause}
              onTimerEnd={handleTimerEnd}
              isRunning={isTimerRunning}
              isPaused={isTimerPaused}
              observer={observer}
              student={student}
              hasBehavior={!!(currentContext?.behavior && currentContext.behavior.trim())}
            />

            <ContextCapture
              onContextChange={(context) => setCurrentContext({ 
                ...context, 
                prompts: context.prompts || [],
                behavior: context.behavior || ""
              })}
              recentStudents={recentStudents}
              isTimerRunning={isTimerRunning}
              shouldResetForm={!isTimerRunning}
            />
          </div>

          {/* Right Column - Observation History */}
          <div>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle>Recent Observations</CardTitle>
                  <CardDescription>Last 5 recorded observations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/observations")}>
                  <List className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {observations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No observations yet. Start your first observation!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {observations.map((obs) => (
                        <Card key={obs.id} className="border">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Observer: <span className="font-medium">{obs.observer || "Unknown"}</span> | Student: <span className="font-medium">{obs.student}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {obs.createdAt.toLocaleString()}
                                </span>
                              </div>
                              {getStatusBadge(obs.status)}
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">{formatDuration(obs.duration)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">What:</span> {obs.context.what}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Where:</span> {obs.context.where}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">When:</span> {obs.context.when}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Why:</span> {obs.context.why}
                                </div>
                              </div>
                              {obs.context.notes && (
                                <div className="text-xs mt-2 pt-2 border-t">
                                  <span className="text-muted-foreground">Notes:</span> {obs.context.notes}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

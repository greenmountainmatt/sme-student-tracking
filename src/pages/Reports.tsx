import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObservations } from "@/hooks/useObservations";
import { ReportWizard } from "@/components/reports/ReportWizard";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { TimerStatusIndicator } from "@/components/observation/TimerStatusIndicator";
import { calculateObservationStats } from "@/lib/calculateObservationStats";

export type ReportType = 
  | "individual-student"
  | "date-range"
  | "observer-summary"
  | "activity-analysis"
  | "location-analysis"
  | "prompt-effectiveness"
  | "observer-notes";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  students?: string[];
  observers?: string[];
  activities?: string[];
  locations?: string[];
}

const Reports = () => {
  const navigate = useNavigate();
  const { observations } = useObservations();
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{student: string; elapsedTime: number; isPaused: boolean} | null>(null);

  // Check for active timer state
  useEffect(() => {
    const checkActiveTimer = () => {
      const savedTimer = localStorage.getItem("activeSession_primary");
      if (savedTimer) {
        try {
          const session = JSON.parse(savedTimer);
          if (session.isRunning) {
            setActiveTimer({
              student: session.student,
              elapsedTime: session.elapsedTime || 0,
              isPaused: session.isPaused || false,
            });
          }
        } catch (e) {
          console.error("Failed to parse active timer:", e);
        }
      }
    };
    
    checkActiveTimer();
    const interval = setInterval(checkActiveTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = () => {
    // Generate report based on type and filters
    const filtered = filterObservations(observations, reportFilters);
    // Precompute and attach stats for export rows
    const withStats = filtered.map((o) => ({ ...o, __stats: calculateObservationStats(o) }));
    const report = generateReportData(selectedReportType!, withStats, reportFilters);
    setGeneratedReport(report);
    setShowPreview(true);
  };

  const filterObservations = (obs: any[], filters: ReportFilters) => {
    return obs.filter((observation) => {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        const obsDate = new Date(observation.createdAt);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (obsDate < start || obsDate > end) return false;
      }

      // Student filter
      if (filters.students && filters.students.length > 0) {
        if (!filters.students.includes(observation.student)) return false;
      }

      // Observer filter
      if (filters.observers && filters.observers.length > 0) {
        if (!filters.observers.includes(observation.observer)) return false;
      }

      // Activity filter
      if (filters.activities && filters.activities.length > 0) {
        if (!filters.activities.includes(observation.context.what)) return false;
      }

      // Location filter
      if (filters.locations && filters.locations.length > 0) {
        if (!filters.locations.includes(observation.context.where)) return false;
      }

      return true;
    });
  };

  const generateReportData = (type: ReportType, observations: any[], filters: ReportFilters) => {
    const stats = {
      totalObservations: observations.length,
      averageOnTask: observations.length > 0
        ? Math.round(
            observations.reduce((sum, obs) => sum + calculateObservationStats(obs).onTaskPercent, 0) /
              observations.length
          )
        : 0,
      totalDuration: observations.reduce((sum, obs) => sum + obs.duration, 0),
    };

    switch (type) {
      case "individual-student":
        const student = filters.students?.[0] || "All Students";
        const studentObs = observations.filter((o) => o.student === student);
        return {
          type: "Individual Student Summary",
          title: `Student Report: ${student}`,
          statistics: {
            ...stats,
            totalObservations: studentObs.length,
            averageOnTask: studentObs.length > 0
              ? Math.round(
                  studentObs.reduce((sum, obs) => sum + calculateObservationStats(obs).onTaskPercent, 0) /
                    studentObs.length
                )
              : 0,
          },
          observations: studentObs,
          filters,
        };

      case "date-range":
        return {
          type: "Date Range Report",
          title: `Report: ${filters.startDate || "All"} to ${filters.endDate || "Present"}`,
          statistics: stats,
          observations,
          filters,
        };

      case "observer-summary":
        const observerGroups = observations.reduce((acc: any, obs) => {
          if (!acc[obs.observer]) acc[obs.observer] = [];
          acc[obs.observer].push(obs);
          return acc;
        }, {});
        return {
          type: "Observer Summary",
          title: "Observer Performance Summary",
          statistics: stats,
          observerData: Object.entries(observerGroups).map(([observer, obs]: [string, any]) => ({
            observer,
            count: obs.length,
            avgOnTask: Math.round(
              obs.reduce((sum: number, o: any) => sum + calculateObservationStats(o).onTaskPercent, 0) / obs.length
            ),
          })),
          observations,
          filters,
        };

      case "activity-analysis":
        const activityGroups = observations.reduce((acc: any, obs) => {
          const activity = obs.context.what;
          if (!acc[activity]) acc[activity] = [];
          acc[activity].push(obs);
          return acc;
        }, {});
        return {
          type: "Activity Analysis",
          title: "Behavior Patterns by Activity",
          statistics: stats,
          activityData: Object.entries(activityGroups).map(([activity, obs]: [string, any]) => ({
            activity,
            count: obs.length,
            avgOnTask: Math.round(
              obs.reduce((sum: number, o: any) => sum + calculateObservationStats(o).onTaskPercent, 0) / obs.length
            ),
          })),
          observations,
          filters,
        };

      case "location-analysis":
        const locationGroups = observations.reduce((acc: any, obs) => {
          const location = obs.context.where;
          if (!acc[location]) acc[location] = [];
          acc[location].push(obs);
          return acc;
        }, {});
        return {
          type: "Location Analysis",
          title: "Behavior Patterns by Location",
          statistics: stats,
          locationData: Object.entries(locationGroups).map(([location, obs]: [string, any]) => ({
            location,
            count: obs.length,
            avgOnTask: Math.round(
              obs.reduce((sum: number, o: any) => sum + calculateObservationStats(o).onTaskPercent, 0) / obs.length
            ),
          })),
          observations,
          filters,
        };

      case "prompt-effectiveness":
        const promptStats = observations
          .filter((obs) => obs.context.prompts && obs.context.prompts.length > 0)
          .reduce((acc: any, obs) => {
            obs.context.prompts.forEach((prompt: any) => {
              if (!acc[prompt.type]) {
                acc[prompt.type] = { total: 0, effective: 0, partial: 0, ineffective: 0 };
              }
              acc[prompt.type].total++;
              if (prompt.effectiveness === "effective") acc[prompt.type].effective++;
              if (prompt.effectiveness === "partially-effective") acc[prompt.type].partial++;
              if (prompt.effectiveness === "ineffective") acc[prompt.type].ineffective++;
            });
            return acc;
          }, {});
        return {
          type: "Prompt Effectiveness Report",
          title: "Prompting Strategy Analysis",
          statistics: stats,
          promptData: Object.entries(promptStats).map(([type, data]: [string, any]) => ({
            type,
            ...data,
            successRate: Math.round(((data.effective + data.partial * 0.5) / data.total) * 100),
          })),
          observations,
          filters,
        };

      case "observer-notes":
        const notesObservations = observations.filter(
          (o) => o.context.notes && o.context.notes.trim()
        );
        return {
          type: "Observer Notes Report",
          title: "Observer Notes Collection",
          statistics: {
            ...stats,
            totalObservations: notesObservations.length,
          },
          notesData: notesObservations.map((o) => ({
            date: o.createdAt,
            student: o.student,
            observer: o.observer,
            notes: o.context.notes,
            status: o.status,
            duration: o.duration,
            activity: o.context.what,
            location: o.context.where,
          })),
          observations: notesObservations,
          filters,
        };

      default:
        return { type: "Unknown", statistics: stats, observations, filters };
    }
  };

  const handleReset = () => {
    setSelectedReportType(null);
    setReportFilters({});
    setGeneratedReport(null);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Reports & Analytics</h1>
            <p className="text-xs text-muted-foreground">
              Generate comprehensive reports from observation data
            </p>
          </div>
        </div>

        {!showPreview ? (
          <ReportWizard
            observations={observations}
            selectedReportType={selectedReportType}
            reportFilters={reportFilters}
            onReportTypeChange={setSelectedReportType}
            onFiltersChange={setReportFilters}
            onGenerate={handleGenerateReport}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
            <ReportPreview report={generatedReport} />
          </div>
        )}
      </div>

      {/* Active Timer Status Indicator */}
      {activeTimer && (
        <TimerStatusIndicator
          student={activeTimer.student}
          elapsedTime={activeTimer.elapsedTime}
          isPaused={activeTimer.isPaused}
        />
      )}
    </div>
  );
};

export default Reports;

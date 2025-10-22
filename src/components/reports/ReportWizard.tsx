import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportType, ReportFilters } from "@/pages/Reports";
import {
  FileText,
  Calendar,
  User,
  Activity,
  MapPin,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

interface ReportWizardProps {
  observations: any[];
  selectedReportType: ReportType | null;
  reportFilters: ReportFilters;
  onReportTypeChange: (type: ReportType) => void;
  onFiltersChange: (filters: ReportFilters) => void;
  onGenerate: () => void;
}

export const ReportWizard = ({
  observations,
  selectedReportType,
  reportFilters,
  onReportTypeChange,
  onFiltersChange,
  onGenerate,
}: ReportWizardProps) => {
  const reportTypes: { type: ReportType; title: string; description: string; icon: any }[] = [
    {
      type: "individual-student",
      title: "Individual Student Summary",
      description: "All observations for selected student with behavioral trends",
      icon: User,
    },
    {
      type: "date-range",
      title: "Date Range Report",
      description: "All observations within specified time period with statistics",
      icon: Calendar,
    },
    {
      type: "observer-summary",
      title: "Observer Summary",
      description: "Observations by specific observer with performance metrics",
      icon: User,
    },
    {
      type: "activity-analysis",
      title: "Activity Analysis",
      description: "Behavior patterns by activity type",
      icon: Activity,
    },
    {
      type: "location-analysis",
      title: "Location Analysis",
      description: "Behavior patterns by location",
      icon: MapPin,
    },
    {
      type: "prompt-effectiveness",
      title: "Prompt Effectiveness Report",
      description: "Analysis of prompting strategies and their success rates",
      icon: MessageSquare,
    },
  ];

  // Extract unique values for filters
  const uniqueStudents = Array.from(new Set(observations.map((o) => o.student)));
  const uniqueObservers = Array.from(new Set(observations.map((o) => o.observer)));
  const uniqueActivities = Array.from(new Set(observations.map((o) => o.context.what)));
  const uniqueLocations = Array.from(new Set(observations.map((o) => o.context.where)));

  const setDatePreset = (preset: string) => {
    const today = new Date();
    const end = today.toISOString().split("T")[0];
    let start = "";

    switch (preset) {
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split("T")[0];
        break;
      case "30days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        start = thirtyDaysAgo.toISOString().split("T")[0];
        break;
    }

    onFiltersChange({ ...reportFilters, startDate: start, endDate: end });
  };

  const toggleArrayFilter = (key: keyof ReportFilters, value: string) => {
    const current = (reportFilters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...reportFilters, [key]: updated });
  };

  const canGenerate = selectedReportType && observations.length > 0;

  return (
    <div className="space-y-6">
      {/* Step 1: Select Report Type */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Step 1: Select Report Type</CardTitle>
          </div>
          <CardDescription>Choose the type of report you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.type}
                className={`cursor-pointer transition-colors duration-150 ease-linear ${
                  selectedReportType === report.type
                    ? "border-primary bg-secondary"
                    : "hover:border-[hsl(var(--surface-800))]"
                }`}
                onClick={() => onReportTypeChange(report.type)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    {selectedReportType === report.type && (
                      <ChevronRight className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Step 2: Configure Filters */}
      {selectedReportType && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Configure Filters</CardTitle>
            <CardDescription>
              Customize your report by selecting specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Date Range</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setDatePreset("week")}
                >
                  This Week
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setDatePreset("month")}
                >
                  This Month
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setDatePreset("30days")}
                >
                  Last 30 Days
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={reportFilters.startDate || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...reportFilters, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={reportFilters.endDate || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...reportFilters, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Student Filter */}
            {selectedReportType === "individual-student" && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Student</Label>
                <div className="grid md:grid-cols-3 gap-2">
                  {uniqueStudents.map((student) => (
                    <div key={student} className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student}`}
                        checked={reportFilters.students?.includes(student)}
                        onCheckedChange={() => toggleArrayFilter("students", student)}
                      />
                      <Label htmlFor={`student-${student}`} className="cursor-pointer">
                        {student}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observer Filter */}
            {(selectedReportType === "observer-summary" ||
              selectedReportType === "date-range") && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Observers (Optional)</Label>
                <div className="grid md:grid-cols-3 gap-2">
                  {uniqueObservers.map((observer) => (
                    <div key={observer} className="flex items-center space-x-2">
                      <Checkbox
                        id={`observer-${observer}`}
                        checked={reportFilters.observers?.includes(observer)}
                        onCheckedChange={() => toggleArrayFilter("observers", observer)}
                      />
                      <Label htmlFor={`observer-${observer}`} className="cursor-pointer">
                        {observer}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Filter */}
            {selectedReportType === "activity-analysis" && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Activities (Optional)</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {uniqueActivities.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`activity-${activity}`}
                        checked={reportFilters.activities?.includes(activity)}
                        onCheckedChange={() => toggleArrayFilter("activities", activity)}
                      />
                      <Label htmlFor={`activity-${activity}`} className="cursor-pointer">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Filter */}
            {selectedReportType === "location-analysis" && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Locations (Optional)</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {uniqueLocations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={reportFilters.locations?.includes(location)}
                        onCheckedChange={() => toggleArrayFilter("locations", location)}
                      />
                      <Label htmlFor={`location-${location}`} className="cursor-pointer">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generate */}
      {selectedReportType && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generate Report</CardTitle>
            <CardDescription>
              Review your selections and generate your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 border">
                <p className="text-sm">
                  <span className="font-semibold">Report Type:</span>{" "}
                  {reportTypes.find((r) => r.type === selectedReportType)?.title}
                </p>
                {reportFilters.startDate && (
                  <p className="text-sm">
                    <span className="font-semibold">Date Range:</span> {reportFilters.startDate}{" "}
                    to {reportFilters.endDate}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-semibold">Total Observations:</span>{" "}
                  {observations.length}
                </p>
              </div>
              <Button
                onClick={onGenerate}
                disabled={!canGenerate}
                size="lg"
                className="w-full"
              >
                Generate Report
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

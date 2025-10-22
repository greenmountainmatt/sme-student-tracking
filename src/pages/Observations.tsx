import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObservations } from "@/hooks/useObservations";
import { ObservationListItem } from "@/components/observation/ObservationListItem";
import { EditObservationDialog } from "@/components/observation/EditObservationDialog";
import { DeleteConfirmDialog } from "@/components/observation/DeleteConfirmDialog";
import { useState, useMemo, useEffect } from "react";
import { Observation } from "@/hooks/useObservations";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type DateFilter = "today" | "yesterday" | "week" | "month" | "all" | "custom";

const Observations = () => {
  const navigate = useNavigate();
  const { observations, updateObservation, deleteObservation } = useObservations();
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [deletingObservation, setDeletingObservation] = useState<Observation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const saved = localStorage.getItem("observationsDateFilter");
    return (saved as DateFilter) || "all";
  });
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("observationsDateFilter", dateFilter);
  }, [dateFilter]);

  const filteredObservations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return observations.filter((obs) => {
      const obsDate = new Date(obs.createdAt);
      const obsDay = new Date(obsDate.getFullYear(), obsDate.getMonth(), obsDate.getDate());

      switch (dateFilter) {
        case "today":
          return obsDay.getTime() === today.getTime();
        case "yesterday":
          return obsDay.getTime() === yesterday.getTime();
        case "week":
          return obsDate >= weekAgo;
        case "month":
          return obsDate >= monthAgo;
        case "custom":
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return obsDate >= start && obsDate <= end;
        case "all":
        default:
          return true;
      }
    });
  }, [observations, dateFilter, customStartDate, customEndDate]);

  const ITEMS_PER_PAGE = 50;
  const totalPages = Math.ceil(filteredObservations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedObservations = filteredObservations.slice(startIndex, endIndex);

  const confirmDelete = () => {
    if (deletingObservation) {
      deleteObservation(deletingObservation.id);
      setDeletingObservation(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-5">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">All Observations</h1>
            <p className="text-xs text-muted-foreground">
              Viewing {displayedObservations.length} of {filteredObservations.length} observations
            </p>
          </div>
        </div>

        {/* Date Filter Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Filter by Date</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={dateFilter === "today" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("today")}
              >
                Today
              </Badge>
              <Badge
                variant={dateFilter === "yesterday" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("yesterday")}
              >
                Yesterday
              </Badge>
              <Badge
                variant={dateFilter === "week" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("week")}
              >
                This Week
              </Badge>
              <Badge
                variant={dateFilter === "month" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("month")}
              >
                This Month
              </Badge>
              <Badge
                variant={dateFilter === "all" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("all")}
              >
                All Time
              </Badge>
              <Badge
                variant={dateFilter === "custom" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => setDateFilter("custom")}
              >
                Custom Range
              </Badge>
            </div>

            {dateFilter === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Showing {filteredObservations.length} observation{filteredObservations.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Observation History</CardTitle>
                <CardDescription>
                  [Student] | [Date] | [Behavior] | [Duration] | [On/Off Task %] | [Observer]
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-360px)]">
              <div className="divide-y">
                {displayedObservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No observations found for this filter. Start recording to see them here.
                  </p>
                ) : (
                  displayedObservations.map((observation) => (
                    <ObservationListItem
                      key={observation.id}
                      observation={observation}
                      onEdit={() => setEditingObservation(observation)}
                      onDelete={() => setDeletingObservation(observation)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  {startIndex + 1}-{Math.min(endIndex, filteredObservations.length)} of {filteredObservations.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditObservationDialog
        open={!!editingObservation}
        onOpenChange={(open) => !open && setEditingObservation(null)}
        observation={editingObservation}
        onSave={updateObservation}
      />

      <DeleteConfirmDialog
        open={!!deletingObservation}
        onOpenChange={(open) => !open && setDeletingObservation(null)}
        onConfirm={confirmDelete}
        studentInitials={deletingObservation?.student || ""}
        timestamp={deletingObservation?.createdAt || new Date()}
      />
    </div>
  );
};

export default Observations;

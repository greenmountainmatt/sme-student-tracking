import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Observation } from "@/hooks/useObservations";
import { useState, useMemo } from "react";
import { calculateObservationStats } from "@/lib/calculateObservationStats";

interface ObservationListItemProps {
  observation: Observation;
  onEdit: (observation: Observation) => void;
  onDelete: (observation: Observation) => void;
}

export const ObservationListItem = ({
  observation,
  onEdit,
  onDelete,
}: ObservationListItemProps) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-task":
        return <Badge className="bg-success text-success-foreground">On-Task</Badge>;
      case "off-task":
        return <Badge className="bg-destructive text-destructive-foreground">Off-Task</Badge>;
      case "transitioning":
        return <Badge className="bg-warning text-warning-foreground">Transitioning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate episode percentages using shared utility
  const stats = useMemo(() => calculateObservationStats(observation), [observation]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setIsSwipedLeft(true);
    } else {
      setIsSwipedLeft(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex flex-col p-3 border rounded-md bg-card transition-transform duration-150 cursor-pointer ${
          isSwipedLeft ? "-translate-x-20" : ""
        }`}
        onClick={() => !isSwipedLeft && onEdit(observation)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <span className="font-semibold text-base">{observation.student}</span>
            <span className="text-xs text-muted-foreground">
              {format(observation.createdAt, "MM/dd/yyyy HH:mm:ss")}
            </span>
            <span className="font-mono text-sm font-medium">{formatDuration(observation.duration)}</span>
            {getStatusBadge(observation.status)}
            {(
              observation.behavior && observation.behavior.trim() !== ""
                ? observation.behavior
                : "Unspecified"
            ) && (
              <Badge variant="outline" className="">
                {observation.behavior && observation.behavior.trim() !== "" ? observation.behavior : "Unspecified"}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(observation);
              }}
              className="hidden sm:flex"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(observation);
              }}
              className="hidden sm:flex text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Episode Stats - Text Only */}
        <div className="mb-2">
          <div className="flex gap-3 text-xs font-medium">
            <span className="text-success">ON TASK: {stats.onTaskPercent}%</span>
            <span className="text-destructive">OFF TASK: {stats.offTaskPercent}%</span>
            {stats.transitionPercent > 0 && (
              <span className="text-warning">TRANSITION: {stats.transitionPercent}%</span>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Observer: {observation.observer}</span>
          {observation.behavior && <span>• Behavior: {observation.behavior}</span>}
          {observation.lastModified && (
            <span className="italic text-xs">
              • Last edited {format(observation.lastModified, "MM/dd HH:mm")}
            </span>
          )}
          {observation.episodes && observation.episodes.length > 0 && (
            <span className="text-xs">• {observation.episodes.length} episode{observation.episodes.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {isSwipedLeft && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => {
            setIsSwipedLeft(false);
            onDelete(observation);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

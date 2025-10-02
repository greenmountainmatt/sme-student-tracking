import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Observation } from "@/hooks/useObservations";
import { useState } from "react";

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
        return <Badge className="bg-status-on-task">On-Task</Badge>;
      case "off-task":
        return <Badge className="bg-status-off-task">Off-Task</Badge>;
      case "transitioning":
        return <Badge className="bg-status-transitioning">Transitioning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
        className={`flex items-center justify-between p-4 border rounded-lg bg-card transition-transform duration-200 cursor-pointer hover:bg-accent/50 ${
          isSwipedLeft ? "-translate-x-20" : ""
        }`}
        onClick={() => !isSwipedLeft && onEdit(observation)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold">{observation.student}</span>
            <span className="text-sm text-muted-foreground">
              {format(observation.timestamp, "MM/dd HH:mm")}
            </span>
            <span className="font-mono text-sm">{formatDuration(observation.duration)}</span>
            {getStatusBadge(observation.status)}
          </div>
          <div className="text-sm text-muted-foreground">
            Observer: {observation.observer}
            {observation.lastModified && (
              <span className="ml-2 italic">• Edited</span>
            )}
          </div>
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

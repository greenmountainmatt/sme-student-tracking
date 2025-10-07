import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObservations } from "@/hooks/useObservations";
import { ObservationListItem } from "@/components/observation/ObservationListItem";
import { EditObservationDialog } from "@/components/observation/EditObservationDialog";
import { DeleteConfirmDialog } from "@/components/observation/DeleteConfirmDialog";
import { useState } from "react";
import { Observation } from "@/hooks/useObservations";

const Observations = () => {
  const navigate = useNavigate();
  const { observations, updateObservation, deleteObservation } = useObservations();
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null);
  const [deletingObservation, setDeletingObservation] = useState<Observation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 50;
  const totalPages = Math.ceil(observations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedObservations = observations.slice(startIndex, endIndex);

  const confirmDelete = () => {
    if (deletingObservation) {
      deleteObservation(deletingObservation.id);
      setDeletingObservation(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">All Observations</h1>
            <p className="text-muted-foreground">
              Viewing {displayedObservations.length} of {observations.length} total observations
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Observation History</CardTitle>
                <CardDescription>
                  Tap any observation to edit. Swipe left on mobile or click the trash icon to delete.
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
                {displayedObservations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No observations yet. Start recording to see them here.
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
                  {startIndex + 1}-{Math.min(endIndex, observations.length)} of {observations.length}
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
        timestamp={deletingObservation?.timestamp || new Date()}
      />
    </div>
  );
};

export default Observations;

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

  const handleEdit = (observation: Observation) => {
    setEditingObservation(observation);
  };

  const handleDelete = (observation: Observation) => {
    setDeletingObservation(observation);
  };

  const confirmDelete = () => {
    if (deletingObservation) {
      deleteObservation(deletingObservation.id);
      setDeletingObservation(null);
    }
  };

  const last50Observations = observations.slice(0, 50);

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
            <h1 className="text-3xl font-bold">Recent Observations</h1>
            <p className="text-muted-foreground">
              Showing last {last50Observations.length} observations
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Observation History</CardTitle>
            <CardDescription>
              Tap any observation to edit. Swipe left on mobile or click the trash icon to delete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
                {last50Observations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No observations yet. Start recording to see them here.
                  </p>
                ) : (
                  last50Observations.map((observation) => (
                    <ObservationListItem
                      key={observation.id}
                      observation={observation}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
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

import { useState, useEffect } from 'react';

export interface Observation {
  id: string;
  timestamp: Date;
  lastModified?: Date;
  observer: string;
  student: string;
  status: "on-task" | "off-task" | "transitioning";
  duration: number;
  context: {
    who: string;
    what: string;
    when: string;
    where: string;
    why: string;
    notes: string;
  };
}

export const useObservations = () => {
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("observations");
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((obs: any) => ({
        ...obs,
        timestamp: new Date(obs.timestamp),
        lastModified: obs.lastModified ? new Date(obs.lastModified) : undefined,
      }));
      setObservations(withDates);
    }
  }, []);

  const saveToLocalStorage = (obs: Observation[]) => {
    localStorage.setItem("observations", JSON.stringify(obs));
  };

  const addObservation = (observation: Observation) => {
    setObservations((prev) => {
      const updated = [observation, ...prev];
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const updateObservation = (id: string, updates: Partial<Observation>) => {
    setObservations((prev) => {
      const updated = prev.map((obs) =>
        obs.id === id
          ? { ...obs, ...updates, lastModified: new Date() }
          : obs
      );
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const deleteObservation = (id: string) => {
    setObservations((prev) => {
      const updated = prev.filter((obs) => obs.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  };

  return {
    observations,
    addObservation,
    updateObservation,
    deleteObservation,
  };
};

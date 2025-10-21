import { useState, useEffect } from 'react';

export interface BehaviorEpisode {
  id: string;
  status: "on-task" | "off-task" | "transitioning";
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface Prompt {
  type: string;
  timestamp: Date;
  effectiveness?: "effective" | "partially-effective" | "ineffective";
}

export interface Observation {
  id: string;
  createdAt: Date;
  lastModified?: Date;
  observer: string;
  student: string;
  /** High-level behavior observed (single select or free text). */
  behavior?: string;
  status: "on-task" | "off-task" | "transitioning";
  duration: number;
  episodes?: BehaviorEpisode[];
  context: {
    who: string[];
    what: string;
    when: string;
    where: string;
    why: string;
    notes: string;
    prompts?: Prompt[];
    /**
     * Optional duplicate of behavior for backward/forward compatibility with
     * older context-centric implementations. Prefer top-level `behavior`.
     */
    behavior?: string;
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
        // Backfill new behavior field from legacy data if present
        behavior: obs.behavior || obs.context?.behavior || "",
        // Handle legacy timestamp field
        createdAt: new Date(obs.createdAt || obs.timestamp),
        lastModified: obs.lastModified ? new Date(obs.lastModified) : undefined,
        episodes: obs.episodes?.map((ep: any) => ({
          ...ep,
          startTime: new Date(ep.startTime),
          endTime: ep.endTime ? new Date(ep.endTime) : undefined,
        })),
        context: {
          ...obs.context,
          who: Array.isArray(obs.context.who) ? obs.context.who : [obs.context.who],
          prompts: obs.context.prompts?.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp),
          })),
        },
      }));
      setObservations(withDates);
      try {
        // Persist migration to localStorage for backward compatibility
        localStorage.setItem("observations", JSON.stringify(withDates));
      } catch (e) {
        // no-op if storage quota errors etc.
      }
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

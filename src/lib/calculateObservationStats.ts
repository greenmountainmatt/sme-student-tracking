import { Observation } from "@/hooks/useObservations";

export interface ObservationStats {
  onTaskPercent: number;
  offTaskPercent: number;
  transitionPercent: number;
  totalTime: number;
  hasEpisodes: boolean;
}

/**
 * Calculate on-task, off-task, and transition percentages for an observation.
 * 
 * When episodes exist: Uses episode durations for accurate percentages
 * When NO episodes exist: Treats entire observation as single episode matching primary status
 * 
 * @param observation - The observation to calculate stats for
 * @returns ObservationStats with percentages and metadata
 */
export function calculateObservationStats(observation: Observation): ObservationStats {
  // Case 1: Episodes exist - use episode data for accurate calculation
  if (observation.episodes && observation.episodes.length > 0) {
    const totalTime = observation.episodes.reduce((sum, ep) => sum + ep.duration, 0);

    // Validation: episode totals vs observation duration (allow small tolerance)
    const toleranceSeconds = 2;
    if (typeof observation.duration === "number") {
      const delta = Math.abs(totalTime - observation.duration);
      if (delta > toleranceSeconds) {
        console.warn(
          `Episode duration mismatch for observation ${observation.id}: total ${observation.duration}s, episodes ${totalTime}s (Δ=${delta}s)`
        );
      }
    }
    const onTaskTime = observation.episodes
      .filter((ep) => ep.status === "on-task")
      .reduce((sum, ep) => sum + ep.duration, 0);
    const offTaskTime = observation.episodes
      .filter((ep) => ep.status === "off-task")
      .reduce((sum, ep) => sum + ep.duration, 0);
    const transitionTime = observation.episodes
      .filter((ep) => ep.status === "transitioning")
      .reduce((sum, ep) => sum + ep.duration, 0);
    
    return {
      onTaskPercent: totalTime > 0 ? Math.round((onTaskTime / totalTime) * 100) : 0,
      offTaskPercent: totalTime > 0 ? Math.round((offTaskTime / totalTime) * 100) : 0,
      transitionPercent: totalTime > 0 ? Math.round((transitionTime / totalTime) * 100) : 0,
      totalTime,
      hasEpisodes: true,
    };
  }
  
  // Case 2: No episodes - treat entire observation as single episode matching primary status
  const totalTime = observation.duration;
  let onTaskPercent = 0;
  let offTaskPercent = 0;
  let transitionPercent = 0;
  
  switch (observation.status) {
    case "on-task":
      onTaskPercent = 100;
      break;
    case "off-task":
      offTaskPercent = 100;
      break;
    case "transitioning":
      transitionPercent = 100;
      break;
  }
  
  return {
    onTaskPercent,
    offTaskPercent,
    transitionPercent,
    totalTime,
    hasEpisodes: false,
  };
}

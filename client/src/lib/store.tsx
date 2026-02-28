import { createContext, useContext, useState, ReactNode } from "react";

type Goal = "muscle" | "strength" | "endurance" | "weight_loss" | "general";
type Experience = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  age: number | "";
  weight: number | "";
  goal: Goal;
  experience: Experience;
  equipment: string[];
  daysPerWeek: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number; // in seconds
  completedSets?: number;
}

export interface WorkoutPlan {
  day: number;
  title: string;
  exercises: Exercise[];
}

export interface CompletedWorkout {
  id: string;
  date: string;
  planTitle: string;
  totalVolume: number;
  duration: number; // in seconds
}

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  weeklyPlan: WorkoutPlan[];
  setWeeklyPlan: (plan: WorkoutPlan[]) => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (workout: CompletedWorkout) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WorkoutPlan[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        weeklyPlan,
        setWeeklyPlan,
        completedWorkouts,
        addCompletedWorkout: (workout) =>
          setCompletedWorkouts((prev) => [workout, ...prev]),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

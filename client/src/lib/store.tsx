import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  streak: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("aura_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [weeklyPlan, setWeeklyPlan] = useState<WorkoutPlan[]>(() => {
    const saved = localStorage.getItem("aura_plan");
    return saved ? JSON.parse(saved) : [];
  });
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>(() => {
    const saved = localStorage.getItem("aura_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("aura_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("aura_plan", JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem("aura_history", JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  const calculateStreak = () => {
    if (completedWorkouts.length === 0) return 0;
    
    const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 1) currentStreak++;
        else if (currentStreak === 0) currentStreak = 1;
        lastDate = workoutDate;
      } else {
        break;
      }
    }
    return currentStreak;
  };

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
        streak: calculateStreak(),
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

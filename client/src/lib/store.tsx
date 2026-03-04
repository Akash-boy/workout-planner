import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

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
  restTime: number;
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
  duration: number;
}

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  weeklyPlan: WorkoutPlan[];
  setWeeklyPlan: (plan: WorkoutPlan[]) => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (workout: CompletedWorkout) => void;
  streak: number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlanState] = useState<WorkoutPlan[]>([]);
  const [completedWorkouts, setCompletedWorkoutsState] = useState<CompletedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore when user changes
  useEffect(() => {
    if (!user) {
      setProfileState(null);
      setWeeklyPlanState([]);
      setCompletedWorkoutsState([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(db, "users", user.id);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileState(data.profile || null);
        setWeeklyPlanState(data.weeklyPlan || []);
        setCompletedWorkoutsState(data.completedWorkouts || []);
      } else {
        // Initialize empty doc for new user
        setDoc(userDocRef, {
          profile: null,
          weeklyPlan: [],
          completedWorkouts: []
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateFirestore = async (updates: any) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.id);
    await setDoc(userDocRef, updates, { merge: true });
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    updateFirestore({ profile: newProfile });
  };

  const setWeeklyPlan = (newPlan: WorkoutPlan[]) => {
    setWeeklyPlanState(newPlan);
    updateFirestore({ weeklyPlan: newPlan });
  };

  const addCompletedWorkout = (workout: CompletedWorkout) => {
    const newHistory = [workout, ...completedWorkouts];
    setCompletedWorkoutsState(newHistory);
    updateFirestore({ completedWorkouts: newHistory });
  };

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
        addCompletedWorkout,
        streak: calculateStreak(),
        isLoading
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

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
  rating?: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
}

export interface OneRepMaxRecord {
  exerciseName: string;
  value: number;
  weight: number;
  reps: number;
  date: string;
}

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  weeklyPlan: WorkoutPlan[];
  setWeeklyPlan: (plan: WorkoutPlan[]) => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (workout: CompletedWorkout) => void;
  adjustProtocolIntensity: (rating: number) => void;
  personalRecords: Record<string, PersonalRecord>;
  updatePersonalRecord: (record: PersonalRecord) => Promise<boolean>;
  bodyMeasurements: BodyMeasurement[];
  addBodyMeasurement: (measurement: BodyMeasurement) => void;
  oneRepMaxHistory: OneRepMaxRecord[];
  addOneRepMax: (record: OneRepMaxRecord) => void;
  streak: number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlanState] = useState<WorkoutPlan[]>([]);
  const [completedWorkouts, setCompletedWorkoutsState] = useState<CompletedWorkout[]>([]);
  const [personalRecords, setPersonalRecords] = useState<Record<string, PersonalRecord>>({});
  const [bodyMeasurements, setBodyMeasurementsState] = useState<BodyMeasurement[]>([]);
  const [oneRepMaxHistory, setOneRepMaxHistoryState] = useState<OneRepMaxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore when user changes
  useEffect(() => {
    if (!user) {
      setProfileState(null);
      setWeeklyPlanState([]);
      setCompletedWorkoutsState([]);
      setPersonalRecords({});
      setBodyMeasurementsState([]);
      setOneRepMaxHistoryState([]);
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
        setPersonalRecords(data.personalRecords || {});
        setBodyMeasurementsState(data.bodyMeasurements || []);
        setOneRepMaxHistoryState(data.oneRepMaxHistory || []);
      } else {
        // Initialize empty doc for new user
        setDoc(userDocRef, {
          profile: null,
          weeklyPlan: [],
          completedWorkouts: [],
          personalRecords: {},
          bodyMeasurements: [],
          oneRepMaxHistory: []
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

  const addBodyMeasurement = (measurement: BodyMeasurement) => {
    const newMeasurements = [measurement, ...bodyMeasurements];
    setBodyMeasurementsState(newMeasurements);
    updateFirestore({ bodyMeasurements: newMeasurements });
  };

  const addOneRepMax = (record: OneRepMaxRecord) => {
    const newHistory = [record, ...oneRepMaxHistory];
    setOneRepMaxHistoryState(newHistory);
    updateFirestore({ oneRepMaxHistory: newHistory });
  };

  const updatePersonalRecord = async (record: PersonalRecord) => {
    const existing = personalRecords[record.exerciseName];
    // Simple PR logic: higher weight is better, if same weight then higher reps
    const isNewPR = !existing || record.weight > existing.weight || (record.weight === existing.weight && record.reps > existing.reps);
    
    if (isNewPR) {
      const newPRs = { ...personalRecords, [record.exerciseName]: record };
      setPersonalRecords(newPRs);
      await updateFirestore({ personalRecords: newPRs });
      return true;
    }
    return false;
  };

  const adjustProtocolIntensity = (rating: number) => {
    if (weeklyPlan.length === 0) return;

    const multiplier = rating >= 4 ? 1.1 : rating <= 2 ? 0.9 : 1.0;
    if (multiplier === 1.0) return;

    const newPlan = weeklyPlan.map(plan => ({
      ...plan,
      exercises: plan.exercises.map(ex => {
        // Parse reps (e.g., "8-10" or "12")
        const repsMatch = ex.reps.match(/(\d+)/);
        const currentReps = repsMatch ? parseInt(repsMatch[0]) : 10;
        const newRepsVal = Math.max(1, Math.round(currentReps * multiplier));
        
        // If it was a range, try to preserve it roughly, otherwise just update the number
        const newReps = ex.reps.includes('-') 
          ? `${newRepsVal}-${Math.round(newRepsVal * 1.2)}` 
          : `${newRepsVal}`;

        return {
          ...ex,
          reps: newReps,
          sets: multiplier > 1 ? ex.sets + (Math.random() > 0.5 ? 1 : 0) : Math.max(1, ex.sets - (Math.random() > 0.5 ? 1 : 0))
        };
      })
    }));

    setWeeklyPlan(newPlan);
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
        adjustProtocolIntensity,
        personalRecords,
        updatePersonalRecord,
        bodyMeasurements,
        addBodyMeasurement,
        oneRepMaxHistory,
        addOneRepMax,
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

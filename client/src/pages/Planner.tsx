import { useState } from "react";
import { Link } from "wouter";
import { useAppContext, WorkoutPlan } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BrainCircuit,
  Cpu,
  Zap,
  Dumbbell,
  Timer,
  AlertTriangle,
} from "lucide-react";

const EXERCISE_LIBRARY = {
  chest: [
    { name: "Barbell Bench Press", difficulty: "high" },
    { name: "Dumbbell Bench Press", difficulty: "medium" },
    { name: "Incline Barbell Press", difficulty: "high" },
    { name: "Incline Dumbbell Press", difficulty: "medium" },
    { name: "Machine Chest Press", difficulty: "low" },
    { name: "Cable Flyes", difficulty: "medium" },
    { name: "Pushups", difficulty: "low" },
    { name: "Dips", difficulty: "high" },
    { name: "Decline Bench Press", difficulty: "high" },
    { name: "Pec Deck Machine", difficulty: "low" },
    { name: "Close Grip Bench Press", difficulty: "high" },
    { name: "Landmine Press", difficulty: "medium" },
  ],
  back: [
    { name: "Barbell Deadlift", difficulty: "high" },
    { name: "Lat Pulldown", difficulty: "medium" },
    { name: "Bent-Over Rows", difficulty: "high" },
    { name: "Single-Arm Dumbbell Rows", difficulty: "medium" },
    { name: "Cable Rows", difficulty: "medium" },
    { name: "Assisted Pull-ups", difficulty: "medium" },
    { name: "Face Pulls", difficulty: "low" },
    { name: "T-Bar Rows", difficulty: "high" },
    { name: "Rack Pulls", difficulty: "high" },
    { name: "Straight Arm Pulldown", difficulty: "low" },
    { name: "Chest Supported Rows", difficulty: "medium" },
    { name: "Meadows Row", difficulty: "high" },
  ],
  legs: [
    { name: "Barbell Squat", difficulty: "high" },
    { name: "Leg Press", difficulty: "medium" },
    { name: "Bulgarian Split Squat", difficulty: "high" },
    { name: "Leg Extensions", difficulty: "low" },
    { name: "Romanian Deadlift", difficulty: "high" },
    { name: "Leg Curls", difficulty: "medium" },
    { name: "Calf Raises", difficulty: "low" },
    { name: "Hack Squat", difficulty: "high" },
    { name: "Lunges", difficulty: "medium" },
    { name: "Goblet Squat", difficulty: "medium" },
    { name: "Step Ups", difficulty: "medium" },
    { name: "Sumo Deadlift", difficulty: "high" },
  ],
  shoulders: [
    { name: "Overhead Press", difficulty: "high" },
    { name: "Dumbbell Shoulder Press", difficulty: "medium" },
    { name: "Lateral Raises", difficulty: "low" },
    { name: "Reverse Flyes", difficulty: "low" },
    { name: "Plate Loaded Machine Press", difficulty: "medium" },
    { name: "Upright Rows", difficulty: "high" },
    { name: "Machine Shoulder Press", difficulty: "medium" },
    { name: "Arnold Press", difficulty: "medium" },
    { name: "Cable Lateral Raises", difficulty: "low" },
    { name: "Front Raises", difficulty: "low" },
    { name: "Behind The Neck Press", difficulty: "high" },
    { name: "Bent Over Lateral Raises", difficulty: "low" },
  ],
  arms: [
    { name: "Barbell Curl", difficulty: "medium" },
    { name: "Dumbbell Curl", difficulty: "medium" },
    { name: "Cable Curl", difficulty: "low" },
    { name: "Tricep Rope Pushdown", difficulty: "low" },
    { name: "Overhead Tricep Extension", difficulty: "medium" },
    { name: "Tricep Dips", difficulty: "high" },
    { name: "Preacher Curls", difficulty: "medium" },
    { name: "Hammer Curls", difficulty: "medium" },
    { name: "Concentration Curls", difficulty: "low" },
    { name: "Skull Crushers", difficulty: "high" },
    { name: "Close Grip Pushups", difficulty: "low" },
    { name: "Zottman Curls", difficulty: "medium" },
  ],
  core: [
    { name: "Plank", difficulty: "low" },
    { name: "Cable Crunches", difficulty: "medium" },
    { name: "Hanging Leg Raises", difficulty: "high" },
    { name: "Ab Wheel Rollout", difficulty: "high" },
    { name: "Russian Twists", difficulty: "medium" },
    { name: "Dead Bug", difficulty: "medium" },
    { name: "Pallof Press", difficulty: "medium" },
    { name: "Dragon Flag", difficulty: "high" },
  ],
  cardio: [
    { name: "Treadmill Intervals", difficulty: "medium" },
    { name: "Jump Rope", difficulty: "medium" },
    { name: "Box Jumps", difficulty: "high" },
    { name: "Battle Ropes", difficulty: "high" },
    { name: "Rowing Machine", difficulty: "medium" },
    { name: "Stair Climber", difficulty: "medium" },
    { name: "Burpees", difficulty: "high" },
    { name: "Mountain Climbers", difficulty: "medium" },
  ],
};

function getRandomExercises(goal: string, daysCount: number) {
  const bodyParts = Object.keys(EXERCISE_LIBRARY);

  const protocols = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Upper Body",
    "Lower Body",
    "Full Body",
    "Cardio & Core",
    "Strength Focus",
    "Hypertrophy Block",
    "Power & Endurance",
    "Compound Emphasis",
    "Isolation Block",
    "Athletic Performance",
    "Metabolic Conditioning",
    "Functional Strength",
  ];

  const usedProtocols: string[] = [];
  const usedExercises: string[] = [];

  return Array.from({ length: daysCount }).map((_, dayIdx) => {
    const availableProtocols = protocols.filter(
      (p) => !usedProtocols.includes(p),
    );
    const protocol =
      availableProtocols[Math.floor(Math.random() * availableProtocols.length)];
    usedProtocols.push(protocol);

    const shuffledParts = [...bodyParts].sort(() => Math.random() - 0.5);
    const selectedParts = shuffledParts.slice(
      0,
      4 + Math.floor(Math.random() * 3),
    );

    const exercises = selectedParts.map((bodyPart, exIdx) => {
      const exercisePool =
        EXERCISE_LIBRARY[bodyPart as keyof typeof EXERCISE_LIBRARY];

      const availableExercises = exercisePool.filter(
        (e) => !usedExercises.includes(e.name),
      );
      const pool =
        availableExercises.length > 0 ? availableExercises : exercisePool;
      const selectedExercise = pool[Math.floor(Math.random() * pool.length)];
      usedExercises.push(selectedExercise.name);

      let sets: number;
      let reps: string;
      let restTime: number;

      if (goal === "strength") {
        sets = 3 + Math.floor(Math.random() * 3);
        reps = ["3-5", "4-6", "5-8"][Math.floor(Math.random() * 3)];
        restTime = 120 + Math.floor(Math.random() * 60);
      } else if (goal === "muscle") {
        sets = 3 + Math.floor(Math.random() * 2);
        reps = ["6-10", "8-12", "10-15"][Math.floor(Math.random() * 3)];
        restTime = 60 + Math.floor(Math.random() * 60);
      } else if (goal === "endurance") {
        sets = 2 + Math.floor(Math.random() * 3);
        reps = ["12-20", "15-25", "20-30"][Math.floor(Math.random() * 3)];
        restTime = 30 + Math.floor(Math.random() * 30);
      } else {
        sets = 3 + Math.floor(Math.random() * 2);
        reps = ["8-12", "10-15", "12-18"][Math.floor(Math.random() * 3)];
        restTime = 45 + Math.floor(Math.random() * 45);
      }

      return {
        id: `ex-${dayIdx}-${exIdx}-${Date.now()}-${Math.random()}`,
        name: selectedExercise.name,
        sets,
        reps,
        restTime,
      };
    });

    return {
      day: dayIdx + 1,
      title: protocol,
      exercises,
    };
  });
}

export default function Planner() {
  const { profile, weeklyPlan, setWeeklyPlan } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (!profile) return;
      const mockPlan = getRandomExercises(profile.goal, profile.daysPerWeek);
      setWeeklyPlan(mockPlan);
      setIsGenerating(false);
    }, 2500);
  };

  if (!profile) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <AlertTriangle className="text-destructive mb-4" size={48} />
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">
          Profile Missing
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to set your physical parameters before generating a plan.
        </p>
        <Link href="/profile">
          <Button className="font-bold tracking-widest">SETUP PROFILE</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-24 max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <Cpu className="text-primary" /> Matrix
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI-generated training schedule.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePlan}
          disabled={isGenerating}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          {isGenerating ? "COMPUTING..." : "REGENERATE"}
        </Button>
      </div>

      {isGenerating ? (
        <Card className="border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] bg-card/50 backdrop-blur">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
              <BrainCircuit
                className="text-primary animate-pulse relative z-10"
                size={64}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary">
                Synthesizing Data
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                Generating completely unique protocol for {profile.goal}...
              </p>
              <div className="w-full bg-secondary h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-1/2 animate-[progress_1s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : weeklyPlan.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-transparent">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <Zap className="text-muted-foreground mb-4 opacity-50" size={48} />
            <h3 className="text-xl font-bold mb-2">No Active Protocol</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Generate your first AI-powered weekly workout schedule based on
              your profile. Every generation produces a completely unique plan.
            </p>
            <Button
              onClick={generatePlan}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest h-12 px-8 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
            >
              INITIALIZE AI GENERATOR
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="border-primary/50 text-primary bg-primary/5"
            >
              Target: {profile.goal.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge variant="outline" className="border-border">
              {profile.daysPerWeek} Days/Week
            </Badge>
          </div>
          <Accordion
            type="multiple"
            className="w-full space-y-4"
            defaultValue={["day-1"]}
          >
            {weeklyPlan.map((plan) => (
              <AccordionItem
                key={`day-${plan.day}`}
                value={`day-${plan.day}`}
                className="border border-border rounded-xl bg-card overflow-hidden data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/30">
                  <div className="flex items-center text-left gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary text-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Day
                      </span>
                      <span className="text-xl font-black">{plan.day}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.title}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        {plan.exercises.length} Exercises
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-2 border-t border-border/50 bg-black/20">
                  <div className="space-y-3 mt-2">
                    {plan.exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-mono text-sm opacity-60">
                            0{idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{ex.name}</p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Dumbbell size={12} /> {ex.sets} × {ex.reps}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Timer size={12} /> {ex.restTime}s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link href="/workout">
                      <Button className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-bold tracking-widest">
                        START THIS WORKOUT
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}

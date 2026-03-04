import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAppContext, Exercise, WorkoutPlan } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, CheckCircle, ArrowRight, X, AlertTriangle, Volume2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function Workout() {
  const { weeklyPlan, addCompletedWorkout, adjustProtocolIntensity } = useAppContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Load first available plan for demo purposes
  useEffect(() => {
    if (weeklyPlan.length > 0 && !activePlan) {
      setActivePlan(weeklyPlan[0]);
      setExercises(weeklyPlan[0].exercises);
      setStartTime(Date.now());
    }
  }, [weeklyPlan, activePlan]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "Rest Complete",
        description: "Time to get back to work.",
      });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, toast]);

  const handleSetComplete = (exId: string, maxSets: number, restTime: number) => {
    const currentCompleted = completedSets[exId] || 0;
    if (currentCompleted < maxSets) {
      setCompletedSets(prev => ({ ...prev, [exId]: currentCompleted + 1 }));
      
      // Start rest timer (clamped to 60 as per request for consistency, or use plan rest time)
      setTimeLeft(60); 
      setTimerActive(true);
    }
  };

  const handleFinishWorkout = () => {
    setShowRatingDialog(true);
  };

  const submitWorkoutAndRating = () => {
    if (!activePlan || !startTime) return;
    
    const durationSecs = Math.floor((Date.now() - startTime) / 1000);
    const totalSets = Object.values(completedSets).reduce((a, b) => a + b, 0);
    
    // Add to history
    addCompletedWorkout({
      id: `wo-${Date.now()}`,
      date: new Date().toISOString(),
      planTitle: activePlan.title,
      totalVolume: totalSets,
      duration: durationSecs,
      rating: rating
    });

    // Adjust AI Protocol
    adjustProtocolIntensity(rating);

    toast({
      title: "Workout Logged",
      description: rating >= 4 ? "Adaptive logic: Next week's intensity increased!" : 
                   rating <= 2 ? "Adaptive logic: Next week's intensity reduced." :
                   "Protocol complete.",
    });
    
    setLocation("/progress");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="text-muted-foreground mb-4 opacity-50" size={48} />
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">No Active Protocol</h2>
        <p className="text-muted-foreground mb-6">Generate a training plan in the Planner first.</p>
        <Button onClick={() => setLocation("/planner")} className="font-bold tracking-widest">
          GO TO PLANNER
        </Button>
      </div>
    );
  }

  const currentEx = exercises[currentExerciseIdx];
  const currentExCompletedSets = completedSets[currentEx?.id] || 0;
  const isExFinished = currentExCompletedSets >= currentEx?.sets;
  
  const totalSetsWorkout = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalSetsCompleted = Object.values(completedSets).reduce((acc, val) => acc + val, 0);
  const progressPercent = (totalSetsCompleted / totalSetsWorkout) * 100;

  return (
    <div className="min-h-screen p-6 pb-24 max-xl mx-auto flex flex-col h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-primary">
            {activePlan.title}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Exercise {currentExerciseIdx + 1} of {exercises.length}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="text-muted-foreground">
          <X size={24} />
        </Button>
      </div>

      <Progress value={progressPercent} className="h-2 mb-8 bg-secondary" />

      {/* Rest Timer Overlay */}
      {timerActive && (
        <Card className="border-primary bg-primary/10 shadow-[0_0_30px_-10px_hsl(var(--primary))] mb-6 animate-in fade-in zoom-in duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Timer className="text-primary animate-pulse" size={32} />
                <Volume2 className="absolute -top-1 -right-1 text-primary/50" size={12} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Rest Period</p>
                <p className="text-3xl font-black font-mono">{formatTime(timeLeft)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => setTimerActive(false)} className="border-primary/50 text-primary hover:bg-primary/20">
                <Pause size={18} />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setTimeLeft(prev => prev + 10)} className="border-primary/50 text-primary hover:bg-primary/20 font-bold">
                +10
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <div className="flex-1 overflow-y-auto">
        {currentEx && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300" key={currentEx.id}>
            <div className="bg-secondary/30 rounded-2xl p-8 border border-border text-center">
              <h2 className="text-4xl font-black mb-4">{currentEx.name}</h2>
              <div className="flex justify-center gap-8 text-muted-foreground font-mono">
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1">Target</p>
                  <p className="text-2xl font-bold text-foreground">{currentEx.reps}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest mb-1">Rest</p>
                  <p className="text-2xl font-bold text-foreground">60s</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sets</h3>
              {Array.from({ length: currentEx.sets }).map((_, i) => {
                const isCompleted = i < currentExCompletedSets;
                const isNext = i === currentExCompletedSets;
                
                return (
                  <Card 
                    key={i} 
                    className={`transition-all duration-300 border ${
                      isCompleted ? 'bg-primary/10 border-primary/50' : 
                      isNext ? 'bg-card border-primary ring-1 ring-primary shadow-[0_0_15px_-5px_hsl(var(--primary))]' : 
                      'bg-card border-border opacity-60'
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle size={16} /> : i + 1}
                        </div>
                        <span className={`font-mono text-lg ${isCompleted ? 'text-primary' : 'text-foreground'}`}>
                          {currentEx.reps} Reps
                        </span>
                      </div>
                      <Button 
                        disabled={isCompleted || (!isNext && !isCompleted) || timerActive}
                        onClick={() => handleSetComplete(currentEx.id, currentEx.sets, currentEx.restTime)}
                        variant={isCompleted ? "ghost" : "default"}
                        className={isNext && !timerActive ? "bg-primary text-primary-foreground hover:bg-primary/90 font-bold" : ""}
                      >
                        {isCompleted ? "DONE" : "LOG SET"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-border mt-auto flex gap-4">
        {currentExerciseIdx > 0 && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setCurrentExerciseIdx(prev => prev - 1)}
          >
            PREVIOUS
          </Button>
        )}
        
        {currentExerciseIdx < exercises.length - 1 ? (
          <Button 
            className={`flex-[2] font-bold tracking-widest ${isExFinished ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-secondary text-muted-foreground'}`}
            onClick={() => setCurrentExerciseIdx(prev => prev + 1)}
            disabled={!isExFinished && currentExerciseIdx === 0 && currentExCompletedSets === 0}
          >
            NEXT EXERCISE <ArrowRight className="ml-2" size={18} />
          </Button>
        ) : (
          <Button 
            className={`flex-[2] font-bold tracking-widest ${totalSetsCompleted === totalSetsWorkout ? 'bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]' : 'bg-destructive/80'}`}
            onClick={handleFinishWorkout}
          >
            FINISH PROTOCOL <CheckCircle className="ml-2" size={18} />
          </Button>
        )}
      </div>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Protocol Complete</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-2">
              Rate the intensity of this session. AI will adjust next week's protocol based on your feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  rating >= s ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_-5px_hsl(var(--primary))]" : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <div className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            {rating === 0 ? "Select intensity" : 
             rating <= 2 ? "Hard (Intensity Reduced next week)" :
             rating === 3 ? "Perfect (Intensity Maintained)" :
             "Easy (Intensity Increased next week)"}
          </div>
          <DialogFooter>
            <Button 
              className="w-full font-bold tracking-widest h-12 bg-primary hover:bg-primary/90 text-primary-foreground" 
              disabled={rating === 0}
              onClick={submitWorkoutAndRating}
            >
              LOG PROTOCOL & ADJUST MATRIX
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

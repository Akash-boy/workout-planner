import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAppContext, Exercise, WorkoutPlan } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Timer, Play, Pause, CheckCircle, ArrowRight, X, AlertTriangle, Volume2, Star, Trophy, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { WorkoutSummaryCard } from "@/components/WorkoutSummaryCard";
import { motion, AnimatePresence } from "framer-motion";
import { Input as ShdnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MOTIVATIONAL_QUOTES = [
  "Pain is just data leaving the system.",
  "Your potential is a limit you haven't reached yet.",
  "The iron never lies. The matrix never forgets.",
  "Optimization is a lifelong process. Stay consistent.",
  "Hardware updated. Software synchronized. Performance peaking.",
  "Defy the default. Forge your own legacy."
];

export default function Workout() {
  const { weeklyPlan, addCompletedWorkout, adjustProtocolIntensity, updatePersonalRecord, personalRecords, addOneRepMax } = useAppContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  
  // Track weights for each exercise
  const [exerciseWeights, setExerciseWeights] = useState<Record<string, number>>({});

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [showPRAnimation, setShowPRAnimation] = useState(false);
  const [show1RMCalc, setShow1RMCalc] = useState(false);
  const [rating, setRating] = useState(0);
  const [randomQuote, setRandomQuote] = useState("");

  const [calcWeight, setCalcWeight] = useState<string>("");
  const [calcReps, setCalcReps] = useState<string>("");

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

  useEffect(() => {
    if (weeklyPlan.length > 0 && !activePlan) {
      setActivePlan(weeklyPlan[0]);
      setExercises(weeklyPlan[0].exercises);
      setStartTime(Date.now());
    }
  }, [weeklyPlan, activePlan]);

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

  const handleSetComplete = async (exId: string, maxSets: number, restTime: number) => {
    const currentCompleted = completedSets[exId] || 0;
    const currentEx = exercises.find(e => e.id === exId);
    
    if (currentCompleted < maxSets && currentEx) {
      setCompletedSets(prev => ({ ...prev, [exId]: currentCompleted + 1 }));
      
      // Check for PR
      const weight = exerciseWeights[exId] || 0;
      // Extract numeric reps from string like "8-10" -> 10
      const repsMatch = currentEx.reps.match(/(\d+)/g);
      const reps = repsMatch ? parseInt(repsMatch[repsMatch.length - 1]) : 10;

      if (weight > 0) {
        const isNewPR = await updatePersonalRecord({
          exerciseName: currentEx.name,
          weight,
          reps,
          date: new Date().toISOString()
        });

        if (isNewPR) {
          setShowPRAnimation(true);
          setTimeout(() => setShowPRAnimation(false), 3000);
          toast({
            title: "NEW PERSONAL BEST!",
            description: `${currentEx.name}: ${weight}LB for ${reps} reps`,
            className: "bg-primary text-primary-foreground border-none"
          });
        }
      }

      setTimeLeft(60); 
      setTimerActive(true);
    }
  };

  const calculate1RM = () => {
    const w = parseFloat(calcWeight);
    const r = parseInt(calcReps);
    if (w > 0 && r > 0 && currentEx) {
      const oneRM = Math.round(w * (1 + r / 30));
      addOneRepMax({
        exerciseName: currentEx.name,
        value: oneRM,
        weight: w,
        reps: r,
        date: new Date().toISOString()
      });
      toast({
        title: "1RM Synced",
        description: `Estimated 1RM for ${currentEx.name}: ${oneRM}LB`,
      });
      setShow1RMCalc(false);
      setCalcWeight("");
      setCalcReps("");
    }
  };

  const handleFinishWorkout = () => {
    setShowRatingDialog(true);
  };

  const submitWorkoutAndRating = () => {
    if (!activePlan || !startTime) return;
    
    const durationSecs = Math.floor((Date.now() - startTime) / 1000);
    const totalSets = Object.values(completedSets).reduce((a, b) => a + b, 0);
    
    addCompletedWorkout({
      id: `wo-${Date.now()}`,
      date: new Date().toISOString(),
      planTitle: activePlan.title,
      totalVolume: totalSets,
      duration: durationSecs,
      rating: rating
    });

    adjustProtocolIntensity(rating);
    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    setShowRatingDialog(false);
    setShowSummaryCard(true);

    toast({
      title: "Workout Logged",
      description: rating >= 4 ? "Adaptive logic: Intensity increased!" : 
                   rating <= 2 ? "Adaptive logic: Intensity reduced." :
                   "Protocol complete.",
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!activePlan) {
    return (
      <div className="h-full p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="text-muted-foreground mb-4 opacity-50" size={48} />
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">No Active Protocol</h2>
        <p className="text-muted-foreground mb-6">Initialize a training plan in the Matrix first.</p>
        <Button onClick={() => setLocation("/planner")} className="w-full h-14 font-black tracking-widest text-lg">
          GO TO MATRIX
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
    <div className="h-full p-4 flex flex-col overflow-hidden max-w-xl mx-auto relative">
      <AnimatePresence>
        {showPRAnimation && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
          >
            <Trophy className="text-primary w-32 h-32 drop-shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
            <h2 className="text-4xl font-black text-primary uppercase tracking-tighter mt-4 drop-shadow-lg">NEW RECORD</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center shrink-0 mb-4">
        <div className="max-w-[80%]">
          <h1 className="text-xl font-black uppercase tracking-tight text-primary truncate">
            {activePlan.title}
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            Protocol Unit 0{currentExerciseIdx + 1} / 0{exercises.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShow1RMCalc(true)} className="w-10 h-10 text-primary">
            <Calculator size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="shrink-0 w-10 h-10">
            <X size={20} />
          </Button>
        </div>
      </div>

      <Progress value={progressPercent} className="h-1 shrink-0 mb-6 bg-secondary" />

      {/* Rest Timer Overlay */}
      {timerActive && (
        <Card className="shrink-0 border-primary bg-primary/10 shadow-[0_0_30px_-10px_hsl(var(--primary))] mb-6 animate-in fade-in zoom-in duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Timer className="text-primary animate-pulse" size={28} />
                <Volume2 className="absolute -top-1 -right-1 text-primary/50" size={10} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-primary leading-none mb-1">Resting</p>
                <p className="text-2xl font-black font-mono leading-none">{formatTime(timeLeft)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => setTimerActive(false)} className="w-10 h-10 border-primary/50 text-primary">
                <Pause size={16} />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setTimeLeft(prev => prev + 10)} className="w-10 h-10 border-primary/50 text-primary text-xs font-black">
                +10
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
        {currentEx && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300" key={currentEx.id}>
            <div className="bg-secondary/20 rounded-2xl p-6 border border-border text-center">
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tight leading-tight">{currentEx.name}</h2>
              
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Log Weight (LB)</span>
                  <ShdnInput 
                    type="number"
                    value={exerciseWeights[currentEx.id] || ""}
                    onChange={(e) => setExerciseWeights({ ...exerciseWeights, [currentEx.id]: parseInt(e.target.value) || 0 })}
                    className="w-24 bg-background border-border text-center font-black text-xl h-10 rounded-xl focus:border-primary transition-all"
                    placeholder="0"
                  />
                </div>
                {personalRecords[currentEx.name] && (
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    <Trophy size={12} /> Best: {personalRecords[currentEx.name].weight}LB x {personalRecords[currentEx.name].reps}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-6 text-muted-foreground font-bold tracking-tighter pt-4 border-t border-border/50">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest text-primary mb-1">Target</span>
                  <span className="text-xl font-black text-foreground">{currentEx.reps} Reps</span>
                </div>
                <div className="w-[1px] h-10 bg-border mx-2" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest text-primary mb-1">Rest</span>
                  <span className="text-xl font-black text-foreground">60s</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Sets List</h3>
              {Array.from({ length: currentEx.sets }).map((_, i) => {
                const isCompleted = i < currentExCompletedSets;
                const isNext = i === currentExCompletedSets;
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                      isCompleted ? 'bg-primary/5 border-primary/20 opacity-80' : 
                      isNext && !timerActive ? 'bg-card border-primary ring-1 ring-primary shadow-[0_0_15px_-5px_hsl(var(--primary)/0.4)]' : 
                      'bg-card border-border'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      )}>
                        {isCompleted ? <CheckCircle size={14} /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-lg font-black font-mono tracking-tighter",
                        isCompleted ? 'text-primary' : 'text-foreground'
                      )}>
                        {currentEx.reps} REPS
                      </span>
                    </div>
                    <Button 
                      disabled={isCompleted || (!isNext && !isCompleted) || timerActive}
                      onClick={() => handleSetComplete(currentEx.id, currentEx.sets, currentEx.restTime)}
                      variant={isCompleted ? "ghost" : "default"}
                      size="sm"
                      className={cn(
                        "h-10 px-5 font-black tracking-widest",
                        isNext && !timerActive ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                      )}
                    >
                      {isCompleted ? "DONE" : "LOG"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="shrink-0 pt-4 flex gap-3 border-t border-border">
        {currentExerciseIdx > 0 && (
          <Button 
            variant="outline" 
            className="flex-1 h-14 font-black tracking-widest rounded-2xl border-2"
            onClick={() => setCurrentExerciseIdx(prev => prev - 1)}
          >
            BACK
          </Button>
        )}
        
        {currentExerciseIdx < exercises.length - 1 ? (
          <Button 
            className={cn(
              "flex-[2] h-14 font-black tracking-widest rounded-2xl text-lg",
              isExFinished ? 'bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]' : 'bg-secondary text-muted-foreground'
            )}
            onClick={() => setCurrentExerciseIdx(prev => prev + 1)}
          >
            NEXT UNIT <ArrowRight className="ml-2" size={20} />
          </Button>
        ) : (
          <Button 
            className={cn(
              "flex-[2] h-14 font-black tracking-widest rounded-2xl text-lg",
              totalSetsCompleted === totalSetsWorkout ? 'bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]' : 'bg-destructive/80'
            )}
            onClick={handleFinishWorkout}
          >
            TERMINATE <CheckCircle className="ml-2" size={20} />
          </Button>
        )}
      </div>

      <Dialog open={show1RMCalc} onOpenChange={setShow1RMCalc}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">1RM Estimator</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Epley Formula: Weight × (1 + Reps/30)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weight Used</Label>
              <ShdnInput type="number" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} className="bg-background text-xl font-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reps Performed</Label>
              <ShdnInput type="number" value={calcReps} onChange={e => setCalcReps(e.target.value)} className="bg-background text-xl font-black" />
            </div>
            {parseFloat(calcWeight) > 0 && parseInt(calcReps) > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Estimated 1RM</p>
                <p className="text-4xl font-black text-primary">{Math.round(parseFloat(calcWeight) * (1 + parseInt(calcReps) / 30))} LB</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full h-14 font-black tracking-widest bg-primary text-primary-foreground rounded-2xl" onClick={calculate1RM} disabled={!calcWeight || !calcReps}>
              SYNC 1RM TO PROFILE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Protocol Log</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground pt-2 font-bold text-xs uppercase tracking-widest">
              Rate Neural Stress Level
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 py-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90",
                  rating >= s ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_-5px_hsl(var(--primary))]" : "border-border bg-secondary"
                )}
              >
                <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 font-black tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg" 
              disabled={rating === 0}
              onClick={submitWorkoutAndRating}
            >
              FINALIZE PROTOCOL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSummaryCard && activePlan && startTime && (
        <WorkoutSummaryCard 
          workoutName={activePlan.title}
          totalSets={Object.values(completedSets).reduce((a, b) => a + b, 0)}
          duration={formatTime(Math.floor((Date.now() - startTime) / 1000))}
          exercises={exercises.map(e => e.name)}
          quote={randomQuote}
          onClose={() => {
            setShowSummaryCard(false);
            setLocation("/progress");
          }}
        />
      )}
    </div>
  );
}

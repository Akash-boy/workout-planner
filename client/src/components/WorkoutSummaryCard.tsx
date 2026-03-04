import { motion } from "framer-motion";
import { Trophy, Clock, Activity, Zap, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroBg from "@/assets/images/hero-bg.png";

interface SummaryCardProps {
  workoutName: string;
  totalSets: number;
  duration: string;
  exercises: string[];
  quote: string;
  onClose: () => void;
}

export function WorkoutSummaryCard({
  workoutName,
  totalSets,
  duration,
  exercises,
  quote,
  onClose
}: SummaryCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aura Fitness Protocol Complete',
          text: `I just finished ${workoutName}! ${totalSets} sets in ${duration}. #AuraFitness`,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-[380px] aspect-[9/16] bg-card rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_hsl(var(--primary)/0.5)] border border-primary/20 flex flex-col"
      >
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold tracking-widest uppercase">
              <Zap size={12} /> Protocol Complete
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
              <Download size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
              {workoutName} <span className="text-primary block">TERMINATED.</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <Trophy className="text-primary mb-2" size={20} />
                <p className="text-2xl font-black leading-none">{totalSets}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total Sets</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <Clock className="text-primary mb-2" size={20} />
                <p className="text-2xl font-black leading-none">{duration}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Time</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Payload Details</p>
              {exercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  <span className="truncate">{ex}</span>
                </div>
              ))}
              {exercises.length > 4 && (
                <p className="text-[10px] text-muted-foreground font-bold">+ {exercises.length - 4} MORE EXERCISES</p>
              )}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="relative">
              <Activity className="absolute -top-4 -right-2 text-primary/20" size={40} />
              <p className="text-lg font-display italic font-semibold text-foreground leading-tight pr-8">
                "{quote}"
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-4">
                AURA_AI // GENERATED_MOTIVATION
              </p>
            </div>

            <Button 
              onClick={handleShare}
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest py-6 rounded-2xl"
            >
              SHARE PROTOCOL <Share2 className="ml-2" size={18} />
            </Button>
          </div>
        </div>

        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-20" />
      </motion.div>
    </div>
  );
}

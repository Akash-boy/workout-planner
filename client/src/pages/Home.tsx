import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/lib/store";
import { Activity, ArrowRight, Zap, Trophy, Timer } from "lucide-react";
import heroBg from "@/assets/images/hero-bg.png";

export default function Home() {
  const { profile, weeklyPlan, completedWorkouts } = useAppContext();

  const hasProfile = profile !== null;
  const hasPlan = weeklyPlan.length > 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div 
        className="relative h-64 md:h-80 w-full bg-cover bg-center flex items-end p-6 border-b border-border"
        style={{ 
          backgroundImage: `linear-gradient(to top, hsl(var(--background)), transparent), url(${heroBg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mb-4 text-sm font-medium">
            <Zap size={16} /> AURA FITNESS OS
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tight">
            Forge Your <span className="text-primary">Legacy</span>
          </h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-8 mt-4">
        {/* State: No Profile */}
        {!hasProfile && (
          <Card className="border-primary/50 bg-primary/5 shadow-[0_0_30px_-10px_hsl(var(--primary))] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-2">
                <Activity size={32} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Initialize Protocol</h2>
              <p className="text-muted-foreground max-w-md">
                Enter your stats and goals to generate a hyper-personalized, AI-driven training protocol.
              </p>
              <Link href="/profile">
                <Button size="lg" className="w-full sm:w-auto mt-4 font-bold tracking-wider">
                  SETUP PROFILE <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* State: Profile but no Plan */}
        {hasProfile && !hasPlan && (
          <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Profile Active</h2>
              <p className="text-muted-foreground">
                Your parameters are set. It's time to generate your weekly training protocol.
              </p>
              <Link href="/planner">
                <Button size="lg" className="w-full sm:w-auto mt-4 font-bold tracking-wider">
                  GENERATE PLAN <Zap className="ml-2" size={18} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* State: Has Plan */}
        {hasPlan && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <Timer className="text-primary" /> Today's Protocol
              </h2>
            </div>
            
            <Card className="border-primary/30 hover:border-primary/60 transition-colors bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm text-primary font-bold tracking-widest mb-1">DAY 1</p>
                    <h3 className="text-xl font-bold">{weeklyPlan[0]?.title || "Rest Day"}</h3>
                  </div>
                  <div className="bg-secondary px-3 py-1 rounded text-sm font-medium">
                    {weeklyPlan[0]?.exercises?.length || 0} Exercises
                  </div>
                </div>
                
                <Link href="/workout">
                  <Button className="w-full font-bold tracking-widest h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                    INITIATE WORKOUT <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <Trophy className="text-primary mb-2" size={28} />
                  <p className="text-3xl font-black">{completedWorkouts.length}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Workouts Done</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <Activity className="text-primary mb-2" size={28} />
                  <p className="text-3xl font-black">{profile?.daysPerWeek || 0}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Days / Week</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

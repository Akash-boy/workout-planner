import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, Dumbbell, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Records() {
  const { personalRecords } = useAppContext();
  const recordsArray = Object.values(personalRecords);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Trophy className="text-primary" /> Hall of Fame
        </h1>
        <p className="text-muted-foreground mt-2">Your all-time personal bests across the matrix.</p>
      </div>

      {recordsArray.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-transparent mt-12">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
              <Star className="text-muted-foreground opacity-50" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">No Records Yet</h3>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Complete workouts and log your weights to start tracking your evolution.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordsArray.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName)).map((record, idx) => (
            <motion.div
              key={record.exerciseName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Dumbbell size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg uppercase tracking-tight">{record.exerciseName}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(record.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary">{record.weight}<span className="text-xs ml-1">LB</span></div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                      {record.reps} Reps
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

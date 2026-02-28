import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, Clock, Database, TrendingUp } from "lucide-react";

export default function Progress() {
  const { completedWorkouts } = useAppContext();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  return (
    <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <TrendingUp className="text-primary" /> Telemetry
        </h1>
        <p className="text-muted-foreground mt-2">Track your completed training protocols.</p>
      </div>

      {completedWorkouts.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-transparent">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <Database className="text-muted-foreground mb-4 opacity-50" size={48} />
            <h3 className="text-xl font-bold mb-2">No Data Available</h3>
            <p className="text-muted-foreground max-w-sm">Complete a workout protocol to begin generating telemetry data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">Total Protocols</span>
                <span className="text-3xl font-black text-primary">{completedWorkouts.length}</span>
              </CardContent>
            </Card>
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">Total Sets</span>
                <span className="text-3xl font-black text-foreground">
                  {completedWorkouts.reduce((acc, w) => acc + w.totalVolume, 0)}
                </span>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground mt-8 mb-4">Log History</h3>
          
          <div className="space-y-3">
            {completedWorkouts.map((workout) => (
              <Card key={workout.id} className="border-border bg-card hover:border-primary/30 transition-colors group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold">{workout.planTitle}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={12} /> {formatDate(workout.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold">{workout.totalVolume} Sets</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 font-mono mt-1">
                      <Clock size={12} /> {formatDuration(workout.duration)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

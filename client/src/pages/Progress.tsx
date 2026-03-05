import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, Clock, Database, TrendingUp, Inbox } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Spinner } from "@/components/ui/spinner";

export default function Progress() {
  const { completedWorkouts, isLoading } = useAppContext();

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

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toDateString(),
        count: 0
      };
    });

    completedWorkouts.forEach(w => {
      const workoutDate = new Date(w.date).toDateString();
      const dayData = last7Days.find(d => d.fullDate === workoutDate);
      if (dayData) dayData.count++;
    });

    return last7Days;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-12 h-12 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <TrendingUp className="text-primary" /> Telemetry
        </h1>
        <p className="text-muted-foreground mt-2">Track your completed training protocols.</p>
      </div>

      {completedWorkouts.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-transparent mt-12">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
              <Inbox className="text-muted-foreground opacity-50" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">No Data Logged</h3>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Your training history is currently empty. Complete your first protocol to begin generating telemetry data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Chart Section */}
          <Card className="bg-secondary/10 border-border">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Activity Last 7 Days</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.count > 0 ? 'hsl(var(--primary))' : '#333'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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

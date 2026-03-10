import { useAppContext } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Clock, TrendingUp, Inbox, Flame, Trophy, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

export default function Progress() {
  const { completedWorkouts, isLoading, streak, oneRepMaxHistory } = useAppContext();

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

  const oneRMChartData = [...oneRepMaxHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: r.value,
      exercise: r.exerciseName
    }));

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
        <p className="text-muted-foreground mt-2">Neural sync history and performance evolution.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-primary/10 border-primary/20 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.2)]">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Flame className="text-primary mb-2" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Current Streak</p>
            <p className="text-4xl font-black">{streak} <span className="text-xs text-muted-foreground uppercase font-bold">Days</span></p>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary/20 border-border">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Trophy className="text-muted-foreground mb-2" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Workouts</p>
            <p className="text-4xl font-black">{completedWorkouts.length}</p>
          </CardContent>
        </Card>
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
          <Card className="bg-secondary/10 border-border overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Activity Last 7 Days
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={10} 
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

          {oneRMChartData.length > 0 && (
            <Card className="bg-secondary/10 border-border overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                  <Target size={16} className="text-primary" /> 1RM Evolution
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={oneRMChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-8 px-1">Recent Activity Log</h3>
          
          <div className="space-y-3">
            {completedWorkouts.map((workout, idx) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-border bg-card hover:border-primary/30 transition-colors group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-primary transition-colors">{workout.planTitle}</h4>
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
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

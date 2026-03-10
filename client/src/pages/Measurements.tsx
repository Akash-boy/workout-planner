import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Plus, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function Measurements() {
  const { bodyMeasurements, addBodyMeasurement } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addBodyMeasurement({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: parseFloat(formData.get("weight") as string),
      bodyFat: formData.get("bodyFat") ? parseFloat(formData.get("bodyFat") as string) : undefined,
      waist: formData.get("waist") ? parseFloat(formData.get("waist") as string) : undefined,
      chest: formData.get("chest") ? parseFloat(formData.get("chest") as string) : undefined,
    });
    
    setOpen(false);
  };

  const chartData = [...bodyMeasurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight,
      bodyFat: m.bodyFat
    }));

  return (
    <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <Ruler className="text-primary" /> Bio-Stats
          </h1>
          <p className="text-muted-foreground mt-2">Track physical evolution data.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]">
              <Plus size={24} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Log Biometrics</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weight (LB)</Label>
                  <Input id="weight" name="weight" type="number" step="0.1" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Body Fat %</Label>
                  <Input id="bodyFat" name="bodyFat" type="number" step="0.1" className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Waist (IN)</Label>
                  <Input id="waist" name="waist" type="number" step="0.1" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chest (IN)</Label>
                  <Input id="chest" name="chest" type="number" step="0.1" className="bg-background" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 font-black tracking-widest bg-primary text-primary-foreground rounded-2xl text-lg mt-4">
                SYNC DATA
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {bodyMeasurements.length > 0 ? (
        <div className="space-y-6">
          <Card className="bg-secondary/10 border-border overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Weight Progression</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-8">Recent Logs</h3>
          <div className="space-y-3">
            {bodyMeasurements.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-black text-lg">{m.weight} <span className="text-[10px] text-muted-foreground">LB</span></p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {new Date(m.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {m.bodyFat && (
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">{m.bodyFat}%</p>
                          <p className="text-[8px] font-bold uppercase text-muted-foreground">Fat</p>
                        </div>
                      )}
                      {m.waist && (
                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground">{m.waist}"</p>
                          <p className="text-[8px] font-bold uppercase text-muted-foreground">Waist</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border bg-transparent mt-12">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
              <TrendingUp className="text-muted-foreground opacity-50" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">No Biometrics</h3>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Log your initial body metrics to begin tracking your physical evolution over time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

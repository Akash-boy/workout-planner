import { useState } from "react";
import { useLocation } from "wouter";
import { useAppContext, UserProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Activity, Settings, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EQUIPMENT_OPTIONS = [
  { id: "barbell", label: "Barbell & Plates" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "cables", label: "Cable Machine" },
  { id: "machines", label: "Machines (Gym)" },
  { id: "bands", label: "Resistance Bands" },
  { id: "bodyweight", label: "Bodyweight Only" },
];

export default function Profile() {
  const { profile, setProfile } = useAppContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      age: 25,
      weight: 75,
      goal: "muscle",
      experience: "intermediate",
      equipment: ["dumbbells", "bodyweight"],
      daysPerWeek: 4,
    }
  );

  const handleSave = () => {
    setProfile(formData);
    toast({
      title: "Profile Updated",
      description: "Your physical parameters have been saved.",
    });
    setLocation("/planner");
  };

  const toggleEquipment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(id)
        ? prev.equipment.filter((e) => e !== id)
        : [...prev.equipment, id],
    }));
  };

  return (
    <div className="min-h-screen p-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <User className="text-primary" /> Parameters
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your physical stats to generate an optimized training protocol.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="h-12 text-lg font-bold bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-3 text-muted-foreground font-medium">YR</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weight</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="h-12 text-lg font-bold bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary pl-4 pr-12"
                  />
                  <span className="absolute right-4 top-3 text-muted-foreground font-medium">KG</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Objective</Label>
              <Select
                value={formData.goal}
                onValueChange={(val: any) => setFormData({ ...formData, goal: val })}
              >
                <SelectTrigger className="h-12 bg-secondary/50 border-0 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle">Hypertrophy (Muscle Gain)</SelectItem>
                  <SelectItem value="strength">Maximum Strength</SelectItem>
                  <SelectItem value="endurance">Endurance & Conditioning</SelectItem>
                  <SelectItem value="weight_loss">Fat Loss</SelectItem>
                  <SelectItem value="general">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                  <div
                    key={level}
                    onClick={() => setFormData({ ...formData, experience: level })}
                    className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                      formData.experience === level
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="capitalize text-sm">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Settings size={14} /> Training Frequency
              </Label>
              <div className="pt-4 pb-2">
                <Slider
                  value={[formData.daysPerWeek]}
                  onValueChange={([val]) => setFormData({ ...formData, daysPerWeek: val })}
                  max={7}
                  min={1}
                  step={1}
                  className="py-4"
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>1 Day</span>
                <span className="text-primary text-lg">{formData.daysPerWeek} Days/Week</span>
                <span>7 Days</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Dumbbell size={14} /> Available Equipment
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <label
                    key={eq.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      formData.equipment.includes(eq.id)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary/20 hover:bg-secondary/50"
                    }`}
                  >
                    <Checkbox
                      checked={formData.equipment.includes(eq.id)}
                      onCheckedChange={() => toggleEquipment(eq.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-medium">{eq.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full h-14 text-lg font-bold tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary))]"
        >
          {profile ? "UPDATE PROTOCOL" : "INITIALIZE PROTOCOL"}
        </Button>
      </div>
    </div>
  );
}

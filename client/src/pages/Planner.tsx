const EXERCISE_LIBRARY = {
  chest: [
    { name: "Barbell Bench Press", difficulty: "high" },
    { name: "Dumbbell Bench Press", difficulty: "medium" },
    { name: "Incline Barbell Press", difficulty: "high" },
    { name: "Incline Dumbbell Press", difficulty: "medium" },
    { name: "Machine Chest Press", difficulty: "low" },
    { name: "Cable Flyes", difficulty: "medium" },
    { name: "Pushups", difficulty: "low" },
    { name: "Dips", difficulty: "high" },
    { name: "Decline Bench Press", difficulty: "high" },
    { name: "Pec Deck Machine", difficulty: "low" },
    { name: "Close Grip Bench Press", difficulty: "high" },
    { name: "Landmine Press", difficulty: "medium" },
  ],
  back: [
    { name: "Barbell Deadlift", difficulty: "high" },
    { name: "Lat Pulldown", difficulty: "medium" },
    { name: "Bent-Over Rows", difficulty: "high" },
    { name: "Single-Arm Dumbbell Rows", difficulty: "medium" },
    { name: "Cable Rows", difficulty: "medium" },
    { name: "Assisted Pull-ups", difficulty: "medium" },
    { name: "Face Pulls", difficulty: "low" },
    { name: "T-Bar Rows", difficulty: "high" },
    { name: "Rack Pulls", difficulty: "high" },
    { name: "Straight Arm Pulldown", difficulty: "low" },
    { name: "Chest Supported Rows", difficulty: "medium" },
    { name: "Meadows Row", difficulty: "high" },
  ],
  legs: [
    { name: "Barbell Squat", difficulty: "high" },
    { name: "Leg Press", difficulty: "medium" },
    { name: "Bulgarian Split Squat", difficulty: "high" },
    { name: "Leg Extensions", difficulty: "low" },
    { name: "Romanian Deadlift", difficulty: "high" },
    { name: "Leg Curls", difficulty: "medium" },
    { name: "Calf Raises", difficulty: "low" },
    { name: "Hack Squat", difficulty: "high" },
    { name: "Lunges", difficulty: "medium" },
    { name: "Goblet Squat", difficulty: "medium" },
    { name: "Step Ups", difficulty: "medium" },
    { name: "Sumo Deadlift", difficulty: "high" },
  ],
  shoulders: [
    { name: "Overhead Press", difficulty: "high" },
    { name: "Dumbbell Shoulder Press", difficulty: "medium" },
    { name: "Lateral Raises", difficulty: "low" },
    { name: "Reverse Flyes", difficulty: "low" },
    { name: "Plate Loaded Machine Press", difficulty: "medium" },
    { name: "Upright Rows", difficulty: "high" },
    { name: "Machine Shoulder Press", difficulty: "medium" },
    { name: "Arnold Press", difficulty: "medium" },
    { name: "Cable Lateral Raises", difficulty: "low" },
    { name: "Front Raises", difficulty: "low" },
    { name: "Behind The Neck Press", difficulty: "high" },
    { name: "Bent Over Lateral Raises", difficulty: "low" },
  ],
  arms: [
    { name: "Barbell Curl", difficulty: "medium" },
    { name: "Dumbbell Curl", difficulty: "medium" },
    { name: "Cable Curl", difficulty: "low" },
    { name: "Tricep Rope Pushdown", difficulty: "low" },
    { name: "Overhead Tricep Extension", difficulty: "medium" },
    { name: "Tricep Dips", difficulty: "high" },
    { name: "Preacher Curls", difficulty: "medium" },
    { name: "Hammer Curls", difficulty: "medium" },
    { name: "Concentration Curls", difficulty: "low" },
    { name: "Skull Crushers", difficulty: "high" },
    { name: "Close Grip Pushups", difficulty: "low" },
    { name: "Zottman Curls", difficulty: "medium" },
  ],
  core: [
    { name: "Plank", difficulty: "low" },
    { name: "Cable Crunches", difficulty: "medium" },
    { name: "Hanging Leg Raises", difficulty: "high" },
    { name: "Ab Wheel Rollout", difficulty: "high" },
    { name: "Russian Twists", difficulty: "medium" },
    { name: "Dead Bug", difficulty: "medium" },
    { name: "Pallof Press", difficulty: "medium" },
    { name: "Dragon Flag", difficulty: "high" },
  ],
  cardio: [
    { name: "Treadmill Intervals", difficulty: "medium" },
    { name: "Jump Rope", difficulty: "medium" },
    { name: "Box Jumps", difficulty: "high" },
    { name: "Battle Ropes", difficulty: "high" },
    { name: "Rowing Machine", difficulty: "medium" },
    { name: "Stair Climber", difficulty: "medium" },
    { name: "Burpees", difficulty: "high" },
    { name: "Mountain Climbers", difficulty: "medium" },
  ],
};

function getRandomExercises(goal: string, daysCount: number) {
  const bodyParts = Object.keys(EXERCISE_LIBRARY);

  const protocols = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Upper Body",
    "Lower Body",
    "Full Body",
    "Cardio & Core",
    "Strength Focus",
    "Hypertrophy Block",
    "Power & Endurance",
    "Compound Emphasis",
    "Isolation Block",
    "Athletic Performance",
    "Metabolic Conditioning",
    "Functional Strength",
  ];

  // Track used protocols to avoid repetition
  const usedProtocols: string[] = [];
  const usedExercises: string[] = [];

  return Array.from({ length: daysCount }).map((_, dayIdx) => {
    // Pick unique protocol for each day
    const availableProtocols = protocols.filter(
      (p) => !usedProtocols.includes(p),
    );
    const protocol =
      availableProtocols[Math.floor(Math.random() * availableProtocols.length)];
    usedProtocols.push(protocol);

    // Shuffle and pick body parts
    const shuffledParts = [...bodyParts].sort(() => Math.random() - 0.5);
    const selectedParts = shuffledParts.slice(
      0,
      4 + Math.floor(Math.random() * 3),
    );

    const exercises = selectedParts.map((bodyPart, exIdx) => {
      const exercisePool =
        EXERCISE_LIBRARY[bodyPart as keyof typeof EXERCISE_LIBRARY];

      // Pick exercise not used recently
      const availableExercises = exercisePool.filter(
        (e) => !usedExercises.includes(e.name),
      );
      const pool =
        availableExercises.length > 0 ? availableExercises : exercisePool;
      const selectedExercise = pool[Math.floor(Math.random() * pool.length)];
      usedExercises.push(selectedExercise.name);

      let sets: number;
      let reps: string;
      let restTime: number;

      if (goal === "strength") {
        sets = 3 + Math.floor(Math.random() * 3);
        reps = ["3-5", "4-6", "5-8"][Math.floor(Math.random() * 3)];
        restTime = 120 + Math.floor(Math.random() * 60);
      } else if (goal === "muscle") {
        sets = 3 + Math.floor(Math.random() * 2);
        reps = ["6-10", "8-12", "10-15"][Math.floor(Math.random() * 3)];
        restTime = 60 + Math.floor(Math.random() * 60);
      } else if (goal === "endurance") {
        sets = 2 + Math.floor(Math.random() * 3);
        reps = ["12-20", "15-25", "20-30"][Math.floor(Math.random() * 3)];
        restTime = 30 + Math.floor(Math.random() * 30);
      } else {
        sets = 3 + Math.floor(Math.random() * 2);
        reps = ["8-12", "10-15", "12-18"][Math.floor(Math.random() * 3)];
        restTime = 45 + Math.floor(Math.random() * 45);
      }

      return {
        id: `ex-${dayIdx}-${exIdx}-${Date.now()}-${Math.random()}`,
        name: selectedExercise.name,
        sets,
        reps,
        restTime,
      };
    });

    return {
      day: dayIdx + 1,
      title: protocol,
      exercises,
    };
  });
}

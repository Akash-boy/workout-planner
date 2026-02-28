import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./lib/store";
import { Layout } from "./components/Layout";
import NotFound from "@/pages/not-found";

// Page imports
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Planner from "@/pages/Planner";
import Workout from "@/pages/Workout";
import Progress from "@/pages/Progress";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/planner" component={Planner} />
        <Route path="/workout" component={Workout} />
        <Route path="/progress" component={Progress} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;

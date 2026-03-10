import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Switch, Route, Redirect } from "wouter";
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
import Records from "@/pages/Records";

function ProtectedRoute({
  component: Component,
  ...rest
}: {
  component: React.ComponentType;
  path: string;
}) {
  return (
    <Route {...rest}>
      <SignedIn>
        <Component />
      </SignedIn>
      <SignedOut>
        <Redirect to="/sign-up" />
      </SignedOut>
    </Route>
  );
}

function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] md:min-h-screen">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        fallbackRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] md:min-h-screen">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
        fallbackRedirectUrl="/"
        signInForceRedirectUrl="/"
      />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/sign-in/sso-callback">{() => <Redirect to="/" />}</Route>
        <Route path="/sign-up/sso-callback">{() => <Redirect to="/" />}</Route>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/planner" component={Planner} />
        <ProtectedRoute path="/workout" component={Workout} />
        <ProtectedRoute path="/progress" component={Progress} />
        <ProtectedRoute path="/records" component={Records} />
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

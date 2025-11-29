import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Connect from "@/pages/Connect";
import VibrationPenetration from "@/pages/research/VibrationPenetration";
import BrainComputerInterface from "@/pages/research/BrainComputerInterface";
import UserExperience from "@/pages/research/UserExperience";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/connect" component={Connect} />
      <Route path="/research/vibration-penetration" component={VibrationPenetration} />
      <Route path="/research/brain-computer-interface" component={BrainComputerInterface} />
      <Route path="/research/user-experience" component={UserExperience} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

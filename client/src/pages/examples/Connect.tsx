import Connect from '../Connect';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export default function ConnectExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Connect />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

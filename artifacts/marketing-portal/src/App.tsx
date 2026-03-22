import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";

import Dashboard from "@/pages/Dashboard";
import Videos from "@/pages/Videos";
import Shoots from "@/pages/Shoots";
import Approvals from "@/pages/Approvals";
import Calendar from "@/pages/Calendar";
import EmailBlast from "@/pages/EmailBlast";
import Leads from "@/pages/Leads";
import NotFound from "@/pages/not-found";
import SignIn from "@/pages/SignIn";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <SignIn />;

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/videos" component={Videos} />
      <Route path="/shoots" component={Shoots} />
      <Route path="/approvals" component={Approvals} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/email-blast" component={EmailBlast} />
      <Route path="/leads" component={Leads} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ProtectedApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

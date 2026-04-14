import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Browse from "@/pages/Browse";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Reviews from "@/pages/Reviews";
import Requests from "@/pages/Requests";
import CoachProfileView from "@/pages/CoachProfileView";
import CoachSchedule30Days from "@/pages/CoachSchedule30Days";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AthleteDashboard from "@/pages/AthleteDashboard";
import CoachDashboard from "@/pages/CoachDashboard";
import { AthleteRouteGuard, CoachRouteGuard } from "@/components/RouteGuards";

// New mobile-first auth pages
import Welcome from "@/pages/Welcome";
import AuthLogin from "@/pages/AuthLogin";
import AuthSignup from "@/pages/AuthSignup";
import AuthForgotPassword from "@/pages/AuthForgotPassword";
import RoleSelection from "@/pages/RoleSelection";
import OnboardingSteps from "@/pages/OnboardingSteps";

function Router() {
  return (
    <Switch>
      {/* New mobile-first auth routes (no header) */}
      <Route path="/welcome" component={Welcome} />
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/auth/signup" component={AuthSignup} />
      <Route path="/auth/forgot-password" component={AuthForgotPassword} />
      <Route path="/auth/role-selection" component={RoleSelection} />
      <Route path="/auth/onboarding/:role/:step" component={OnboardingSteps} />
      
      {/* Legacy auth routes (keep for backward compatibility) */}
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/browse" component={Browse} />
      
      {/* Athlete-only routes */}
      <Route path="/athlete/dashboard">
        {() => <AthleteRouteGuard><AthleteDashboard /></AthleteRouteGuard>}
      </Route>
      <Route path="/athlete/find-coaches">
        {() => <AthleteRouteGuard><Browse /></AthleteRouteGuard>}
      </Route>
      <Route path="/athlete/requests">
        {() => <AthleteRouteGuard><Requests /></AthleteRouteGuard>}
      </Route>
      <Route path="/athlete/profile">
        {() => <AthleteRouteGuard><Profile /></AthleteRouteGuard>}
      </Route>
      
      {/* Coach-only routes - MUST be before /coach/:coachId to avoid param matching */}
      <Route path="/coach/dashboard">
        {() => <CoachRouteGuard><CoachDashboard /></CoachRouteGuard>}
      </Route>
      <Route path="/coach/requests">
        {() => <CoachRouteGuard><Requests /></CoachRouteGuard>}
      </Route>
      <Route path="/coach/profile">
        {() => <CoachRouteGuard><Profile /></CoachRouteGuard>}
      </Route>
      <Route path="/coach/availability">
        {() => <CoachRouteGuard><CoachProfileView /></CoachRouteGuard>}
      </Route>
      
      {/* Public coach profile view (for athletes browsing) - parameterized route AFTER specific routes */}
      <Route path="/coach/:coachId" component={CoachProfileView} />
      <Route path="/coach/:coachId/schedule" component={CoachSchedule30Days} />
      
      {/* Legacy routes (redirect to role-specific) */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/requests" component={Requests} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  // Hide header on mobile-first auth pages
  const isAuthPage = location.startsWith("/welcome") || 
                     location.startsWith("/auth/");
  
  return (
    <div className="min-h-screen bg-background">
      {!isAuthPage && <Header />}
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

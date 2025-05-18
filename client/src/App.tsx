import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { FormProvider, useFormContext } from "./contexts/FormContext";
import Home from "@/pages/home";
import ProfilePage from "@/pages/profile-page";
import HowItWorks from "@/pages/how-it-works";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import { Redirect } from "wouter";

// Protected route component that checks if user is logged in
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { userProfile } = useFormContext();
  const [location] = useLocation();

  if (!userProfile) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/analyze">
        {() => <ProtectedRoute path="/analyze" component={Home} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute path="/profile" component={ProfilePage} />}
      </Route>
      <Route path="/how-it-works" component={HowItWorks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <Router />
        <Toaster />
      </FormProvider>
    </QueryClientProvider>
  );
}

export default App;

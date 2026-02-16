import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { LogIn, BookOpen, Sun, Moon } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import TermDetail from "@/pages/TermDetail";
import ProposeTerm from "@/pages/ProposeTerm";
import DesignSystem from "@/pages/DesignSystem";
import ReviewQueue from "@/pages/ReviewQueue";
import MyProposals from "@/pages/MyProposals";
import ManageCategories from "@/pages/ManageCategories";
import Settings from "@/pages/Settings";
import BrowsePrinciples from "@/pages/BrowsePrinciples";
import PrincipleDetail from "@/pages/PrincipleDetail";
import ManagePrinciples from "@/pages/ManagePrinciples";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/propose" component={ProposeTerm} />
      <Route path="/term/:id" component={TermDetail} />
      <Route path="/design" component={DesignSystem} />
      <Route path="/review" component={ReviewQueue} />
      <Route path="/my-proposals" component={MyProposals} />
      <Route path="/categories" component={ManageCategories} />
      <Route path="/settings" component={Settings} />
      <Route path="/principles" component={BrowsePrinciples} />
      <Route path="/principle/:slug" component={PrincipleDetail} />
      <Route path="/manage-principles" component={ManagePrinciples} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const searchParams = new URLSearchParams(window.location.search);
  const authError = searchParams.get("auth_error");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
          data-testid="button-theme-toggle-login"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-header text-3xl font-bold tracking-tight text-foreground">
            Katalyst <span className="text-primary">Lexicon</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            The shared language that defines how we work together.
          </p>
        </div>

        {authError === "domain" && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" data-testid="text-auth-error-domain">
            Access is restricted to authorized email domains. Please sign in with your company account.
          </div>
        )}
        {authError === "server" && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" data-testid="text-auth-error-server">
            Something went wrong during sign in. Please try again.
          </div>
        )}

        <div className="space-y-4">
          <a href="/api/login" data-testid="button-login">
            <Button size="lg" className="w-full gap-2 font-bold shadow-md hover:shadow-lg transition-all">
              <LogIn className="h-5 w-5" />
              Sign in with Google
            </Button>
          </a>
          <p className="text-xs text-muted-foreground">
            Use your company Google account to access the Lexicon.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthGate />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

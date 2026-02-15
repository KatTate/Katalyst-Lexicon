import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

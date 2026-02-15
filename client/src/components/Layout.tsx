import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, Grid, Plus, Settings, Menu, Palette, ClipboardCheck, FolderCog, BookOpen, FileEdit, LogOut, LogIn, Sun, Moon } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Category, Proposal } from "@/lib/api";
import { SpotlightSearch } from "./SpotlightSearch";
import { SpotlightProvider } from "./SpotlightContext";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { canReview, canAdmin, canPropose } from "@shared/permissions";

interface LayoutProps {
  children: React.ReactNode;
}

function getUserInitials(user: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  if (!user) return "?";
  const f = user.firstName?.[0] || "";
  const l = user.lastName?.[0] || "";
  if (f || l) return `${f}${l}`.toUpperCase();
  return (user.email?.[0] || "?").toUpperCase();
}

function getUserDisplayName(user: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  if (!user) return "Guest";
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.email || "User";
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const openSpotlight = useCallback(() => setSpotlightOpen(true), []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
    enabled: isAuthenticated,
  });

  const pendingProposalsCount = proposals.filter(p => 
    p.status === "pending" || p.status === "in_review" || p.status === "changes_requested"
  ).length;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const userRole = user?.role || null;
  const showReview = userRole ? canReview(userRole) : false;
  const showAdmin = userRole ? canAdmin(userRole) : false;
  const showPropose = userRole ? canPropose(userRole) : false;

  const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer group font-sans text-sm font-medium",
          isActive 
            ? "bg-primary/10 text-primary border-l-4 border-primary pl-2" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )} data-testid={`nav-${href.replace("/", "") || "home"}`}>
          <div className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <span>{label}</span>
          </div>
          {badge !== undefined && badge > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full" data-testid="review-badge-count">
              {badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const spotlightContextValue = useMemo(() => ({ openSpotlight }), [openSpotlight]);

  return (
    <SpotlightProvider value={spotlightContextValue}>
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        data-testid="skip-link"
      >
        Skip to main content
      </a>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/">
            <h1 className="font-header text-2xl font-bold tracking-tight text-sidebar-foreground cursor-pointer" data-testid="link-logo">
              Katalyst <span className="text-primary">Lexicon</span>
            </h1>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
              Internal V1.0
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
              data-testid="button-theme-toggle"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {showPropose && (
              <Link href="/propose">
                <Button className="w-full justify-start gap-2 mb-4 shadow-sm hover:shadow-md transition-all font-bold bg-primary text-white hover:bg-primary/90" variant="default" data-testid="nav-propose-term">
                  <Plus className="h-4 w-4" />
                  Propose Term
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <NavItem href="/my-proposals" icon={FileEdit} label="My Proposals" />
            )}

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Knowledge Base
              </p>
              <NavItem href="/" icon={Search} label="Search & Discover" />
              <NavItem href="/browse" icon={Grid} label="Browse Categories" />
              <NavItem href="/principles" icon={BookOpen} label="Principles" />
            </div>

            {showReview && (
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Approver Tools
              </p>
              <NavItem href="/review" icon={ClipboardCheck} label="Review Queue" badge={pendingProposalsCount} />
            </div>
            )}

            {showAdmin && (
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Administration
              </p>
              <NavItem href="/categories" icon={FolderCog} label="Manage Categories" />
              <NavItem href="/manage-principles" icon={BookOpen} label="Manage Principles" />
              <NavItem href="/settings" icon={Settings} label="System Settings" />
              <NavItem href="/design" icon={Palette} label="Design System" />
            </div>
            )}
            
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Quick Links
              </p>
              {categories.slice(0, 4).map(cat => (
                <Link key={cat.id} href={`/browse?category=${encodeURIComponent(cat.name)}`}>
                  <div className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors truncate" data-testid={`quicklink-${cat.id}`}>
                    {cat.name}
                  </div>
                </Link>
              ))}
              <Link href="/browse">
                <div className="px-3 py-2 text-sm text-primary font-medium hover:underline cursor-pointer mt-1" data-testid="link-view-all-categories">
                  View all categories...
                </div>
              </Link>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-2 rounded-md">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-header font-bold text-sm shadow-sm overflow-hidden">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  getUserInitials(user)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate" data-testid="text-username">{getUserDisplayName(user)}</p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">{user.role}</p>
              </div>
              <a href="/api/logout" data-testid="button-logout" aria-label="Log out">
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <a href="/api/login" className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors" data-testid="button-login">
              <LogIn className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-sidebar-foreground">Sign In</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 bg-background relative outline-none">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-sidebar sticky top-0 z-30">
          <h1 className="font-header text-xl font-bold text-sidebar-foreground">Katalyst Lexicon</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px]"
              data-testid="button-theme-toggle-mobile"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openSpotlight}
              className="min-h-[44px] min-w-[44px]"
              data-testid="button-header-search"
              aria-label="Search the Lexicon"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="min-h-[44px] min-w-[44px]" data-testid="button-mobile-menu" aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMobileMenuOpen}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsMobileMenuOpen(false); }}
        />
      )}

      <SpotlightSearch open={spotlightOpen} onOpenChange={setSpotlightOpen} />
    </div>
    </SpotlightProvider>
  );
}

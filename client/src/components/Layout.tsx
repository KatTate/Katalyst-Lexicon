import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Search, Book, Grid, Plus, Settings, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/mockData";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-sidebar-primary cursor-pointer">
              Katalyst <span className="text-sidebar-foreground font-light">Lexicon</span>
            </h1>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-medium">
            Internal V1.0
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            <Link href="/propose">
              <Button className="w-full justify-start gap-2 mb-6 shadow-sm hover:shadow-md transition-all" variant="default">
                <Plus className="h-4 w-4" />
                Propose Term
              </Button>
            </Link>

            <NavItem href="/" icon={Search} label="Search & Discover" />
            <NavItem href="/browse" icon={Grid} label="Browse Categories" />
            
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Categories
              </p>
              {CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat} href={`/browse?category=${encodeURIComponent(cat)}`}>
                  <div className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors truncate hover:translate-x-1 duration-200">
                    {cat}
                  </div>
                </Link>
              ))}
              <Link href="/browse">
                <div className="px-3 py-1.5 text-sm text-primary hover:underline cursor-pointer">
                  View all...
                </div>
              </Link>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm">
              SJ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Sarah Jenkins</p>
              <p className="text-xs text-muted-foreground truncate">Editor</p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background lg:bg-background/50 relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-30">
          <h1 className="font-serif text-xl font-semibold">Katalyst Lexicon</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
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
        />
      )}
    </div>
  );
}

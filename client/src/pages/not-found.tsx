import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found — Katalyst Lexicon";
    return () => { document.title = "Katalyst Lexicon"; };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        data-testid="skip-link"
      >
        Skip to main content
      </a>
      <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center outline-none">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

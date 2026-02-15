import { Layout } from "@/components/Layout";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function DesignSystem() {
  useEffect(() => {
    document.title = "Design System — Katalyst Lexicon";
    return () => { document.title = "Katalyst Lexicon"; };
  }, []);
  const ColorCard = ({ name, colorClass, hex, variable }: { name: string, colorClass: string, hex: string, variable: string }) => (
    <div className="space-y-2">
      <div className={cn("h-20 w-full rounded-md shadow-sm border border-border/50", colorClass)} />
      <div className="space-y-0.5">
        <p className="font-header font-bold text-sm">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{variable}</p>
        <p className="font-mono text-xs text-muted-foreground opacity-70">{hex}</p>
      </div>
    </div>
  );

  const TypographySample = ({ role, size, weight, font, text }: { role: string, size: string, weight: string, font: string, text: string }) => (
    <div className="grid grid-cols-12 gap-4 items-baseline py-4 border-b border-border/50">
      <div className="col-span-3">
        <p className="text-sm font-medium text-muted-foreground">{role}</p>
        <p className="text-xs font-mono text-muted-foreground/70 mt-1">{font} • {size} • {weight}</p>
      </div>
      <div className="col-span-9">
        <p className={cn(size, weight, font, "text-foreground")}>{text}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground font-header">Design System</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            This document outlines the official colors, typography, and spacing tokens for the Katalyst Lexicon application. 
            Adherence to these guidelines ensures consistency across the platform.
          </p>
        </div>

        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-header border-b pb-2">Color Palette</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold font-header mb-4">Primary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ColorCard name="Katalyst Green" colorClass="bg-kat-green" hex="#78BF26" variable="kat-green" />
                <ColorCard name="Charcoal" colorClass="bg-kat-charcoal" hex="#50534C" variable="kat-charcoal" />
                <ColorCard name="Black" colorClass="bg-kat-black" hex="#3D3936" variable="kat-black" />
                <ColorCard name="Gray" colorClass="bg-kat-gray" hex="#D0D1DB" variable="kat-gray" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-header mb-4">Extended Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ColorCard name="Gray Light" colorClass="bg-kat-graylight" hex="#F5F6F8" variable="kat-graylight" />
                <ColorCard name="Warning" colorClass="bg-kat-warning" hex="#E1D660" variable="kat-warning" />
                <ColorCard name="Basque" colorClass="bg-kat-basque" hex="#676F13" variable="kat-basque" />
                <ColorCard name="Edamame" colorClass="bg-kat-edamame" hex="#96A487" variable="kat-edamame" />
                <ColorCard name="Wheat" colorClass="bg-kat-wheat" hex="#DDCDAE" variable="kat-wheat" />
                <ColorCard name="Zeus" colorClass="bg-kat-zeus" hex="#A6A091" variable="kat-zeus" />
                <ColorCard name="Gauntlet" colorClass="bg-kat-gauntlet" hex="#8C898C" variable="kat-gauntlet" />
                <ColorCard name="Mystical" colorClass="bg-kat-mystical" hex="#A9A2AA" variable="kat-mystical" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-header mb-4">Standard Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ColorCard name="Standard Red" colorClass="bg-destructive" hex="#EF4444" variable="std-red" />
                <ColorCard name="Standard Yellow" colorClass="bg-yellow-500" hex="#EAB308" variable="std-yellow" />
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-header border-b pb-2">Typography</h2>
          
          <div className="space-y-2">
            <TypographySample 
              role="Page Title" 
              size="text-3xl" 
              weight="font-bold" 
              font="font-header" 
              text="The quick brown fox jumps over the lazy dog" 
            />
             <TypographySample 
              role="Section Header" 
              size="text-2xl" 
              weight="font-bold" 
              font="font-header" 
              text="The quick brown fox jumps over the lazy dog" 
            />
             <TypographySample 
              role="Subsection Header" 
              size="text-xl" 
              weight="font-bold" 
              font="font-header" 
              text="The quick brown fox jumps over the lazy dog" 
            />
             <TypographySample 
              role="Card Title" 
              size="text-lg" 
              weight="font-bold" 
              font="font-header" 
              text="The quick brown fox jumps over the lazy dog" 
            />
             <TypographySample 
              role="Small Label" 
              size="text-sm uppercase tracking-wide" 
              weight="font-bold" 
              font="font-header" 
              text="Small Label" 
            />
             <TypographySample 
              role="Large Body" 
              size="text-lg" 
              weight="font-normal" 
              font="font-sans" 
              text="Introductory paragraphs or emphasis text uses this style." 
            />
             <TypographySample 
              role="Standard Body" 
              size="text-base" 
              weight="font-normal" 
              font="font-sans" 
              text="The default size for most content and descriptions. Clean and readable." 
            />
             <TypographySample 
              role="Small Body" 
              size="text-sm" 
              weight="font-normal" 
              font="font-sans" 
              text="For supporting information or compact interfaces." 
            />
             <TypographySample 
              role="Metadata" 
              size="text-xs" 
              weight="font-normal" 
              font="font-sans" 
              text="For metadata, timestamps, and tertiary information." 
            />
            <TypographySample 
              role="KPI Value" 
              size="text-3xl" 
              weight="font-bold" 
              font="font-sans" 
              text="$1,234,567" 
            />
            <TypographySample 
              role="Precise Value" 
              size="text-base" 
              weight="font-normal" 
              font="font-mono" 
              text="$45,678.90" 
            />
          </div>
        </section>

      </div>
    </Layout>
  );
}

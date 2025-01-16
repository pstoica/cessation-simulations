import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import type { SketchConfig } from "../../types/sketch";
import { SketchSelector } from "../sketches/SketchSelector";

interface FloatingControlsProps {
  title: string;
  config: SketchConfig;
  sketches: Array<{ url: string; title: string }>;
  children: React.ReactNode;
}

export function FloatingControls({
  title,
  config,
  sketches,
  children,
}: FloatingControlsProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <div
        className={cn(
          "fixed bottom-20 left-5 z-50 w-[400px] max-h-[calc(100vh-100px)]",
          "bg-background rounded-lg shadow-lg flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[150%]"
        )}
      >
        <div className="w-full h-full overflow-y-auto rounded-lg">
          <div className="p-4 pb-0">{children}</div>
          <SketchSelector
            sketches={sketches}
            currentTitle={title}
            config={config}
            currentValues={{}}
          />
        </div>
      </div>

      <Button
        size="icon"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-5 left-5 z-[51] h-12 w-12 rounded-full",
          "bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "hover:bg-accent hover:text-accent-foreground",
          isOpen && "bg-accent text-accent-foreground"
        )}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Toggle controls</span>
      </Button>
    </>
  );
}

import { useState, useEffect } from "react";
import { exportAllPresets, importAllPresets } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { PresetControls } from "../ui/PresetControls";
import type { SketchConfig } from "../../types/sketch";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Save,
  Upload,
} from "lucide-react";

interface Sketch {
  url: string;
  title: string;
}

interface SketchSelectorProps {
  sketches: Sketch[];
  currentTitle: string;
  config: SketchConfig;
  currentValues: Record<
    string,
    number | boolean | string | [number, number, number]
  >;
}

export function SketchSelector({
  sketches,
  currentTitle,
  config,
  currentValues,
}: SketchSelectorProps) {
  const currentIndex = sketches.findIndex((s) =>
    s.url.includes(currentTitle.toLowerCase().replace(" ", "-"))
  );

  const handleSketchChange = (url: string) => {
    window.location.href = url;
  };

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + sketches.length) % sketches.length;
    handleSketchChange(sketches[newIndex].url);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % sketches.length;
    handleSketchChange(sketches[newIndex].url);
  };

  const handleExportPresets = () => {
    exportAllPresets();
  };

  const handleImportPresets = async (file: File) => {
    await importAllPresets(file);
    window.location.reload();
  };

  return (
    <div className="p-4 pb-3 border-b border-[#ddd] bg-white space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {currentTitle}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-white z-50">
            {sketches.map((sketch) => (
              <DropdownMenuItem
                key={sketch.url}
                onSelect={() => handleSketchChange(sketch.url)}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent"
              >
                {sketch.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <PresetControls
        config={config}
        presets={config.presets}
        currentValues={currentValues}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleExportPresets}
        >
          <Save className="mr-2 h-4 w-4" />
          Export All Presets
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => document.getElementById("import-all")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import All Presets
        </Button>
        <input
          type="file"
          id="import-all"
          accept=".json"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleImportPresets(e.target.files[0])
          }
        />
      </div>
    </div>
  );
}

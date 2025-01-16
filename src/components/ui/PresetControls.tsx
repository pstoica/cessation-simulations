import { useState, useEffect, useCallback } from "react";
import type { Preset, SketchConfig } from "../../types/sketch";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./dropdown-menu";
import { ChevronLeft, ChevronRight, ChevronDown, Save } from "lucide-react";

type ControlValue = number | boolean | string | [number, number, number];

interface PresetControlsProps {
  config: SketchConfig;
  presets?: Preset[];
  currentValues: Record<string, ControlValue>;
}

export function PresetControls({
  config,
  presets: defaultPresets = [],
  currentValues,
}: PresetControlsProps) {
  const onLoad = useCallback((values: Record<string, ControlValue>) => {
    window.dispatchEvent(
      new CustomEvent("preset-load", {
        detail: { values },
      })
    );
  }, []);

  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Initialize presets and load first preset
  useEffect(() => {
    const savedPresets = localStorage.getItem(`${config.id}-presets`);
    const allPresets = savedPresets
      ? [...defaultPresets, ...JSON.parse(savedPresets)]
      : defaultPresets;

    setPresets(allPresets);

    if (allPresets.length > 0) {
      const firstPreset = allPresets[0];
      setSelectedPreset(firstPreset.name);
      onLoad(firstPreset.values);
    }
  }, [config.id, defaultPresets, onLoad]);

  const handlePresetChange = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      onLoad(preset.values);
      setSelectedPreset(preset.name);
    }
  };

  const handlePrevious = () => {
    const currentIndex = presets.findIndex((p) => p.name === selectedPreset);
    const newIndex = (currentIndex - 1 + presets.length) % presets.length;
    handlePresetChange(presets[newIndex].name);
  };

  const handleNext = () => {
    const currentIndex = presets.findIndex((p) => p.name === selectedPreset);
    const newIndex = (currentIndex + 1) % presets.length;
    handlePresetChange(presets[newIndex].name);
  };

  const handleSave = () => {
    const name = prompt("Enter preset name:", "New Preset");
    if (!name) return;

    const newPreset = { name, values: currentValues };
    const savedPresets = localStorage.getItem(`${config.id}-presets`);
    const userPresets = savedPresets ? JSON.parse(savedPresets) : [];

    userPresets.push(newPreset);
    localStorage.setItem(`${config.id}-presets`, JSON.stringify(userPresets));
    setPresets([...defaultPresets, ...userPresets]);
    setSelectedPreset(name);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="shrink-0"
        disabled={presets.length === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedPreset || "Select preset..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-white z-50">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.name}
              onSelect={() => handlePresetChange(preset.name)}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent"
            >
              {preset.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        className="shrink-0"
        disabled={presets.length === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleSave}
        className="shrink-0"
        title="Save Preset"
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}

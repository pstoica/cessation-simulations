import { useState, useEffect } from "react";
import type { Preset, SketchConfig } from "../../types/sketch";

interface PresetControlsProps {
  config: SketchConfig;
  presets?: Preset[];
  currentValues: Record<string, any>;
  onLoad: (values: Record<string, any>) => void;
}

export function PresetControls({
  config,
  presets: defaultPresets = [],
  currentValues,
  onLoad,
}: PresetControlsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [presets, setPresets] = useState<Preset[]>(defaultPresets);

  // Load saved presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem(`${config.id}-presets`);
    if (savedPresets) {
      setPresets([...defaultPresets, ...JSON.parse(savedPresets)]);
    }
  }, [config.id, defaultPresets]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = presets.find((p) => p.name === e.target.value);
    if (preset) {
      onLoad(preset.values);
      setSelectedPreset(preset.name);
    }
  };

  const savePreset = (name: string, values: Record<string, any>) => {
    const newPreset = { name, values };
    const savedPresets = localStorage.getItem(`${config.id}-presets`);
    const userPresets = savedPresets ? JSON.parse(savedPresets) : [];

    // Replace if exists, add if new
    const index = userPresets.findIndex((p: Preset) => p.name === name);
    if (index >= 0) {
      userPresets[index] = newPreset;
    } else {
      userPresets.push(newPreset);
    }

    localStorage.setItem(`${config.id}-presets`, JSON.stringify(userPresets));
    setPresets([...defaultPresets, ...userPresets]);
    setSelectedPreset(name);
  };

  const handleSave = () => {
    const defaultName = selectedPreset
      ? `${selectedPreset} (copy)`
      : "New Preset";
    const name = prompt("Enter preset name:", defaultName);

    if (name) {
      savePreset(name, currentValues);
    }
  };

  const handleExport = () => {
    const preset = {
      name: selectedPreset,
      values: currentValues,
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(preset, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPreset || "preset"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const preset = JSON.parse(e.target?.result as string);
          if (preset.name && preset.values) {
            savePreset(preset.name, preset.values);
            onLoad(preset.values);
          }
        } catch (err) {
          console.error("Failed to import preset:", err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        value={selectedPreset}
        onChange={handlePresetChange}
        className="flex-1 p-2 border rounded-lg bg-white"
      >
        <option value="">Select preset...</option>
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        className="p-2 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
        title="Save Preset"
      >
        💾
      </button>
    </div>
  );
}

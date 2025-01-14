import { useState } from "react";
import type { Preset } from "../types/sketch";

interface PresetControlsProps {
  presets?: Preset[];
  onLoad: (values: Record<string, any>) => void;
  onSave: (name: string, values: Record<string, any>) => void;
}

export function PresetControls({
  presets = [],
  onLoad,
  onSave,
}: PresetControlsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = presets.find((p) => p.name === e.target.value);
    if (preset) {
      onLoad(preset.values);
      setSelectedPreset(preset.name);
    }
  };

  const handleSave = () => {
    // Default name based on selected preset
    const defaultName = selectedPreset
      ? `${selectedPreset} (copy)`
      : "New Preset";
    const name = prompt("Enter preset name:", defaultName);

    if (name) {
      // Get current values from all controls
      const controls = document.querySelectorAll('input[type="range"]');
      const currentValues: Record<string, any> = {};

      controls.forEach((control: HTMLInputElement) => {
        const id = control.id || control.getAttribute("data-id");
        if (id) {
          currentValues[id] = parseFloat(control.value);
        }
      });

      onSave(name, currentValues);
      setSelectedPreset(name);
    }
  };

  const handleExport = () => {
    // TODO: Export functionality
  };

  const handleImport = () => {
    // TODO: Import functionality
  };

  return (
    <div className="space-y-3">
      <select
        value={selectedPreset}
        onChange={handlePresetChange}
        className="w-full p-3 border rounded-lg text-lg bg-white"
      >
        <option value="">Select preset...</option>
        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2 h-[46px]">
        <button
          onClick={handleSave}
          className="flex-1 border rounded-lg bg-white hover:bg-gray-50 transition-colors text-lg"
        >
          Save
        </button>
        <button
          onClick={handleExport}
          className="flex-1 border rounded-lg bg-white hover:bg-gray-50 transition-colors text-lg"
        >
          Export
        </button>
        <button
          onClick={handleImport}
          className="flex-1 border rounded-lg bg-white hover:bg-gray-50 transition-colors text-lg"
        >
          Import
        </button>
      </div>
    </div>
  );
}

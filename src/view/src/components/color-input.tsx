import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "~/core";

export type ColorInputProps = {
  error?: boolean;
  errorMessage?: string;
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const PRESET_COLORS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#000000",
];

// Checkerboard pattern for transparent/empty color preview
const CHECKERBOARD_IMAGE =
  "linear-gradient(45deg, #ccc 25%, transparent 25%), " +
  "linear-gradient(-45deg, #ccc 25%, transparent 25%), " +
  "linear-gradient(45deg, transparent 75%, #ccc 75%), " +
  "linear-gradient(-45deg, transparent 75%, #ccc 75%)";
const CHECKERBOARD_POSITION = "0 0, 0 5px, 5px -5px, -5px 0px";
const CHECKERBOARD_SIZE = "10px 10px";

// Validates CSS color using browser's style parser
// Works for named colors (red, blue), hex (#FF5722), rgb(), hsl(), etc.
const isValidColor = (color: string): boolean => {
  if (!color) return false;
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};

export const ColorInput = ({
  error,
  errorMessage,
  id,
  onChange,
  placeholder = "e.g., #FF5722, red, blue",
  value,
}: ColorInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const displayColor = isValidColor(value) ? value : "transparent";
  const hasValidColor = isValidColor(value);

  return (
    <div className="flex gap-2">
      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            aria-label="Open color picker"
            className="h-9 w-9 shrink-0 p-0"
            type="button"
            variant="outline"
          >
            <div
              className="h-5 w-5 rounded-sm border border-border"
              style={{
                backgroundColor: displayColor,
                backgroundImage: hasValidColor ? undefined : CHECKERBOARD_IMAGE,
                backgroundPosition: CHECKERBOARD_POSITION,
                backgroundSize: CHECKERBOARD_SIZE,
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="space-y-3">
            <HexColorPicker
              aria-label="Color picker gradient"
              color={hasValidColor && value.startsWith("#") ? value : "#000000"}
              onChange={onChange}
            />
            <div className="grid grid-cols-10 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  aria-label={`Select color ${color}`}
                  className="h-5 w-5 rounded-sm border border-border cursor-pointer hover:scale-110 transition-transform"
                  key={color}
                  onClick={() => handlePresetClick(color)}
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        className="flex-1"
        error={error}
        errorMessage={errorMessage}
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};

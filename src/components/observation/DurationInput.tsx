import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface DurationInputProps {
  value: number; // Duration in seconds
  onChange: (seconds: number) => void;
  disabled?: boolean;
}

export const DurationInput = ({ value, onChange, disabled }: DurationInputProps) => {
  const [displayValue, setDisplayValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    setDisplayValue(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    // Validate format MM:SS
    const regex = /^(\d{1,2}):(\d{2})$/;
    const match = input.match(regex);

    if (!match) {
      setError("Format must be MM:SS");
      return;
    }

    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);

    if (seconds >= 60) {
      setError("Seconds must be less than 60");
      return;
    }

    if (minutes > 99) {
      setError("Minutes cannot exceed 99");
      return;
    }

    setError("");
    onChange(minutes * 60 + seconds);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="duration">Duration (MM:SS)</Label>
      <Input
        id="duration"
        value={displayValue}
        onChange={handleChange}
        placeholder="05:30"
        disabled={disabled}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

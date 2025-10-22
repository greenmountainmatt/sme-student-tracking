import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface ObserverIdentificationProps {
  onObserverChange: (observer: string) => void;
}

export function ObserverIdentification({ onObserverChange }: ObserverIdentificationProps) {
  const [observer, setObserver] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lastObserver");
    if (saved) {
      setObserver(saved);
      onObserverChange(saved);
    }
  }, [onObserverChange]);

  const handleChange = (value: string) => {
    setObserver(value);
    localStorage.setItem("lastObserver", value);
    onObserverChange(value);
  };

  return (
    <Card className="border-2 border-primary/20 bg-accent/10">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Label htmlFor="observer" className="text-base font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Observer <span className="text-destructive">*</span>
          </Label>
          <Input
            id="observer"
            placeholder="Enter your name or initials"
            value={observer}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm h-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}

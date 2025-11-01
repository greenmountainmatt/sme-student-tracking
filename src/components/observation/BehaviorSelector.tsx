import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BehaviorSelectorProps {
  value: string;
  otherValue: string;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
  disabled?: boolean;
}

export function BehaviorSelector({
  value,
  otherValue,
  onChange,
  onOtherChange,
  disabled,
}: BehaviorSelectorProps) {
  const displayValue = value === "Other" && otherValue ? otherValue : value;

  if (value && value !== "") {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Behavior <Badge variant="secondary" className="ml-2">Optional</Badge>
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-base py-2 px-4 min-h-[44px] flex items-center gap-2">
            {displayValue}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
              onClick={() => {
                onChange("");
                onOtherChange("");
              }}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Behavior <Badge variant="secondary" className="ml-2">Optional</Badge>
      </Label>
      <div className="space-y-2">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="h-12 text-base min-h-[44px]">
            <SelectValue placeholder="Select behavior (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="Verbal Outburst">Verbal Outburst</SelectItem>
            <SelectItem value="Physical Aggression">Physical Aggression</SelectItem>
            <SelectItem value="Off-Task Behavior">Off-Task Behavior</SelectItem>
            <SelectItem value="Compliance">Compliance</SelectItem>
            <SelectItem value="Self-Injury">Self-Injury</SelectItem>
            <SelectItem value="Tantrum">Tantrum</SelectItem>
            <SelectItem value="Withdrawal">Withdrawal</SelectItem>
            <SelectItem value="Positive Participation">Positive Participation</SelectItem>
            <SelectItem value="Disruptive Behavior">Disruptive Behavior</SelectItem>
            <SelectItem value="Attention Seeking">Attention Seeking</SelectItem>
            <SelectItem value="Fidgeting">Fidgeting</SelectItem>
            <SelectItem value="Spitting">Spitting</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {value === "Other" && (
          <Input
            placeholder="Specify behavior..."
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            className="h-12 text-base"
            disabled={disabled}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Tag observations by behavior type for better reporting
        </p>
      </div>
    </div>
  );
}

import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FieldInfoProps {
  title: string;
  description: string;
  formula?: string;
  goodRange?: string;
  example?: string;
}

export default function FieldInfo({ title, description, formula, goodRange, example }: FieldInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {formula && (
            <div className="text-xs bg-muted p-2 rounded">
              <span className="font-medium">Formula:</span> {formula}
            </div>
          )}
          {goodRange && (
            <div className="text-xs">
              <span className="font-medium">Good Range:</span> {goodRange}
            </div>
          )}
          {example && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Example:</span> {example}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

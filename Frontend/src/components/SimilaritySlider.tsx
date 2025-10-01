import { Slider } from '@/components/ui/slider';

interface SimilaritySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SimilaritySlider({ value, onChange }: SimilaritySliderProps) {
  return (
    <div className="glass-card-strong rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Similarity threshold</span>
        <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0.60}
        max={0.90}
        step={0.01}
        className="py-2"
        aria-label="Similarity threshold"
      />
      <p className="text-xs text-muted-foreground">
        Higher = fewer but safer matches
      </p>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Luggage, Utensils, Plus, Minus } from 'lucide-react';

interface AddOnsPanelProps {
  baggage: number;
  mealPreference: string | null;
  onBaggageChange?: (count: number) => void;
  onMealChange?: (meal: string) => void;
  disabled?: boolean;
}

const MEAL_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'child', label: 'Child Meal' },
];

const BAGGAGE_PRICE = 30;
const MAX_BAGS = 5;

export function AddOnsPanel({ baggage, mealPreference, onBaggageChange, onMealChange, disabled }: AddOnsPanelProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Luggage className="h-4 w-4 sm:h-5 sm:w-5" />
            Checked Baggage
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">${BAGGAGE_PRICE} per bag (max {MAX_BAGS})</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onBaggageChange?.(Math.max(0, baggage - 1))}
                disabled={baggage === 0 || disabled}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[50px] sm:min-w-[60px]">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{baggage}</div>
                <div className="text-xs text-muted-foreground">bags</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onBaggageChange?.(Math.min(MAX_BAGS, baggage + 1))}
                disabled={baggage === MAX_BAGS || disabled}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold text-primary">${baggage * BAGGAGE_PRICE}</div>
              <div className="text-xs text-muted-foreground">total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
            Meal Preference
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Select your in-flight meal</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={mealPreference === option.value ? 'default' : 'outline'}
                className="justify-start text-xs sm:text-sm"
                disabled={disabled}
                onClick={() => onMealChange?.(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {mealPreference && (
            <div className="mt-3 p-2.5 bg-primary/5 border border-primary/20 rounded text-xs sm:text-sm text-foreground">
              Selected: <span className="font-medium">{MEAL_OPTIONS.find(m => m.value === mealPreference)?.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

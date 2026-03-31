import { Check } from 'lucide-react';

interface BookingProgressProps {
  currentStep: 'search' | 'select' | 'customize' | 'book' | 'confirm';
}

const STEPS = [
  { id: 'search', label: 'Search Flights' },
  { id: 'select', label: 'Select Flight' },
  { id: 'customize', label: 'Customize' },
  { id: 'book', label: 'Book' },
  { id: 'confirm', label: 'Confirm' },
];

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    isCurrent ? 'text-primary' : isUpcoming ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

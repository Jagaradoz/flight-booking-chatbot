import { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleProgressProps {
  currentStep: 'search' | 'select' | 'customize' | 'book' | 'confirm';
}

const STEPS = [
  { id: 'search', label: 'Search' },
  { id: 'select', label: 'Select' },
  { id: 'customize', label: 'Customize' },
  { id: 'book', label: 'Book' },
  { id: 'confirm', label: 'Confirm' },
];

export function CollapsibleProgress({ currentStep }: CollapsibleProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 z-10" ref={containerRef}>
      <div
        className="bg-card rounded-lg shadow-lg border border-border transition-all duration-300 ease-in-out"
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground transition-colors animate-in fade-in duration-300"
          >
            <div className="flex items-center gap-1">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div
                    key={step.id}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      isCompleted
                        ? 'bg-success'
                        : isCurrent
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                );
              })}
            </div>
            <span>Step {currentIndex + 1}/5</span>
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        ) : (
          <div className="px-6 sm:px-8 py-3 sm:py-4 animate-in fade-in duration-300">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-2 mb-3 w-full"
            >
              <span className="text-xs sm:text-sm font-semibold text-foreground">Booking Progress</span>
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </button>
            <div className="grid grid-cols-5 gap-3 sm:gap-4">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;

                return (
                  <div key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : index + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-1 font-medium whitespace-nowrap ${
                          isCurrent ? 'text-primary' : isUpcoming ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

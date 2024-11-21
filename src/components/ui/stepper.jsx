// StepContainer, Stepper, Step, StepLabel, StepContent, StepDescription, StepIcon

import React, { createContext } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Context for managing stepper state
const StepperContext = createContext();

const Stepper = React.forwardRef(({ activeStep = 0, className, children, ...props }, ref) => (
  <StepperContext.Provider value={{ activeStep }}>
    <div ref={ref} className={cn('flex flex-col space-y-4', className)} {...props}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          index,
          isActive: index === activeStep,
          isCompleted: index < activeStep,
        })
      )}
    </div>
  </StepperContext.Provider>
));
Stepper.displayName = 'Stepper';

const Step = React.forwardRef(({ isActive, isCompleted, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col', isActive ? 'opacity-100' : 'opacity-60', className)}
    {...props}
  >
    {children}
  </div>
));
Step.displayName = 'Step';

const StepLabel = React.forwardRef(({ isActive, isCompleted, index, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center',
      isActive ? 'text-blue-600' : 'text-gray-500',
      className
    )}
    {...props}
  >
    <div
      className={cn(
        'w-6 h-6 flex items-center justify-center rounded-full border-2',
        isActive
          ? 'border-blue-600'
          : isCompleted
          ? 'border-green-600'
          : 'border-gray-300'
      )}
    >
      {isCompleted ? (
        <Check size={14} className="text-green-600" />
      ) : (
        <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>{index + 1}</span>
      )}
    </div>
    <span className="ml-2 font-medium">{children}</span>
  </div>
));
StepLabel.displayName = 'StepLabel';

const StepContent = React.forwardRef(({ isActive, className, children, ...props }, ref) => {
  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className={cn('ml-8 mt-2 border-l-2 border-gray-200 pl-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});
StepContent.displayName = 'StepContent';

const StepDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-600 mt-1', className)} {...props}>
    {children}
  </p>
));
StepDescription.displayName = 'StepDescription';

export { Stepper, Step, StepLabel, StepContent, StepDescription };

import React from 'react';
import { cn } from '../../utils/cn';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          {
            'border-gray-200 bg-gray-50 text-gray-900': variant === 'default',
            'border-red-200 bg-red-50 text-red-900': variant === 'destructive',
            'border-yellow-200 bg-yellow-50 text-yellow-900': variant === 'warning',
            'border-green-200 bg-green-50 text-green-900': variant === 'success',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-sm [&_p]:leading-relaxed', className)}
        {...props}
      />
    );
  }
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

export function Logo({ className, ...props }) {
  const { theme } = useTheme();

  return (
    <img
      src={`/images/logo/${theme === 'dark' ? 'dark' : 'light'}.png`}
      alt="ReedAI Logo"
      className={cn('h-10 w-auto', className)}
      {...props}
    />
  );
}

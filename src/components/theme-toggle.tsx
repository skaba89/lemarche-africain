'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Changer de theme</span>
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10 transition-colors"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            <Sun
              className={`h-4 w-4 transition-all duration-300 ${
                isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0 absolute'
              }`}
            />
            <Moon
              className={`h-4 w-4 transition-all duration-300 ${
                isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <span className="sr-only">Changer de theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

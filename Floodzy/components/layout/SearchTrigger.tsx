'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    // This check runs only on the client, where navigator is available.
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <button
      onClick={onClick}
      className="hidden md:flex items-center w-full max-w-xs lg:max-w-sm mx-8 px-3 py-2 text-sm text-muted-foreground bg-transparent border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
    >
      <Search className="h-4 w-4 mr-3" />
      <span className="flex-grow text-left">Cari wilayah atau lokasi...</span>
      <kbd className="ml-auto h-6 inline-flex items-center rounded bg-muted/80 px-2 font-mono text-xs font-medium">
        {isMac ? '⌘' : 'Ctrl'}+K
      </kbd>
    </button>
  );
}

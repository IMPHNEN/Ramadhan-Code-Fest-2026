'use client';

import { Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
// import { useRouter } from 'next/navigation'; // No longer needed for navigation

export function WeatherShortcut() {
  // const router = useRouter(); // No longer needed for navigation

  // const handleClick = () => {
  //   router.push('/cuaca-sekarang');
  // };

  return (
    <Button variant="ghost" size="icon" /* onClick={handleClick} */>
      <Cloud className="h-5 w-5 text-sky-500" />
    </Button>
  );
}

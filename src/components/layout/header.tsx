import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <Leaf className="w-6 h-6" />
          <span>Impact Balance</span>
        </Link>
      </div>
    </header>
  );
}

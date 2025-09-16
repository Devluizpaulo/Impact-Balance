import LanguageSwitcher from './language-switcher';

export default function Header({ mobileNav }: { mobileNav: React.ReactNode }) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {mobileNav}
      <div className="w-full flex-1" />
      <LanguageSwitcher />
    </header>
  );
}

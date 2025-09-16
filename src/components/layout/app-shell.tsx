"use client"

import { BookText, Calculator, Globe, Map, Settings, Leaf, PanelLeft } from "lucide-react";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import Header from "./header"
import { cn } from "@/lib/utils";

const navItemsConfig = [
  { href: "/", icon: <Calculator className="h-5 w-5" />, translationKey: 'calculator' },
  { href: "/parameters", icon: <Settings className="h-5 w-5" />, translationKey: 'parameters' },
  { href: "/data-figures", icon: <Globe className="h-5 w-5" />, translationKey: 'dataFigures' },
  { href: "/country-results", icon: <Map className="h-5 w-5" />, translationKey: 'countryResults' },
  { href: "/documentation", icon: <BookText className="h-5 w-5" />, translationKey: 'documentation' },
];

function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("AppShell");

  return (
    <nav className="flex flex-col gap-2 px-4 py-6">
      {navItemsConfig.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          {item.icon}
          {t(item.translationKey as any)}
        </Link>
      ))}
    </nav>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
         <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Leaf className="h-6 w-6" />
            <span>Impact Balance</span>
          </Link>
        </div>
        <SidebarNav />
      </SheetContent>
    </Sheet>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Header");
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Leaf className="h-6 w-6" />
              <span className="font-headline">{t('title')}</span>
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header mobileNav={<MobileNav />} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

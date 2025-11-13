
"use client"

import { Calculator, Award, Lock, LogOut, PanelLeft, FilePieChart, Globe2, FileText, Settings, Archive } from "lucide-react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Header from "./header"
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  translationKey: string;
  isProtected?: boolean;
}

const mainNavItems: NavItem[] = [
  { 
    href: "/calculator", 
    icon: <Calculator className="h-5 w-5" />, 
    translationKey: 'calculator' 
  },
  { 
    href: "/event-seal", 
    icon: <Award className="h-5 w-5" />, 
    translationKey: 'eventSeal',
  },
    { 
    href: "/archived-events", 
    icon: <Archive className="h-5 w-5" />, 
    translationKey: 'archivedEvents',
    isProtected: true,
  },
  { 
    href: "/parameters", 
    icon: <Settings className="h-5 w-5" />, 
    translationKey: 'configurations',
    isProtected: true,
  },
  {
    href: "/data-figures", 
    icon: <FilePieChart className="h-5 w-5" />, 
    translationKey: 'dataFigures',
  },
  { 
    href: "/country-results", 
    icon: <Globe2 className="h-5 w-5" />, 
    translationKey: 'countryResults',
  },
  {
    href: "/scientific-review",
    icon: <FileText className="h-5 w-5" />,
    translationKey: 'scientificReview',
  },
];


function NavLink({ item, isCollapsed }: { item: NavItem, isCollapsed: boolean }) {
  const { isAdmin, promptLogin } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("AppShell");
  
  const isActive = pathname === item.href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (item.isProtected && !isAdmin) {
      e.preventDefault();
      promptLogin();
    }
  };
  
  const linkContent = (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary font-medium",
        isCollapsed && "justify-center"
      )}
    >
        {item.icon}
        <span className={cn("truncate transition-opacity", isCollapsed && "sr-only")}>
          {t(item.translationKey as string)}
        </span>
        {item.isProtected && !isAdmin && <Lock className={cn("h-4 w-4 ml-auto", isCollapsed && "hidden")} />}
    </Link>
  );

  
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{t(item.translationKey as string)}</p>
           {item.isProtected && !isAdmin && <p className="text-xs text-muted-foreground">{t('adminOnly')}</p>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent;
}


function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
  const t = useTranslations("AppShell");
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 px-2 space-y-1">
        {mainNavItems.map((item) => (
          ((item.isProtected && !isAdmin) ? null : <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />)
        ))}
      </div>
      {isAdmin && (
        <div className={cn("mt-auto", isCollapsed ? 'px-2' : 'p-4')}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full text-muted-foreground" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{t('logout')}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
              <LogOut className="h-5 w-5 mr-3" />
              {t('logout')}
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

function MobileNav() {
  const { isAdmin } = useAuth();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 max-w-xs">
         <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
             <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
           <nav className="flex flex-col h-full">
              <div className="flex-1 px-2 space-y-1">
                {mainNavItems.map((item) => (
                  (item.isProtected && !isAdmin) ? null : <NavLink key={item.href} item={item} isCollapsed={false} />
                ))}
              </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header mobileNav={<MobileNav />} />
      <div className="flex flex-1">
        <div
          className={cn(
            "hidden border-r bg-muted/40 md:block transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
        >
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center justify-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-bold">
                 <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority className={cn(isCollapsed && 'hidden')} />
                 <Image src="/logo-icon.png" alt="BMV Icon" width={32} height={32} priority className={cn(!isCollapsed && 'hidden')} />
              </Link>
            </div>
            <div className="flex-1 py-4 overflow-y-auto">
              <SidebarNav isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

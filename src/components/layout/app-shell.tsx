"use client"

import { BookText, Calculator, Map, Settings, PanelLeft, Lock, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Header from "./header"
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  translationKey: string;
  isProtected?: boolean;
  subItems?: NavItem[];
}

const navItemsConfig: NavItem[] = [
  { 
    href: "/", 
    icon: <Calculator className="h-5 w-5" />, 
    translationKey: 'calculator' 
  },
  { 
    href: "/parameters", 
    icon: <Settings className="h-5 w-5" />, 
    translationKey: 'parameters',
    isProtected: true,
  },
  {
    href: "/documentation",
    icon: <BookText className="h-5 w-5" />,
    translationKey: 'documentation',
    subItems: [
      { 
        href: "/data-figures", 
        icon: <Globe className="h-5 w-5" />, 
        translationKey: 'dataFigures' 
      },
      { 
        href: "/country-results", 
        icon: <Map className="h-5 w-5" />, 
        translationKey: 'countryResults' 
      },
    ]
  },
];

function NavLink({ item, isSubItem = false, isCollapsed }: { item: NavItem, isSubItem?: boolean, isCollapsed: boolean }) {
  const { isAdmin, promptLogin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("AppShell");
  
  const isActive = pathname === item.href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.isProtected && !isAdmin) {
      promptLogin();
    } else {
      router.push(item.href);
    }
  };

  const linkContent = (
    <a
      href={item.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && (isSubItem ? "bg-muted text-primary" : "text-primary"),
        !isSubItem && "font-medium",
        isCollapsed && "justify-center"
      )}
    >
        {item.icon}
        <span className={cn("truncate transition-opacity", isCollapsed && "opacity-0 w-0 h-0")}>
          {t(item.translationKey as any)}
        </span>
        {item.isProtected && !isAdmin && <Lock className={cn("h-4 w-4 ml-auto", isCollapsed && "hidden")} />}
    </a>
  );
  
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          {t(item.translationKey as any)}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent;
}


function SidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("AppShell");
  const { isAdmin, logout } = useAuth();

  const getAccordionTriggerClass = (item: NavItem) => {
    return cn(
        "flex items-center w-full justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline",
        item.subItems?.some(sub => pathname === sub.href) && "text-primary",
        isCollapsed ? "justify-center" : "justify-between"
    );
  }

  if (isCollapsed) {
     return (
       <nav className="flex flex-col h-full items-center">
        <div className="flex-1 space-y-2">
            {navItemsConfig.map((item) => (
              <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
        </div>
        {isAdmin && (
            <div className="mt-auto p-4">
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="w-full justify-center text-muted-foreground" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {t('logout')}
                </TooltipContent>
              </Tooltip>
            </div>
        )}
       </nav>
     )
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1">
        <Accordion type="single" collapsible className="w-full">
          {navItemsConfig.map((item) => (
            item.subItems ? (
              <AccordionItem key={item.href} value={item.href} className="border-b-0">
                <AccordionTrigger className={getAccordionTriggerClass(item)}>
                   <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{t(item.translationKey as any)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <nav className="flex flex-col gap-1">
                    {item.subItems.map((subItem) => (
                      <NavLink key={subItem.href} item={subItem} isSubItem isCollapsed={isCollapsed} />
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
            )
          ))}
        </Accordion>
      </div>
      {isAdmin && (
        <div className="mt-auto p-4">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="h-5 w-5 mr-3" />
            {t('logout')}
          </Button>
        </div>
      )}
    </nav>
  );
}

function MobileNav() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
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
          <Link href="/" className="flex items-center gap-2 font-bold">
             <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <SidebarNav isCollapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <div 
        className={cn(
          "hidden border-r bg-muted/40 md:block transition-all duration-300",
          isCollapsed ? "w-20" : "w-72"
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
             <Link href="/" className={cn("flex items-center gap-2 font-bold transition-opacity", isCollapsed ? "opacity-0" : "opacity-100")}>
               <Image src="/logo.png" alt="BMV Logo" width={120} height={41} priority />
            </Link>
          </div>
          <div className="flex-1 py-4">
            <SidebarNav isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header mobileNav={<MobileNav />} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

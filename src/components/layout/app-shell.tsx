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
import { BmvLogo } from "../icons/bmv-logo";
import { Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";

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
    isProtected: true,
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

function NavLink({ item, isSubItem = false }: { item: NavItem, isSubItem?: boolean }) {
  const { isAdmin, promptLogin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("AppShell");
  
  const isActive = isSubItem ? pathname === item.href : pathname.startsWith(item.href);

  const handleClick = (e: React.MouseEvent) => {
    if (item.isProtected && !isAdmin) {
      e.preventDefault();
      promptLogin();
    } else {
      router.push(item.href);
    }
  };

  const linkContent = (
    <>
      <div className="flex items-center gap-3">
        {item.icon}
        {t(item.translationKey as any)}
      </div>
      {item.isProtected && !isAdmin && <Lock className="h-4 w-4 ml-auto" />}
    </>
  );

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && (isSubItem ? "bg-muted text-primary" : "text-primary"),
        !isSubItem && "font-medium"
      )}
    >
      {linkContent}
    </a>
  );
}


function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("AppShell");
  const { isAdmin, logout } = useAuth();

  const defaultAccordionValue = navItemsConfig.find(item => 
    item.subItems?.some(sub => pathname.startsWith(sub.href))
  )?.href;

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1">
        <Accordion type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          {navItemsConfig.map((item) => (
            item.subItems ? (
              <AccordionItem key={item.href} value={item.href} className="border-b-0">
                <AccordionTrigger 
                  className={cn(
                    "flex items-center w-full justify-between rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline",
                    pathname.startsWith(item.href) && "text-primary"
                  )}
                >
                  <NavLink item={item} />
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <nav className="flex flex-col gap-1">
                    {item.subItems.map((subItem) => (
                      <NavLink key={subItem.href} item={subItem} isSubItem />
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <NavLink key={item.href} item={item} />
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
             <BmvLogo className="h-6 w-auto text-foreground" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <SidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
               <BmvLogo className="h-6 w-auto text-foreground" />
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
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

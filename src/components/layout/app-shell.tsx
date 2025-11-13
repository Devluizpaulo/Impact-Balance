
"use client"

import { Calculator, LayoutDashboard, LogOut, Award, Archive, Settings, FilePieChart, Globe2, FileText, PanelLeft } from "lucide-react";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Header from "./header"
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
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
];

const adminNavItems: NavItem[] = [
    { href: "/event-seal", icon: <Award className="h-5 w-5" />, translationKey: 'eventSeal' },
    { href: "/archived-events", icon: <Archive className="h-5 w-5" />, translationKey: 'archivedEvents' },
    { href: "/parameters", icon: <Settings className="h-5 w-5" />, translationKey: 'configurations' },
    { href: "/data-figures", icon: <FilePieChart className="h-5 w-5" />, translationKey: 'dataFigures' },
    { href: "/country-results", icon: <Globe2 className="h-5 w-5" />, translationKey: 'countryResults' },
    { href: "/scientific-review", icon: <FileText className="h-5 w-5" />, translationKey: 'scientificReview' },
];

function NavLink({ item }: { item: NavItem }) {
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
  
  return (
    <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
            <Link
                href={item.href}
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary font-medium",
                )}
            >
                {item.icon}
                <span className="truncate">
                    {t(item.translationKey as any)}
                </span>
            </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
            <p>{t(item.translationKey as any)}</p>
        </TooltipContent>
    </Tooltip>
  );
}

function MobileNav() {
  const { isAdmin, logout } = useAuth();
  const t = useTranslations("AppShell");
  const dashboardItem: NavItem = { 
    href: "/dashboard", 
    icon: <LayoutDashboard className="h-5 w-5" />, 
    translationKey: 'dashboard',
    isProtected: true,
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 max-w-xs">
         <div className="flex-1 overflow-y-auto py-2">
           <nav className="flex flex-col h-full">
              <div className="flex-1 px-2 space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
                {isAdmin && <NavLink item={dashboardItem} />}
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    {t('dashboard')}
                  </h2>
                  <div className="space-y-1">
                    {adminNavItems.map((item) => (
                       <NavLink key={item.href} item={item} />
                    ))}
                  </div>
                </div>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const t = useTranslations("AppShell");
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] flex-1">
            <aside className="hidden md:block border-r bg-muted/40">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link href="/dashboard" className="px-2 py-3 text-lg font-bold font-headline">{t('dashboard')}</Link>
                            {adminNavItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        pathname === item.href && "text-primary bg-muted"
                                    )}
                                >
                                    {item.icon}
                                    {t(item.translationKey as any)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                       <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('logout')}
                       </Button>
                    </div>
                </div>
            </aside>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
            </main>
        </div>
    )
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("AppShell");
  const { isAdmin, logout } = useAuth();

   const dashboardItem: NavItem = { 
    href: "/dashboard", 
    icon: <LayoutDashboard className="h-5 w-5" />, 
    translationKey: 'dashboard',
    isProtected: true,
  };

  return (
    <div className="flex flex-1">
        <aside
          className="hidden border-r bg-muted/40 md:block transition-all duration-300 w-64"
        >
          <div className="flex h-full max-h-screen flex-col">
            <nav className="flex flex-col h-full">
              <div className="flex-1 px-2 space-y-1 py-4">
                {mainNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
                {isAdmin && <NavLink item={dashboardItem} />}
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
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const dashboardPaths = [
    '/dashboard', 
    '/event-seal', 
    '/archived-events',
    '/parameters',
    '/data-figures',
    '/country-results',
    '/scientific-review'
  ];

  const isDashboardPage = dashboardPaths.includes(pathname) && isAdmin;
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header mobileNav={<MobileNav />} />
      {isDashboardPage ? (
        <AdminDashboardLayout>{children}</AdminDashboardLayout>
      ) : (
        <PublicLayout>{children}</PublicLayout>
      )}
    </div>
  );
}

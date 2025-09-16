"use client"

import { BookText, Calculator, Globe, Map, Settings, Leaf } from "lucide-react";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import Header from "./header"
import { cn } from "@/lib/utils";

function SidebarNav() {
  const pathname = usePathname()
  const t = useTranslations("AppShell")
  const { open } = useSidebar()

  const navItems = [
    { href: "/", icon: <Calculator />, label: t('calculator') },
    { href: "/parameters", icon: <Settings />, label: t('parameters') },
    { href: "/data-figures", icon: <Globe />, label: t('dataFigures') },
    { href: "/country-results", icon: <Map />, label: t('countryResults') },
    { href: "/documentation", icon: <BookText />, label: t('documentation') },
  ]

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              icon={item.icon}
              tooltip={open ? undefined : item.label}
              className="justify-start"
            >
              {item.label}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}


export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Header");
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className={cn(
          "h-16 border-b flex items-center",
          "group-data-[collapsible=icon]:h-auto",
          "group-data-[collapsible=icon]:py-2",
        )}>
           <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:justify-center">
              <Leaf className="w-6 h-6 shrink-0" />
              <span className={cn(
                "duration-200",
                "group-data-[collapsible=icon]:opacity-0",
                "group-data-[collapsible=icon]:-ml-8"
              )}>{t('title')}</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
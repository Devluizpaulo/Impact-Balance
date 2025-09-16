"use client"

import { Calculator, Settings, BookText, Globe, Map } from "lucide-react"
import { usePathname } from "@/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function HorizontalNav() {
  const pathname = usePathname()
  const t = useTranslations("AppShell")

  const navItems = [
    {
      href: "/",
      icon: Calculator,
      label: t('calculator'),
      isActive: pathname === "/"
    },
    {
      href: "/parameters",
      icon: Settings,
      label: t('parameters'),
      isActive: pathname === "/parameters"
    },
    {
      href: "/data-figures",
      icon: Globe,
      label: t('dataFigures'),
      isActive: pathname === "/data-figures"
    },
    {
      href: "/country-results",
      icon: Map,
      label: t('countryResults'),
      isActive: pathname === "/country-results"
    },
    {
      href: "/documentation",
      icon: BookText,
      label: t('documentation'),
      isActive: pathname === "/documentation"
    }
  ]

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
              item.isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Mobile navigation component
export function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations("AppShell")

  const navItems = [
    {
      href: "/",
      icon: Calculator,
      label: t('calculator'),
      isActive: pathname === "/"
    },
    {
      href: "/parameters",
      icon: Settings,
      label: t('parameters'),
      isActive: pathname === "/parameters"
    },
    {
      href: "/data-figures",
      icon: Globe,
      label: t('dataFigures'),
      isActive: pathname === "/data-figures"
    },
    {
      href: "/country-results",
      icon: Map,
      label: t('countryResults'),
      isActive: pathname === "/country-results"
    },
    {
      href: "/documentation",
      icon: BookText,
      label: t('documentation'),
      isActive: pathname === "/documentation"
    }
  ]

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-center space-x-1 px-4 py-2 bg-background/95 backdrop-blur-sm border-t">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                item.isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
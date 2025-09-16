"use client"

import Header from "./header"
import { MobileNav } from "./horizontal-nav"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}

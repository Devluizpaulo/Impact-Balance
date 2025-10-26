"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
                {t("heroTitle")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("heroSubtitle")}
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/calculator">
                    {/** Reuso de tradução existente para CTA */}
                    {"Calcular Impacto"}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <Image
                src="/hero.png"
                alt="Impact Balance Hero"
                width={640}
                height={480}
                className="rounded-lg border"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const t = useTranslations("CookieConsent");

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (consent !== "true") {
        setShowConsent(true);
      }
    } catch (error) {
      // localStorage is not available (e.g., in server-side rendering or private browsing)
      // We can choose to show the banner or not. Let's not show it to avoid errors.
      setShowConsent(false);
    }
  }, []);

  const acceptConsent = () => {
    try {
      localStorage.setItem("cookie_consent", "true");
      setShowConsent(false);
    } catch (error) {
       console.error("Could not save cookie consent to localStorage", error);
       setShowConsent(false);
    }
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-xl mx-auto shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-lg font-headline">{t("title")}</CardTitle>
              <CardDescription className="mt-2 text-sm">
                {t("description")}
              </CardDescription>
            </div>
            <Button onClick={acceptConsent} className="w-full md:w-auto flex-shrink-0">
              {t("acceptButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

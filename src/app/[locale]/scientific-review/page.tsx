
"use client";

import AppShell from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export default function ScientificReviewPage() {
  const t = useTranslations("ScientificReviewPage");
  const logosImage = PlaceHolderImages.find((img) => img.id === "review-policy-logos");

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>Licensing & Scientific Review Policy 2025</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {logosImage && (
              <div className="my-6">
                <Image
                  src={logosImage.imageUrl}
                  alt={logosImage.description}
                  width={800}
                  height={100}
                  className="mx-auto rounded-md object-contain"
                  data-ai-hint={logosImage.imageHint}
                />
              </div>
            )}
            
            <p>
              This work is licensed under a <Link href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 4.0 International License (CC-BY-SA 4.0)</Link>.
            </p>

            <h4>Suggested citation for data and graphs:</h4>
            <p>
              York University Ecological Footprint Initiative, FoDaFo & Global Footprint Network. Public Data Package of the Core Results of the National Footprint and Biocapacity Accounts, 2025 Edition. Produced for the Footprint Data Foundation and distributed by Global Footprint Network. Available online at: <Link href="https://data.footprintnetwork.org" target="_blank" rel="noopener noreferrer">https://data.footprintnetwork.org</Link>.
            </p>

            <p>
              For academics or others interested in collaborating with Global Footprint Network, or those who are interested in scientific and editorial review of applicable data and graphs, our Research team may be able to support on selected efforts, depending on internal capacity. We are actively seeking out opportunities to collaborate on exciting projects, but are currently limited in our ability to engage extensively with the academic community. Nevertheless, requests for collaboration are always welcome and assessed on a case-by-case basis.
            </p>

            <p>
              For more formal reviews, Global Footprint Network kindly reminds you that, as a nonprofit organization, we have limited capacity to provide extensive reviews or additional analysis without compensation.
            </p>

            <p>The elements of a standard scientific and editorial review include the following:</p>
            <ul>
              <li>Accuracy of the data and consistency with the National Footprint and Biocapacity Accounts edition from which the data is derived</li>
              <li>Verification of compliance with the Global Footprint Network&apos;s standards</li>
              <li>That method, method descriptions and conclusions are correct and representative of the data used</li>
            </ul>

            <p>
              Requests for scientific review and other expert consultation on the National Footprint and Biocapacity Accounts or other Ecological Footprint data will be accepted on a case-by-case basis at the discretion of Global Footprint Network.
            </p>

            <p>
              Global Footprint Network reserves the right to change this policy upon notice to you.
            </p>

            <hr />

            <p className="text-sm text-center text-muted-foreground mt-8">
              © 2025, York University, FoDaFo, Global Footprint Network. National Footprint and Biocapacity Accounts, 2025 Edition. For more information, <a href="mailto:data@footprintnetwork.org">data@footprintnetwork.org</a>
            </p>

          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

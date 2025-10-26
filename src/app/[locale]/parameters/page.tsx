

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSettings, type SystemSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Save, Loader2, Hash } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";

function DocumentationContent() {
  const t = useTranslations("DocumentationPage");
  const chartImage = PlaceHolderImages.find((img) => img.id === "hdi-footprint-chart");

  return (
    <div className="prose dark:prose-invert max-w-none">
        <h3>Impact Calculation Formulas</h3>
        <p>
            The system calculates the socio-environmental impact in Sustainability Credit Units (UCS) based on the number of participants and their duration at the event. The calculation is divided into two distinct logics: one for the event staff (calculated in days) and another for visitors (calculated in hours).
        </p>
        <h4>1. UCS Calculation for Event Staff (per day)</h4>
        <p>
            For each category of the event staff (organizers, assemblers, suppliers, etc.), the impact is calculated based on the number of people and the number of days they participate. The formula is:
        </p>
        <pre><code className="language-js">
            UCS (per category) = Math.ceil( (Quantity * Days) * Daily_UCS_Consumption_Factor )
        </code></pre>
        <ul>
            <li><strong>Quantity:</strong> Number of people in the category.</li>
            <li><strong>Days:</strong> Number of days of participation.</li>
            <li><strong>Daily_UCS_Consumption_Factor:</strong> A parameter derived from the per capita ecological footprint data (found in "Per Capita Calculation Basis"). It represents the fraction of UCS consumed by one person in one day.</li>
            <li><strong>Math.ceil():</strong> A function that rounds any fractional result up to the next whole number. This ensures that any impact, no matter how small, is counted as at least 1 UCS for that category.</li>
        </ul>

        <h4>2. UCS Calculation for Visitors (per hour)</h4>
        <p>
            For visitors, the calculation is based on person-hours and uses a specific simplified rule where every 14 person-hours of impact are converted into one Sustainability Credit Unit. The formula is:
        </p>
        <pre><code className="language-js">
            UCS (for visitors) = Math.ceil( (Visitor_Quantity * Hours) / 14 )
        </code></pre>
         <ul>
            <li><strong>Visitor_Quantity:</strong> Total number of event visitors.</li>
            <li><strong>Hours:</strong> Duration in hours that visitors stay at the event.</li>
            <li><strong>/ 14:</strong> This is the specific conversion factor. Every 14 person-hours generate a raw impact that is then rounded up. For example, 15 person-hours result in `ceil(15/14) = 2 UCS`.</li>
        </ul>

        <h4>3. Total Direct Cost</h4>
        <p>
            The total direct cost of compensation is the sum of all UCS calculated for each category, multiplied by the current quotation value of a single UCS.
        </p>
        <pre><code className="language-js">
            Total_Direct_Cost = (Sum of all UCS) * UCS_Quotation_Value
        </code></pre>

        <Separator className="my-8" />
        
        <h3>Biocapacity and Footprint Categories</h3>
        <ul>
          <li><strong>Cropland:</strong> Cropland is the most bioproductive of all the land-use types and consists of areas used to produce food and fiber for human consumption, feed for livestock, oil crops, and rubber. Due to lack of globally consistent data sets, current cropland Footprint calculations do not yet take into account the extent to which farming techniques or unsustainable agricultural practices may cause long-term degradation of soil. The cropland Footprint includes crop products allocated to livestock and aquaculture feed mixes, and those used for fibers and materials.</li>
          <li><strong>Forest Land:</strong> Forests provide for two types of human demand. The forest product Footprint, which is calculated based on the amount of lumber, pulp, timber products, and fuel wood consumed by a country on a yearly basis. It also accommodates the Carbon Footprint.</li>
          <li><strong>Carbon Footprint:</strong> This component of the Ecological Footprint represents the carbon dioxide emissions from burning fossil fuels and cement production. The Carbon Footprint represents the area necessary to sequester these carbon emissions. The carbon Footprint component of the Ecological Footprint is calculated as the amount of forest land needed to absorb these carbon dioxide emissions for good. Currently, the carbon Footprint is the largest portion of humanity’s Footprint. The Carbon Footprint of consumption also includes embodied carbon in imported goods.</li>
          <li><strong>Fishing grounds:</strong> The fishing grounds Footprint is calculated based on estimates of the maximum sustainable catch for a variety of fish species. These sustainable catch estimates are converted into an equivalent mass of primary production based on the various species’ trophic levels. This estimate of maximum harvestable primary production is then divided amongst the continental shelf areas of the world. Fish caught and used in aquaculture feed mixes are included.</li>
          <li><strong>Grazing land:</strong> Grazing land is used to raise livestock for meat, dairy, hide, and wool products. The grazing land Footprint is calculated by comparing the amount of livestock feed available in a country with the amount of feed required for all livestock in that year, with the remainder of feed demand assumed to come from grazing land.</li>
          <li><strong>Built-up land:</strong> The built-up land Footprint is calculated based on the area of land covered by human infrastructure — transportation, housing, industrial structures, and reservoirs for hydropower. In absence of better evidence, we typically assume that built-up land occupies what would previously have been cropland.</li>
        </ul>

        <h3>What is a global hectare (gha)?</h3>
        <p>
          A global hectare is a biologically productive hectare with world average productivity. Because each unit of space harbours a different portion of the global regenerative capacity, each unit is counted proportional to its global biocapacity share. For this reason, hectares are adjusted proportionally to their productivity and are expressed in global hectares.
        </p>

        <h3>Measuring Sustainable Development with HDI and Footprint Assessments</h3>
        
        {chartImage && (
          <div className="my-6">
            <Image
              src={chartImage.imageUrl}
              alt={chartImage.description}
              width={800}
              height={600}
              className="mx-auto rounded-md"
              data-ai-hint={chartImage.imageHint}
            />
          </div>
        )}

        <p>
          The essence of sustainable development can be measured by tracking its two core dimensions: 1) economic and social development and 2) environmental sustainability. For details, consult{" "}
          <Link href="https://www.footprintnetwork.org/our-work/sustainable-development/" target="_blank" rel="noopener noreferrer">https://www.footprintnetwork.org/our-work/sustainable-development/</Link>.
        </p>
        <p>
          Economic and social development, or human well-being, can be approximated with UNDP’s widely recognized Human Development Index (HDI). UNDP considers an HDI of more than 0.7 to be “high human development.” Environmental sustainability, or living within the means of nature, can be evaluated with the Ecological Footprint. The HDI-Footprint graph above shows how a population&apos;s HDI compares to its resource demand. The graph illustrates the challenge of creating a globally-reproducible high level of human well-being without overtaxing the planet’s ecological resource base.
        </p>
        <p>
          Note that the comparison against global average biocapacity provides a global overview. This approach can be further extended by comparing Footprints also against local biocapacity. For most countries, local availability of biocapacity (and the financial means to access biocapacity from elsewhere) is a more significant determinant of resource access than the global average.
        </p>

        <Separator className="my-8" />

        <h3>Appendix: Background on Ecological Footprint</h3>
        <p>Simple introductions to Footprint accounting:</p>
        <ul>
          <li><Link href="https://www.footprintnetwork.org/our-work/ecological-footprint/" target="_blank" rel="noopener noreferrer">https://www.footprintnetwork.org/our-work/ecological-footprint/</Link></li>
          <li><Link href="https://www.footprintnetwork.org/what-ecological-footprints-measure/" target="_blank" rel="noopener noreferrer">https://www.footprintnetwork.org/what-ecological-footprints-measure/</Link></li>
          <li><Link href="https://www.footprintnetwork.org/what-biocapacity-measures/" target="_blank" rel="noopener noreferrer">https://www.footprintnetwork.org/what-biocapacity-measures/</Link></li>
          <li><Link href="https://www.footprintnetwork.org/resources/data/" target="_blank" rel="noopener noreferrer">https://www.footprintnetwork.org/resources/data/</Link></li>
        </ul>
        
        <p>Methodology Papers on the National Footprint and Biocapacity Accounts:</p>
        <ul>
            <li>Lin et al. (2018) Ecological Footprint Accounting for Countries: Updates and Results of the National Footprint Accounts, 2012–2018, Resources, 7(3), 58.</li>
            <li>Borucke et al. (2013) Accounting for demand and supply of the Biosphere’s regenerative capacity: the National Footprint Accounts’ underlying methodology and framework. Ecological Indicators, 24, 518-533.</li>
        </ul>

        <p>A more thorough introduction to the Footprint concept:</p>
        <ul>
            <li>Wackernagel, M.; Lin, D.; Evans, M.; Hanscom, L.; Raven, P. Defying the Footprint Oracle: Implications of Country Resource Trends. Sustainability 2019, 11, 2164.</li>
            <li>Wackernagel, M., Hanscom, L., Jayasinghe, P., Lin, D., Murthy, A., Neill, E., Raven, P., 2021. The importance of resource security for poverty eradication. Nature Sustainability. Volume 4, pages731–738. https://doi.org/10.1038/s41893-021-00708-4. Plus supplementary information for information on the methodology.</li>
            <li>Release notes, 2025 edition</li>
        </ul>

        <p>A list of academic literature on the Ecological Footprint:</p>
        <p><Link href="http://www.footprintnetwork.org/resources/journal-articles/" target="_blank" rel="noopener noreferrer">www.footprintnetwork.org/resources/journal-articles/</Link></p>

        <p>Ecological Footprint Reviews by national governments:</p>
        <p><Link href="http://www.footprintnetwork.org/reviews" target="_blank" rel="noopener noreferrer">www.footprintnetwork.org/reviews</Link></p>
        
        <p>Frequently asked questions:</p>
        <p><Link href="http://www.footprintnetwork.org/faq" target="_blank" rel="noopener noreferrer">www.footprintnetwork.org/faq</Link></p>

        <p>Limitations and Criticisms:</p>
        <p><Link href="http://www.footprintnetwork.org/our-work/ecological-footprint/limitations-and-criticisms/" target="_blank" rel="noopener noreferrer">www.footprintnetwork.org/our-work/ecological-footprint/limitations-and-criticisms/</Link></p>
    </div>
  )
}

const ParameterInput = ({ name, value, onChange, disabled, adornment, readOnly = false, precision }: { name: string, value: string | number | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean, adornment: React.ReactNode, readOnly?: boolean, precision?: number }) => {
    
    const formatNumber = (num: number, fracDigits: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: fracDigits,
            maximumFractionDigits: fracDigits,
        }).format(num);
    }

    const displayValue = (typeof value === 'number' && precision !== undefined) 
        ? formatNumber(value, precision) 
        : (value ?? '');


    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-muted-foreground sm:text-sm">{adornment}</span>
            </div>
            <Input
                type="text" // Use text to allow for formatted values
                name={name}
                value={displayValue}
                onChange={onChange}
                className="text-right pl-8"
                disabled={disabled}
                readOnly={readOnly}
            />
        </div>
    );
};


export default function ParametersPage() {
  const t = useTranslations("ParametersPage");
  const t_calc = useTranslations("ImpactCalculator");
  const t_docs = useTranslations("DocumentationPage");
  const { settings, setSettings, saveSettings, resetSettings, isLoading, isSaving } = useSettings();
  const { isAdmin } = useAuth();

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: rawValue } = e.target;
    const keys = name.split('.');
    
    // Allow direct string update for non-calculation fields
    if (keys[0] !== 'calculation') {
        const newSettings = JSON.parse(JSON.stringify(settings));
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = rawValue;
        setSettings(newSettings);
        return;
    }


    // Clean the value for parsing: remove thousand separators, replace comma with dot
    const cleanedValue = rawValue.replace(/\./g, '').replace(',', '.');
    const parsedValue = parseFloat(cleanedValue);

    // If parsing fails, don't update state to avoid NaN
    if (isNaN(parsedValue) && cleanedValue.trim() !== '') {
        return;
    }
    
    const finalValue = isNaN(parsedValue) ? 0 : parsedValue;

    // Create a deep copy to avoid direct state mutation
    const newSettings = JSON.parse(JSON.stringify(settings));

    let current = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = finalValue;

    // Use the callback from useSettings to trigger recalculation
    setSettings(newSettings);
  };
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={resetSettings} variant="outline" disabled={isSaving}>
                  <RefreshCcw /> {t('resetButton')}
                </Button>
                <Button onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />} {t('saveButton')}
                </Button>
              </div>
            )}
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('perCapitaBasis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow>
                      <TableCell>{t('perCapitaFactors.averageUcsPerHectare')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.averageUcsPerHectare" value={settings.calculation.perCapitaFactors.averageUcsPerHectare} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} precision={0}/>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('perCapitaFactors.perCapitaConsumptionHa')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.perCapitaConsumptionHa" value={settings.calculation.perCapitaFactors.perCapitaConsumptionHa} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} precision={3} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('perCapitaFactors.ucsConsumption73years')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.ucsConsumption73years" value={settings.calculation.perCapitaFactors.ucsConsumption73years} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} readOnly={true} precision={0} />
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>{t('perCapitaFactors.annualUcsConsumption')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.annualUcsConsumption" value={settings.calculation.perCapitaFactors.annualUcsConsumption} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} readOnly={true} precision={0} />
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>{t('perCapitaFactors.dailyUcsConsumption')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.dailyUcsConsumption" value={settings.calculation.perCapitaFactors.dailyUcsConsumption} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} readOnly={true} precision={3} />
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>{t('perCapitaFactors.hourlyUcsConsumption')}</TableCell>
                      <TableCell>
                         <ParameterInput name="calculation.perCapitaFactors.hourlyUcsConsumption" value={settings.calculation.perCapitaFactors.hourlyUcsConsumption} onChange={handleNestedChange} disabled={!isAdmin} adornment={<Hash className="w-4 h-4"/>} readOnly={true} precision={3} />
                      </TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('equivalencesAndCosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow>
                      <TableCell>
                          <div>{t('equivalences.ucsQuotationValue')}</div>
                          {settings.calculation.equivalences.ucsQuotationDate && (
                            <div className="text-xs text-muted-foreground">{t('equivalences.quotationDate')}: {settings.calculation.equivalences.ucsQuotationDate}</div>
                          )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <ParameterInput 
                            name="calculation.equivalences.ucsQuotationValue" 
                            value={settings.calculation.equivalences.ucsQuotationValue} 
                            onChange={handleNestedChange} 
                            disabled={!isAdmin} 
                            readOnly={true} 
                            adornment={'R$'} 
                            precision={2} 
                          />
                          {settings.calculation.equivalences.ucsQuotationDate && (
                            <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs text-muted-foreground">
                              {t('equivalences.quotationDate')}: {settings.calculation.equivalences.ucsQuotationDate}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('equivalences.gdpPerCapita')}</TableCell>
                      <TableCell>
                        <ParameterInput name="calculation.equivalences.gdpPerCapita" value={settings.calculation.equivalences.gdpPerCapita} onChange={handleNestedChange} disabled={!isAdmin} adornment={'R$'} precision={2} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('equivalences.equivalenceValuePerYear')}</TableCell>
                      <TableCell>
                        <ParameterInput name="calculation.equivalences.equivalenceValuePerYear" value={settings.calculation.equivalences.equivalenceValuePerYear} onChange={handleNestedChange} disabled={!isAdmin} adornment={'R$'} readOnly={true} precision={2} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t('equivalences.gdpPercentage')}</TableCell>
                      <TableCell>
                        <ParameterInput name="calculation.equivalences.gdpPercentage" value={settings.calculation.equivalences.gdpPercentage} onChange={handleNestedChange} disabled={!isAdmin} adornment={'%'} readOnly={true} precision={3} />
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>{t('equivalences.equivalenceValuePerDay')}</TableCell>
                      <TableCell>
                        <ParameterInput name="calculation.equivalences.equivalenceValuePerDay" value={settings.calculation.equivalences.equivalenceValuePerDay} onChange={handleNestedChange} disabled={!isAdmin} adornment={'R$'} readOnly={true} precision={2} />
                      </TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>{t('equivalences.equivalenceValuePerHour')}</TableCell>
                      <TableCell>
                        <ParameterInput name="calculation.equivalences.equivalenceValuePerHour" value={settings.calculation.equivalences.equivalenceValuePerHour} onChange={handleNestedChange} disabled={!isAdmin} adornment={'R$'} readOnly={true} precision={2} />
                      </TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t_calc('indirectCosts.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {Object.entries(settings.calculation.indirectCosts).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{t_calc(`indirectCosts.${key}` as any)}</TableCell>
                      <TableCell>
                         <ParameterInput 
                          name={`calculation.indirectCosts.${key}`} 
                          value={value as number} 
                          onChange={handleNestedChange} 
                          disabled={!isAdmin} 
                          adornment={key === 'ownershipRegistration' ? '%' : 'R$'} 
                          precision={key === 'ownershipRegistration' ? 1 : 2}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>{t('benefitFactors.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>{t('table.parameter')}</TableHead><TableHead className="w-48 text-right">{t('table.value')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {Object.entries(settings.calculation.benefits).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{t(`benefitFactors.${key}` as any)}</TableCell>
                      <TableCell>
                         <ParameterInput 
                          name={`calculation.benefits.${key}`} 
                          value={value as number} 
                          onChange={handleNestedChange} 
                          disabled={!isAdmin} 
                          adornment={"/ UCS"}
                          precision={2}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>

         <Accordion type="single" collapsible className="w-full mt-8">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                  <h2 className="text-xl font-bold font-headline">{t_docs('title')}</h2>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Footprint and Biocapacity Accounting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentationContent />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

      </div>
    </AppShell>
  );
}

    

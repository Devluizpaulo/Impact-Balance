import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary mt-12">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-6 text-center text-secondary-foreground">
        <p>&copy; {year} {t('copyright')}</p>
        <Link href="/parameters" className="mt-2 text-sm text-muted-foreground hover:text-primary underline">
          {t('parametersLink')}
        </Link>
      </div>
    </footer>
  );
}

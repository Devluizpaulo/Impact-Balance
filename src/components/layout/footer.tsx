import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-secondary-foreground">
        <p>&copy; {year} {t('copyright')}</p>
      </div>
    </footer>
  );
}


import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';
import {locales} from './config';

export const pathnames = {
  '/': '/',
  '/calculator': '/calculator',
  '/parameters': '/parameters',
  '/data-figures': '/data-figures',
  '/country-results': '/country-results',
  '/scientific-review': '/scientific-review',
  '/event-seal': '/event-seal',
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames,
  });

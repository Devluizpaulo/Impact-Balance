import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';
import {locales} from './config';

export const pathnames = {
  '/': '/',
  '/parameters': '/parameters',
  '/equivalence-calculator': '/equivalence-calculator',
  '/data-figures': '/data-figures',
  '/country-results': '/country-results',
  '/documentation': '/documentation',
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames,
  });

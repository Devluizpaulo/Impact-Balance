import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';
import {locales} from './config';

export const pathnames = {
  '/': '/',
  '/parameters': '/parameters',
  '/documentation': '/documentation',
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames,
  });

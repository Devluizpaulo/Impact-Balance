import * as React from "react";

export const BrazilFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
    <rect width="9" height="6" fill="#009B3A"/>
    <path d="M4.5 1L2 3L4.5 5L7 3Z" fill="#FFCC29"/>
    <circle cx="4.5" cy="3" r="1.1" fill="#002776"/>
  </svg>
);

export const UsaFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
    <rect width="9" height="6" fill="#BF0A30"/>
    <path fill="#fff" d="M0 1h9v1H0zm0 2h9v1H0z"/>
    <rect width="4" height="3" fill="#002868"/>
  </svg>
);

export const SpainFlag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" {...props}>
    <rect width="9" height="6" fill="#C60B1E"/>
    <rect y="1.5" width="9" height="3" fill="#FFC400"/>
  </svg>
);

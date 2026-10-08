/**
 * Brand copy from the committee's brand guidelines. The name follows the primary logo
 * ("Shree Dharmic Leela Committee (Regd.) Delhi").
 */
export const BRAND = {
  name: "Shree Dharmic Leela Committee",
  short: "Shree Dharmic Leela",
  place: "(Regd.) Delhi",
  blessing: "With the blessings of Shri Lala Bansidhar Gupta Ji",
  line: "Tradition that brings generations together.",
  logo: "/assets/brand/logo-primary.webp",
  heritageLogo: "/assets/brand/logo-heritage.webp",
} as const;

/** Membership sign-ups are paused: hides every "Apply Membership" link and sends /membership to the home page. Set to true to reopen. */
export const MEMBERSHIP_OPEN = true;

export default function getCountryIsoCode(locale: string) {
  return locale === "en" ? "us" : locale;
}

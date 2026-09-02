import { useTranslation } from "../i18n";

export function Title() {
  const { t } = useTranslation();

  return (
    <header>
      <h1>{t.header.title}</h1>
    </header>
  );
}

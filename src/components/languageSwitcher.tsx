import { TbWorld } from "react-icons/tb";
import "../stylesheets/languageSwitcher.scss";
import { LANGUAGES, LANGUAGE_NAMES, isLanguage, useTranslation } from "../i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="language-switcher">
      <TbWorld className="language-switcher__icon" aria-hidden="true" />
      <select
        aria-label={t.language.label}
        value={language}
        onChange={(event) => {
          if (isLanguage(event.target.value)) setLanguage(event.target.value);
        }}
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
}

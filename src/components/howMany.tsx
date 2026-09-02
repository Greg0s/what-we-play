import { useTranslation } from "../i18n";

export function HowMany() {
  const { t, playersLabel } = useTranslation();

  return (
    <header>
      <input
        type="number"
        min={1}
        defaultValue={1}
        aria-label={t.header.playerCount}
        style={{ width: 40 }}
      />{" "}
      {playersLabel(1)}
    </header>
  );
}

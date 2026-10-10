import { useTranslation } from "../i18n";
import { useRelief } from "../relief";
import "../stylesheets/glasses.scss";

/**
 * The 2D/3D switch: a pair of cardboard 3D glasses, empty lenses in 2D, a red
 * and a cyan one in 3D. A drawn control like the TV, not an icon: the lenses'
 * colours are its state.
 */
export function GlassesSwitch() {
  const { t } = useTranslation();
  const { mode, switchCount, toggle } = useRelief();
  const on = mode === "3d";
  const bounce = switchCount ? (switchCount % 2 ? " fx-a" : " fx-b") : "";

  return (
    <button
      type="button"
      className={`sw-specs${on ? " is-3d" : ""}${bounce}`}
      aria-pressed={on}
      aria-label={on ? t.relief.to2d : t.relief.to3d}
      onClick={toggle}
    >
      <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden="true">
        <path className="sw-arm" d="M3 8 1.2 3.4M29 8l1.8-4.6" />
        <path
          className="sw-fr"
          d="M2 6.6h28v8.6a2.3 2.3 0 0 1-2.3 2.3h-7.5l-2-3a2.6 2.6 0 0 0-4.4 0l-2 3H4.3A2.3 2.3 0 0 1 2 15.2z"
        />
        <rect className="sw-ln l" x="4.8" y="8.9" width="8.2" height="5.8" rx="1.6" />
        <rect className="sw-ln r" x="19" y="8.9" width="8.2" height="5.8" rx="1.6" />
      </svg>
      <span className="sw-tag" aria-hidden="true">
        3D
      </span>
    </button>
  );
}

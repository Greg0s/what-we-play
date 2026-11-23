import { FaArrowUpFromBracket, FaRegSquarePlus, FaXmark } from "react-icons/fa6";
import "../stylesheets/install.scss";
import logo from "../../what-we-play.png";
import { useTranslation } from "../i18n";
import { useInstallPrompt } from "../install";

/**
 * A small card in a corner (above « Pick for us » on phones) inviting likely
 * regulars to install the app. It never takes focus and blocks nothing; when
 * and to whom it shows is decided by `useInstallPrompt`.
 */
export function InstallPrompt() {
  const { t } = useTranslation();
  const { offer, accept, later } = useInstallPrompt();
  if (!offer) return null;

  return (
    <aside className={`install install--${offer}`} aria-labelledby="install-title">
      <img className="install__logo" src={logo} alt="" width="44" height="44" />
      <div className="install__text">
        <p id="install-title" className="install__title">
          {t.install.title}
        </p>
        {offer === "native" ? (
          <p>{t.install.native}</p>
        ) : (
          <p>
            {t.install.ios.before}
            <strong className="install__step">
              <FaArrowUpFromBracket aria-hidden="true" />
              {t.install.ios.share}
            </strong>
            {t.install.ios.middle}
            <strong className="install__step">
              <FaRegSquarePlus aria-hidden="true" />
              {t.install.ios.add}
            </strong>
            {t.install.ios.after}
          </p>
        )}
        {offer === "native" && (
          <div className="install__actions">
            <button
              type="button"
              className="install__later"
              onClick={later}
              data-umami-event="Install prompt"
              data-umami-event-step="later"
              data-umami-event-platform="native"
            >
              {t.install.later}
            </button>
            <button
              type="button"
              className="install__accept"
              onClick={accept}
              data-umami-event="Install prompt"
              data-umami-event-step="accept"
              data-umami-event-platform="native"
            >
              {t.install.accept}
            </button>
          </div>
        )}
      </div>
      {offer === "ios" && (
        <button
          type="button"
          className="install__close"
          onClick={later}
          aria-label={t.install.close}
          data-umami-event="Install prompt"
          data-umami-event-step="later"
          data-umami-event-platform="ios"
        >
          <FaXmark aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}

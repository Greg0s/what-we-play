import "../stylesheets/playerCountNav.scss";
import { PLAYER_COUNT_PAGES, buildPath } from "../routes";
import { useTranslation } from "../i18n";

type PlayerCountNavProps = {
  players: number;
  isHome: boolean;
  /** Lets the app navigate in place; the links stay real links regardless. */
  onNavigate: (players: number) => void;
};

export function PlayerCountNav({
  players,
  isHome,
  onNavigate,
}: PlayerCountNavProps) {
  const { language, t } = useTranslation();

  return (
    <nav className="player-count-nav" aria-label={t.header.byPlayerCount}>
      {PLAYER_COUNT_PAGES.map((count) => {
        const current = !isHome && count === players;

        return (
          <a
            key={count}
            href={buildPath({ language, players: count, isHome: false })}
            aria-current={current ? "page" : undefined}
            className={current ? "player-count-nav__link is-current" : "player-count-nav__link"}
            onClick={(event) => {
              // Plain navigation stays the fallback: modified clicks, and any
              // visitor without JavaScript, follow the href to a real page.
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              if (event.button !== 0) return;
              event.preventDefault();
              onNavigate(count);
            }}
          >
            {count}
          </a>
        );
      })}
    </nav>
  );
}

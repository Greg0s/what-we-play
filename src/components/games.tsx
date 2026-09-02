import { Game } from "./game";
import { gamesForPlayerCount } from "../games";
import "../App.scss";
import "../stylesheets/games.scss";
import { useTranslation } from "../i18n";

export function Games({ players }: { players: number }) {
  const { gameDescription } = useTranslation();

  return (
    <div className="grid">
      {gamesForPlayerCount(players).map((game) => (
        <Game
          key={game.id}
          name={game.name}
          description={gameDescription(game.id)}
          playLink={game.link}
        />
      ))}
    </div>
  );
}

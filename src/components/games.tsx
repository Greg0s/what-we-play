import { Game } from "./game";
import gamesData from "../games.json";
import "../App.scss";
import "../stylesheets/games.scss";
import { useTranslation } from "../i18n";

export function Games({ players }: { players: number }) {
  const { gameDescription } = useTranslation();

  return (
    <div className="grid">
      {gamesData
        .filter(
          (game) =>
            (players >= game.minPlayers && players <= game.maxPlayers) ||
            game.maxPlayers === -1
        )
        .map((game) => (
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

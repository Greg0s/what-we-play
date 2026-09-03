import { BsArrowUpLeft } from "react-icons/bs";

type GameProps = {
  name: string;
  description: string;
  playLink: string;
  playerRange: string;
};

function getFaviconUrl(link: string) {
  const { hostname } = new URL(link);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function Game({ name, description, playLink, playerRange }: GameProps) {
  return (
    <a target="_blank" rel="noopener" href={playLink} className="game">
      <img
        className="game__favicon"
        src={getFaviconUrl(playLink)}
        alt=""
        loading="lazy"
      />
      <h2>{name}</h2>
      <p>{description}</p>
      <p className="game__players">{playerRange}</p>
      <BsArrowUpLeft className="game__icon" />
    </a>
  );
}

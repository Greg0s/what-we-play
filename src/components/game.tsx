import { BsArrowUpLeft } from "react-icons/bs";

type GameProps = {
  name: string;
  description: string;
  playLink: string;
};

function getFaviconUrl(link: string) {
  const { hostname } = new URL(link);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function Game({ name, description, playLink }: GameProps) {
  return (
    <a target="_blank" href={playLink} className="game">
      <img
        className="game__favicon"
        src={getFaviconUrl(playLink)}
        alt=""
        loading="lazy"
      />
      <h2>{name}</h2>
      <p>{description}</p>
      <BsArrowUpLeft className="game__icon" />
    </a>
  );
}

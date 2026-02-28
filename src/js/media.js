export const PLACEHOLDER_IMG =
  "placeholder/198-1986030_pixalry-star-wars-icons-star-wars-ilustraciones.png";

export function getImage(type, id) {
  const base =
    "https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img";

  return {
    people: `${base}/characters/${id}.jpg`,
    planets: `${base}/planets/${id}.jpg`,
    starships: `${base}/starships/${id}.jpg`,
    films: `${base}/films/${id}.jpg`,
  }[type];
}
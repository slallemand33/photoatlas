export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(5)}°${latDir}  ${Math.abs(lon).toFixed(5)}°${lonDir}`;
}

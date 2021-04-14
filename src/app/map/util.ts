// top left is 0 | 0, bottom right is (mapSize / 100) | (mapSize / 100)
export function armaCoordsToString(lat: number, long: number, mapSize: number, maxBounds: number): string
{
  const max = (mapSize / 100);
  let x = Math.floor(long / maxBounds * max);
  let y = Math.floor(-lat / maxBounds * max);
  if (x < 0 || y < 0 || x > max || y > max)
  {
    x = 0; y = 0;
  }
  return x.toString().padStart(3, '0') + ' | ' + y.toString().padStart(3, '0');
}

export function armaCoordsToMap(x: number, y: number, mapSize: number, maxBounds: number): [number, number]
{
  const xScale = x / mapSize;
  const yScale = y / mapSize;
  return [yScale * maxBounds - maxBounds, (xScale * maxBounds)];
}

// bottom left is [0, 0], top right is [mapSize, mapSize]
export function mapToArmaCoords(lat: number, long: number, mapSize: number, maxBounds: number): [number, number]
{
  const xScale = long / maxBounds;
  const yScale = lat / maxBounds;
  return [xScale * mapSize, (yScale * mapSize) + mapSize];
}

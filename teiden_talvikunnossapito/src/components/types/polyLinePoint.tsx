import { LatLngExpression } from "leaflet";

export interface PolyLinePoint {
  timestamp: string,
  events: string[],
  coords: LatLngExpression[]
}
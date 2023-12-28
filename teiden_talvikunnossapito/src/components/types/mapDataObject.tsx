import { LatLngExpression } from "leaflet";

export interface MapDataObject {
  id: string,
  coordinates: LatLngExpression[],
  time: EpochTimeStamp,
  workType: "auraus" | "liukkauden torjunta"[]
}
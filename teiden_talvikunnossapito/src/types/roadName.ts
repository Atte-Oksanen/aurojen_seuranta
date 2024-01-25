import { LatLngTuple } from "leaflet";

export interface roadObject {
    roadName: string,
    timeStamp: Date,
    id: string,
    coords: LatLngTuple
}
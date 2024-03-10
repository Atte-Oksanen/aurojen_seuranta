import { LatLngTuple } from "leaflet";

export interface roadObject {
  roadName: string,
  timeStamp: Date,
  id: string,
  coords: LatLngTuple
}

export interface FeatureCollection {
  type: 'FeatureCollection',
  features: Feature[]
}

export interface Feature {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: LatLngTuple[]
  },
  properties: {
    time: number,
    roadName: string
  }

}
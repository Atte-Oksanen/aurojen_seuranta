interface LocationObject {
  coords: number[]
  events: string[]
  timestamp: string
}

export interface MapDataObject {
  id: string,
  last_location: LocationObject,
  location_history: LocationObject[]
}
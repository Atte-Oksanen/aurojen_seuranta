import { MapContainer, TileLayer, Polyline } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from "react"
import plowService from '../services/plowActivity'
import { randomizeColor } from "../utils/randomizeColor"
import { MapDataObject } from "./types/mapDataObject"

const MapComponent = () => {
  const mapRef = useRef(null)
  const lat = 60.193084
  const lon = 24.940338
  const [coords, setCoords] = useState()

  useEffect(() => {
    const primeData = async () => {
      const mapData: MapDataObject[] = await plowService.getPlowData()
      console.log(mapData)
      const localCoords = mapData.map(element => {
        const locationHistory = element.location_history

        return { id: element.id, locationHistory: locationHistory }
      })
      setCoords(localCoords)
    }
    primeData()
  }, [])

  return (
    <div>
      <MapContainer center={[lat, lon]} zoom={12} ref={mapRef} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords && coords.map(coordElement => <Polyline key={coordElement.id} positions={coordElement.locationHistory.map(historyElement => historyElement.coords.toReversed())} color={randomizeColor()} />)}
      </MapContainer>
    </div>
  )
}

export default MapComponent
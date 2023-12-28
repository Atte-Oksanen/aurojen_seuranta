import { MapContainer, TileLayer, Polyline } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from "react"
import plowService from '../services/plowActivity'
import { getColorFromTime } from "../utils/colorUtils"
import { MapDataObject } from "./types/mapDataObject"

const MapComponent = () => {
  const mapRef = useRef(null)
  const lat = 60.20308
  const lon = 24.73824
  const [coords, setCoords] = useState<MapDataObject[]>()

  useEffect(() => {
    const primeData = async () => {
      setCoords(await plowService.getPlowData())
    }
    primeData()
  }, [])
  return (
    <div>
      <MapContainer center={[lat, lon]} zoom={12} ref={mapRef} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords && coords.map(coordElement => <Polyline key={coordElement.id} positions={coordElement.coordinates} color={getColorFromTime(coordElement.time)} />)}
      </MapContainer>
    </div>
  )
}

export default MapComponent
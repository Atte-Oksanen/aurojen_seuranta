import { MapContainer, TileLayer, Polyline, GeoJSON } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from "react"
import plowService from '../services/plowActivity'
import { getColorFromTime, randomizeColor } from "../utils/randomizeColor"
import { MapDataObject } from "./types/mapDataObject"

const MapComponent = () => {
  const mapRef = useRef(null)
  const lat = 60.193084
  const lon = 24.940338
  const [coords, setCoords] = useState()

  useEffect(() => {
    const primeData = async () => {
      console.log('start priming')
      const mapData: MapDataObject[] = await plowService.getPlowData()
      setCoords(mapData)
      console.log('set')
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
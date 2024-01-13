import { MapContainer, TileLayer, LayerGroup, GeoJSON } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from "react"
import plowService from '../services/plowActivity'
import { getColorFromTime } from "../utils/colorUtils"
import { GeoJsonObject } from "geojson"

const MapComponent = () => {
  const mapRef = useRef(null)
  const lat = 60.15976
  const lon = 24.72423
  const [coords, setCoords] = useState<GeoJsonObject>()
  const [timestamp, setTimestamp] = useState()

  useEffect(() => {
    const primeData = async () => {
      const plowData = await plowService.getPlowData() 
      setCoords(plowData.geoJson)
      setTimestamp(plowData.timestamp)
    }
    primeData()
  }, [])
  console.log(coords)
  return (
    <div>
      <h2>{new Date(timestamp).toString()}</h2>
      <MapContainer center={[lat, lon]} zoom={12.5} ref={mapRef} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          url="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        <LayerGroup>
          {coords && <GeoJSON data={coords} style={(feature) => {
            return { color: getColorFromTime(feature?.properties.time) }
          }} />}
        </LayerGroup>
      </MapContainer>
    </div>
  )
}

export default MapComponent
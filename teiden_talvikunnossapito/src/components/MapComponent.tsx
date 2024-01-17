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
  const [timestamp, setTimestamp] = useState<Date>()

  useEffect(() => {
    const primeData = async () => {
      const plowData = await plowService.getPlowData()
      setCoords(plowData.geoJson)
      setTimestamp(new Date(plowData.timestamp))
    }
    primeData()
  }, [])


  return (
    <div>
      {!timestamp && <div>Ladataan reittejä</div>}
      {timestamp && <div>Reitit noudettu viimeksi {`${timestamp.toLocaleDateString('fi-FI')} kello ${timestamp.getHours()}.${timestamp.getMinutes()}`}</div>}
      <MapContainer center={[lat, lon]} zoom={12.5} ref={mapRef} style={{ height: '85vh', width: '95vw' }}>
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
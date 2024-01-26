import { MapContainer, TileLayer, LayerGroup, GeoJSON } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from "react"
import { getColorFromTime } from "../utils/colorUtils"
import { GeoJsonObject } from "geojson"
import { LatLngExpression, Map } from "leaflet"




const MapComponent = ({ coords, timestamp, mapCenter }: { coords: GeoJsonObject | undefined, timestamp: Date | undefined, mapCenter: LatLngExpression }) => {
  const mapRef = useRef<Map>(null)

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(mapCenter, 16)
    }
  }, [mapCenter])

  if (!coords || !timestamp) {
    return (
      null
    )
  }


  return (
    <div>
      <MapContainer center={mapCenter} zoom={12.5} ref={mapRef} style={{ width: '100vw', height: '100vh', zIndex: 1 }}>
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
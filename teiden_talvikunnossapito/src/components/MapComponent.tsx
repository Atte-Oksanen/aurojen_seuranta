import { MapContainer, TileLayer, LayerGroup, GeoJSON } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import { useRef } from "react"
import { getColorFromTime } from "../utils/colorUtils"
import { GeoJsonObject } from "geojson"


const MapComponent = ({ coords, timestamp }: { coords: GeoJsonObject, timestamp: Date }) => {
  const mapRef = useRef(null)
  const lat = 60.15976
  const lon = 24.72423

  // if (!coords || !timestamp) {
  //   return (
  //     <div>Ladataan reittejä</div>
  //   )
  // }

  return (
    <div>
      {/* {timestamp && <div>Reitit noudettu viimeksi {`${timestamp.toLocaleDateString('fi-FI')} kello ${timestamp.getHours()}.${timestamp.getMinutes()}`}</div>} */}
      {<div>Reitit noudettu viimeksi 11.1.2024 kello 15.37</div>}
      <MapContainer center={[lat, lon]} zoom={12.5} ref={mapRef} style={{ width: '100vw', height: '100vh', zIndex: 1 }}>
        <TileLayer
          url="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
        {/* <LayerGroup>
          {coords && <GeoJSON data={coords} style={(feature) => {
            return { color: getColorFromTime(feature?.properties.time) }
          }} />}
        </LayerGroup> */}
      </MapContainer>
    </div>
  )
}

export default MapComponent
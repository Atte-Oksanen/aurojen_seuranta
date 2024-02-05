import { useEffect, useState } from 'react'
import MapComponent from './components/MapComponent'
import SearchComponent from './components/SearchComponent'
import InfoBox from './components/InfoBox'
import LoadingScreen from './components/LoadingScreen'
import roadNameService from './services/roadNames'
import plowService from './services/plowActivity'
import { GeoJsonObject } from 'geojson'
import { roadObject } from './types/roadName'
import { LatLngTuple } from 'leaflet'

function App() {
  const [roadNames, setRoadNames] = useState<roadObject[]>()
  const [coords, setCoords] = useState<GeoJsonObject>()
  const [timestamp, setTimestamp] = useState<Date>()
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([60.15976, 24.72423])

  useEffect(() => {
    const primeData = async () => {
      const plowData = await plowService.getPlowData()
      const roadnamesTemp = await roadNameService.getRoadNames()
      setTimeout(() => {
        setCoords(plowData.geoJson)
        setTimestamp(new Date(plowData.timestamp))
        setRoadNames(roadnamesTemp.map(element => { return { ...element, timeStamp: new Date(element.timeStamp) } }))
      }, 1500)
    }
    primeData()
  }, [])

  return (
    <div>
      {!coords && !roadNames && <LoadingScreen />}
      {roadNames && <SearchComponent roadNames={roadNames} setMapCenter={setMapCenter} />}
      {<MapComponent mapCenter={mapCenter} coords={coords} timestamp={timestamp} />}
      {timestamp && <InfoBox timestamp={timestamp} />}
    </div>
  )
}

export default App

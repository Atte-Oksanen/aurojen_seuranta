import { useEffect, useState } from 'react'
import MapComponent from './components/MapComponent'
import SearchComponent from './components/SearchComponent'
import InfoBox from './components/InfoBox'
import LoadingScreen from './components/LoadingScreen'
import roadNameService from './services/roadNames'
import plowService from './services/plowActivity'
import { roadObject } from './types/localTypes'
import { LatLngTuple } from 'leaflet'
import { FeatureCollection } from 'geojson'

function App() {
  const [roadNames, setRoadNames] = useState<roadObject[]>()
  const [coords, setCoords] = useState<FeatureCollection>()
  const [timestamp, setTimestamp] = useState<Date>()
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([60.15976, 24.72423])

  useEffect(() => {
    const primeData = async () => {
      const plowData = await plowService.getPlowData()
      const roadnamesTemp = await roadNameService.getRoadNames()
      setTimeout(() => {
        if (plowData) {
          setCoords(plowData.geoJson)
        }
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
      {timestamp && coords && <InfoBox timestamp={timestamp} plowDataLen={coords.features.length} />}
    </div>
  )
}

export default App

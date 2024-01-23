import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import MapComponent from './components/MapComponent'
import SearchComponent from './components/SearchComponent'
import roadNameService from './services/roadNames'
import plowService from './services/plowActivity'
import { GeoJsonObject } from 'geojson'
import { roadObject } from './types/roadName'

function App() {
  const [roadNames, setRoadNames] = useState<roadObject[]>()
  const [coords, setCoords] = useState<GeoJsonObject>()
  const [timestamp, setTimestamp] = useState<Date>()

  useEffect(() => {
    const primeData = async () => {
      const plowData = await plowService.getPlowData()
      setCoords(plowData.geoJson)
      setTimestamp(new Date(plowData.timestamp))
      const roadnamesTemp = await roadNameService.getRoadNames()
      setRoadNames(roadnamesTemp.map(element => { return { ...element, timeStamp: new Date(element.timeStamp) } }))
    }
    primeData()
  }, [])


  return (
    <div>
      <h1>Aurojen seuranta</h1>
      <Link to='/'>Kartta</Link>
      <br />
      <Link to='/hae'>Hae teitä</Link>
      <Routes>
        <Route path='/' element={coords && timestamp && <MapComponent coords={coords} timestamp={timestamp} />} />
        <Route path='/hae' element={coords && roadNames && <SearchComponent roadNames={roadNames} />} />
      </Routes>
    </div>
  )
}

export default App

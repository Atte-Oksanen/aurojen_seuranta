import { useEffect, useState } from 'react'
import MapComponent from './components/MapComponent'
import roadNameService from './services/roadNames'

interface roadObject {
  roadName: string,
  timeStamp: Date,
  id: string
}

function App() {
  const [searchText, setSearchText] = useState<string>('')
  const [roadNames, setRoadNames] = useState<roadObject[]>()
  const [searchResults, setSearchResults] = useState<roadObject[]>()

  useEffect(() => {
    const primeRoadNames = async () => {
      const roadnamesTemp = await roadNameService.getRoadNames()
      setRoadNames(roadnamesTemp.map(element => { return { ...element, timeStamp: new Date(element.timeStamp) } }))
    }
    primeRoadNames()
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    setSearchResults(roadNames?.filter(element => element.roadName.toLowerCase().includes(event.target.value.toLowerCase())))
  }
  return (
    <div>
      <h1>Aurojen seuranta</h1>
      <input placeholder='Hae katua nimellä' type='text' value={searchText} onChange={event => handleSearch(event)} />
      {searchResults
        && searchText.length > 2
        && searchResults.map(element => <div key={element.id}>{element.roadName} viimeksi aurattu {element.timeStamp.toLocaleDateString('fi-FI')} kello {element.timeStamp.getHours()}.{element.timeStamp.getMinutes() < 10 ? '0' : ''}{element.timeStamp.getMinutes()}</div>)}
      {searchResults && searchResults.length < 1 && <div>Ei tuloksia</div>}
      <MapComponent />
    </div>
  )
}

export default App

import { roadObject } from "../types/roadName"
import { useState } from "react"

const SearchComponent = ({ roadNames }: { roadNames: roadObject[] }) => {


    const [searchResults, setSearchResults] = useState<roadObject[]>()
    const [searchText, setSearchText] = useState<string>('')



    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
        setSearchResults(roadNames?.filter(element => element.roadName.toLowerCase().includes(event.target.value.toLowerCase())))
    }


    return (
        <div>
            <input placeholder='Hae katua nimellä' type='text' value={searchText} onChange={event => handleSearch(event)} />
            {searchResults
                && searchText.length > 2
                && searchResults.map(element => <div key={element.id}>{element.roadName} viimeksi aurattu {element.timeStamp.toLocaleDateString('fi-FI')} kello {element.timeStamp.getHours()}.{element.timeStamp.getMinutes() < 10 ? '0' : ''}{element.timeStamp.getMinutes()}</div>)}
            {searchResults && searchResults.length < 1 && <div>Ei tuloksia</div>}
        </div>
    )
}


export default SearchComponent
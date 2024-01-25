import { LatLngTuple } from "leaflet"
import { roadObject } from "../types/roadName"
import { useState } from "react"

const SearchComponent = ({ roadNames, setMapCenter }: { roadNames: roadObject[], setMapCenter: (coords: LatLngTuple) => void }) => {
    const [searchResults, setSearchResults] = useState<roadObject[]>()
    const [searchText, setSearchText] = useState<string>('')
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
        setSearchResults(roadNames?.filter(element => element.roadName.toLowerCase().includes(event.target.value.toLowerCase())))
    }

    const handleResultClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const coords = event.currentTarget.value.split(',').map(element => Number(element)).reverse() as LatLngTuple
        setMapCenter(coords)
        setSearchText('')
    }
    return (
        <div className='absolute z-10 lg:w-fit w-64 block left-16 top-4 text-lg'>
            <input
                className='drop-shadow-lg bg-gray-50 border w-full border-gray-300 text-gray-900 lg:w-[30rem] text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Hae katua nimellä'
                type='text'
                value={searchText}
                onChange={event => handleSearch(event)} />
            {searchResults
                && searchText.length > 2
                && <div className='drop-shadow-lg bg-gray-50 mt-1 rounded-lg border-gray-300 text-gray-900 max-h-[70vh] overflow-y-auto'>
                    {searchResults.map(element => <button className='block p-3 w-full text-left hover:bg-gray-100 rounded-lg' onClick={event => handleResultClick(event)} key={element.id} value={element.coords.toString()}>
                        <span className="font-semibold block">{element.roadName}</span>
                        <span className="text-base text-gray-500">
                            Aurattu {element.timeStamp.toLocaleDateString('fi-FI')} kello {element.timeStamp.getHours()}.{element.timeStamp.getMinutes() < 10 ? '0' : ''}{element.timeStamp.getMinutes()}
                        </span>
                    </button>)}
                    {searchResults && searchResults.length < 1 && <div className='block p-3 w-full text-left'>Ei tuloksia</div>}
                </div>}
        </div>
    )
}


export default SearchComponent
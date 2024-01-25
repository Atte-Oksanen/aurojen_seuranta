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
        <div className='absolute z-10 w-fit block left-16 top-11'>
            <input
                className='drop-shadow-lg bg-gray-50 border border-gray-300 text-gray-900 w-96 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 '
                placeholder='Hae katua nimellä'
                type='text'
                value={searchText}
                onChange={event => handleSearch(event)} />

            {searchResults
                && searchText.length > 2
                && <div className='drop-shadow-lg bg-gray-50 mt-1 rounded-lg p-2.5 border-gray-300 text-gray-900'>
                    {searchResults.map(element => <div key={element.id}>{element.roadName} viimeksi aurattu {element.timeStamp.toLocaleDateString('fi-FI')} kello {element.timeStamp.getHours()}.{element.timeStamp.getMinutes() < 10 ? '0' : ''}{element.timeStamp.getMinutes()}</div>)}
                    {searchResults && searchResults.length < 1 && <div>Ei tuloksia</div>}
                </div>}
        </div>
    )
}


export default SearchComponent
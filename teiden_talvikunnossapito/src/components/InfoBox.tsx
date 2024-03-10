import { useState } from "react"
import AboutIcon from "./icons/AboutIcon"
import XIcon from "./icons/XIcon"

const InfoBox = ({ timestamp, plowDataLen }: { timestamp: Date, plowDataLen: number }) => {
  const [showBox, setShowBox] = useState<boolean>(false)

  const handleShowModal = () => {
    setShowBox(!showBox)
  }

  return (
    <div className='flex absolute items-center left-5 bottom-5 z-20'>
      <button onClick={() => handleShowModal()}
        className=' bg-white rounded-full p-1 drop-shadow-lg border border-gray-300 md:hover:bg-slate-200 self-end'>
        <AboutIcon sizeClass={'h-16 w-16'} />
      </button>
      {showBox && <div className='bg-white h-fit p-2 drop-shadow-lg rounded-lg mx-5 max-w-96'>
        <div className="flex justify-end w-full">
          <button onClick={() => handleShowModal()}
            className="block w-fit md:hover:bg-slate-200 rounded-lg p-1">
            <XIcon sizeClass="h-6 w-6" />
          </button>
        </div>
        <div>
          <h3 className='font-semibold'>Viivavärityksen selite</h3>
          <div>
            <div
              style={{ background: 'linear-gradient(90deg, rgba(0,255,149,1) 0%, rgba(17,255,0,1) 25%, rgba(183,255,0,1) 50%, rgba(217,141,0,1) 75%, rgba(153,0,0,1) 100%)' }}
              className='h-6 rounded-md'
            >
            </div>
            <div className="flex justify-between">
              <div>0h</div>
              <div>30h</div>
              <div>60h</div>
            </div>
          </div>
        </div>
        <div className="text-pretty">
          Reitit noudettu viimeksi {`${timestamp.toLocaleDateString('fi-FI')} kello ${timestamp.getHours()}.${timestamp.getMinutes() < 10 ? '0' + timestamp.getMinutes() : timestamp.getMinutes()}`}.
          <br />
          Kartalla esitetään Espoon kaupungin tarjoamaa tietoa toteutuneista talvihoidon töistä viimeisen 60 tunnin ajalta.
          <br />
          Tiedot päivittyvät kello 5-23 noin kahden tunnin välein.
          <br />
          Reittejä aurattu viimeisen 60 tunnin aikana: {plowDataLen}
          <br />
          Käytetty rajapinta löytyy <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600' href="https://kartat.espoo.fi/avoindata/" target="_blank" rel="noopener">täältä</a>.
          <br />
          <a className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600' href="https://github.com/Atte-Oksanen/aurojen_seuranta" target="_blank" rel="noopener">Projektin GitHub</a>
          <br />
          Copyright (c) 2024 Atte Oksanen
        </div>
      </div>}
    </div>
  )
}

export default InfoBox
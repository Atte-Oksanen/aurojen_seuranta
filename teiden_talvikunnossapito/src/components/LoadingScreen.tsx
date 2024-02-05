import { useEffect, useState } from 'react'
import LoadingIcon from './icons/LoadingIcon.tsx'

const LoadingScreen = () => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setDots(dotAdder(dots))
    }, 500)
  }, [dots])

  const dotAdder = (dots: string) => {
    if (dots.length > 2) {
      return ''
    } else {
      return dots + '.'
    }
  }
  return (
    <div className='flex items-center justify-center flex-col'>
      <div className='mt-10'>
        <LoadingIcon sizeClass={'md:h-[60vh] md:w-[60vh] h-[40vh] w-[40vh]'} />
      </div>
      <h2 className='md:text-xl text-left w-40'>Ladataan reittejä{dots}</h2>
    </div>
  )
}

export default LoadingScreen
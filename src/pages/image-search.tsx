import { TextInput } from '@/components/TextInput'
import React, { useEffect } from 'react'
import type { Data } from './api/image-search'

const ImageSearch = () => {
  const [url, setUrl] = React.useState<string | undefined>()
  const [results, setResults] = React.useState<Data[] | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | undefined>()
  const [sensitivity, setSensitivity] = React.useState<number>(0.65)

  const handleSearch = async (input: string, sensitivity: number) => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch(`/api/image-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          sensitivity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setLoading(false)
        setError(undefined)
      } else {
        setError('Failed to find results')
      }
    } catch (e) {
      setError('Failed to find results')
    }
    setLoading(false)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault?.()
    handleSearch(url || '', sensitivity)
  }

  useEffect(() => {
    handleSearch('', sensitivity)
  }, [])

  const onInputChange = (v: string) => {
    const value = v.length > 0 ? v : undefined
    setUrl(value)
  }

  const onSelectImage = (image: Data) => {
    setUrl(image.id)
    handleSearch(image.id, sensitivity)
  }

  return (
    <section className="min-h-screen pb-8">
      <div className="mx-auto w-1/2 pt-8">
        <form className="w-full flex flex-col gap-7 pt-8" onSubmit={onSubmit}>
          <TextInput
            value={url}
            label={'URL'}
            placeholder={'https://images.unbody.io/...'}
            onChange={onInputChange}
          />
          <div className={'flex justify-between gap-16'}>
            <div
              className={
                'flex flex-row gap-2 items-center flex-grow flex-shrink-1'
              }
            >
              <input
                type={'range'}
                className="w-full"
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                value={sensitivity}
                min={0.05}
                max={1}
                step={0.05}
              />
              <label className={'text-sm'}>sensitivity</label>
            </div>
            <button
              type="submit"
              className="flex-shrink-0 md:w-auto px-3 py-3 bg-black border-black text-white fill-white active:scale-95 duration-100 border will-change-transform overflow-hidden relative rounded-xl transition-all disabled:opacity-20"
            >
              <div className="flex items-center transition-all opacity-1 text-sm">
                Search
              </div>
            </button>
          </div>
        </form>
        <div id="generative-results" className="pt-6">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-left text-red-500">{error}</div>
          ) : results ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((image, index) => (
                <div
                  key={index}
                  onClick={() => onSelectImage(image)}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <img
                    alt={''}
                    src={image.url + `?w=200`}
                    width={image.width}
                    height={image.height}
                    className="h-auto max-w-full rounded-lg"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ImageSearch

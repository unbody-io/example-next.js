import { SourceSelector } from '@/components/SourceSelector'
import { TextInput } from '@/components/TextInput'
import { Textarea } from '@/components/Textarea'
import { EProviders } from '@/configs'
import React from 'react'

const Generative = () => {
  const [provider, setProvider] = React.useState<EProviders>(
    EProviders.GoogleDoc
  )

  const [prompt, setPrompt] = React.useState<string | undefined>()
  const [context, setContext] = React.useState<string | undefined>()
  const [results, setResults] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | undefined>()
  const [instructedPrompt, setInstructedPrompt] = React.useState<boolean>(true)
  const [sensitivity, setSensitivity] = React.useState<number>(0.65)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch(`/api/generative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          prompt,
          provider,
          instructedPromptEnabled: instructedPrompt,
          sensitivity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setLoading(false)
        setError(undefined)
      } else {
        setError('Failed to generate results')
      }
    } catch (e) {
      setError('Failed to generate results')
    }
    setLoading(false)
  }

  const onInputChange = (v: string) => {
    const value = v.length > 0 ? v : undefined
    setContext(value)
  }
  const onPromptChange = (v: string) => {
    const value = v.length > 0 ? v : undefined
    setPrompt(value)
  }

  return (
    <section className="h-screen">
      <div className="mx-auto w-1/2 pt-8">
        <SourceSelector provider={provider} onChange={setProvider} />
        <form className="w-full flex flex-col gap-7 pt-8" onSubmit={onSubmit}>
          <TextInput
            label={'Context'}
            placeholder={'e.g. Mobility and the future of cities'}
            onChange={onInputChange}
          />
          <Textarea
            label={'Prompt'}
            placeholder={'e.g. Summarize these texts in 3 sentences.'}
            onChange={onPromptChange}
          />
          <div className={'flex justify-between'}>
            <div className={'flex flex-row gap-2 items-center'}>
              <input
                type={'checkbox'}
                checked={instructedPrompt}
                onChange={(e) => setInstructedPrompt(e.target.checked)}
                className={'w-4 h-4'}
              />
              <label className={'text-sm'}>Restrict mode</label>
            </div>
            <div className={'flex flex-row gap-2 items-center'}>
              <input
                type={'range'}
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
              className="md:w-auto px-3 py-3 bg-black border-black text-white fill-white active:scale-95 duration-100 border will-change-transform overflow-hidden relative rounded-xl transition-all disabled:opacity-20"
              disabled={prompt === undefined || context === undefined}
            >
              <div className="flex items-center transition-all opacity-1 text-sm">
                Generate
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
            <div
              className="html-results prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto prose-primary"
              dangerouslySetInnerHTML={{ __html: results }}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default Generative

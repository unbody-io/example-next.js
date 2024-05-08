import { SourceSelector } from '@/components/SourceSelector'
import { TextInput } from '@/components/TextInput'
import { EProviders } from '@/configs'
import {
  DiscordSearchItem,
  GDocSearchItem,
  GithubCommentSearchItem,
  GithubThreadSearchItem,
  TextBlockSearchItem,
} from '@/types'
import React from 'react'

const SemanticSearch = () => {
  const [query, setQuery] = React.useState<string | undefined>(undefined)
  const [results, setResults] = React.useState<
    GDocSearchItem[] | DiscordSearchItem[] | TextBlockSearchItem[]
  >([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | undefined>()
  const [provider, setProvider] = React.useState<EProviders>(
    EProviders.GoogleDoc
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch(`/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          provider,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setLoading(false)
        setError(undefined)
      } else {
        setError('Failed to search results')
      }
    } catch (e) {
      setError('Failed to search results')
    }
    setLoading(false)
  }

  const onInputChange = (v: string) => {
    const value = v.length > 0 ? v : undefined
    setQuery(value)
  }

  const handleProviderChange = (p: EProviders) => {
    setResults([])
    setProvider(p)
  }

  const renderResults = () => {
    switch (provider) {
      case EProviders.DiscordMassage:
        return results.map((r: DiscordSearchItem, i) => (
          <div key={i} className="bg-gray-50 px-4 rounded-lg">
            {r.content as string}
          </div>
        ))
      case EProviders.GoogleDoc:
        return results.map((r: GDocSearchItem, i) => (
          <div key={i} className="bg-gray-50 px-4 rounded-lg">
            <h3>{r.title as string}</h3>
            <p>{(r.text as string).split('\n')[1]}</p>
          </div>
        ))
      case EProviders.TextBlock:
        return results.map((r: TextBlockSearchItem, i) => (
          <div key={i} className="bg-gray-50 px-4 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: r.html as string }} />
          </div>
        ))

      case EProviders.GithubComment:
        return results.map((r: GithubCommentSearchItem, i) => (
          <div key={i} className="bg-gray-50 px-4 rounded-lg">
            <div className="flex items-center gap-2">
              <img
                src={r.author?.avatarUrl as string}
                alt={r.author?.login as string}
                className="not-prose my-6 w-8 h-8 rounded-full"
              />
              <span className="pl-2">{r.author?.login as string}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: r.html as string }} />
          </div>
        ))

      case EProviders.GithubThread:
        return results.map((r: GithubThreadSearchItem, i) => {
          const text = (r.text || '') as string

          return (
            <div key={i} className="bg-gray-50 px-4 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={r.author?.avatarUrl as string}
                  alt={r.author?.login as string}
                  className="not-prose my-6 w-8 h-8 rounded-full"
                />
                <span className="pl-2">{r.author?.login as string}</span>

                <a href={r.url as string} target="_blank" className="">
                  <span className="text-gray-600">
                    {r.type === 'pull_request' ? 'PR' : 'Issue'} #
                    {r.number as number}
                  </span>
                </a>
              </div>
              <div className="text-gray-500">{r.title as string}</div>
              <div className="mt-2">
                {text.length <= 150 ? text : text.slice(0, 150) + '...'}
              </div>
            </div>
          )
        })
    }
  }

  return (
    <section className="min-h-screen">
      <div className="mx-auto w-1/2 pt-8 pb-8">
        <SourceSelector provider={provider} onChange={handleProviderChange} />
        <form className="w-full flex flex-col gap-7 pt-8" onSubmit={onSubmit}>
          <TextInput
            label={'Context'}
            placeholder={'e.g. Mobility and the future of cities'}
            onChange={onInputChange}
          />
          <button
            type="submit"
            className="md:w-auto px-3 py-3 bg-black border-black text-white fill-white active:scale-95 duration-100 border will-change-transform overflow-hidden relative rounded-xl transition-all disabled:opacity-20"
            disabled={query === undefined}
          >
            <div className="flex items-center transition-all opacity-1 text-sm">
              Search
            </div>
          </button>
        </form>
        <div className="pt-6">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-left text-red-500">{error}</div>
          ) : results ? (
            results.length > 0 ? (
              <>
                <small className={'pb-2 block'}>{results.length} results</small>
                <div className="flex flex-col gap-4 prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto prose-primary">
                  {renderResults()}
                </div>
              </>
            ) : (
              <div className="text-center">No results found</div>
            )
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default SemanticSearch

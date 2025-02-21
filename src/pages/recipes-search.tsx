import { TextInput } from '@/components/TextInput'
import { Accordion, AccordionItem } from '@heroui/react'
import React from 'react'
import type { Data } from './api/recipes/search'

const SemanticSearch = () => {
  const [query, setQuery] = React.useState<string | undefined>(undefined)
  const [results, setResults] = React.useState<Data | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | undefined>()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch(`/api/recipes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
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

  return (
    <section className="min-h-screen">
      <div className="mx-auto w-1/2 pt-8 pb-8">
        <form className="w-full flex flex-col gap-7 pt-8" onSubmit={onSubmit}>
          <TextInput
            label={'Query'}
            placeholder={'e.g. Italian meals'}
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
          ) : (
            <div>
              <div>
                <div
                  className="markdown"
                  dangerouslySetInnerHTML={{ __html: results?.answer || '' }}
                ></div>
              </div>
              {results ? (
                results.recipes.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <Accordion>
                        {results.recipes.map((recipe, index) => (
                          <AccordionItem title={recipe.title} key={index}>
                            <div
                              className="markdown"
                              dangerouslySetInnerHTML={{
                                __html: recipe.text,
                              }}
                            ></div>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </>
                ) : (
                  <div className="text-center">No results found</div>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SemanticSearch

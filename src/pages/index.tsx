import { ExampleCard } from '@/components/ExampleCard'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex" />

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <div className={'flex flex-row items-center justify-center gap-4'}>
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <span className={'mb-3 text-4xl font-semibold text-white'}>+</span>
          <Image
            className="relative light:invert inset-y-1"
            src="/unbody-logo.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
        </div>
      </div>

      <div className="mb-32 flex flex-col text-center lg:max-w-xl lg:w-full lg:mb-0 lg:text-left">
        <ExampleCard
          title="Semantic Search"
          description="Search using natural language queries."
          href="/search"
        />
        <ExampleCard
          title="Generative Search"
          description="Interact with the documents in a generative way using user's prompts."
          href="/generative"
        />
        <ExampleCard
          title="Image Search"
          description="Search for images using natural language queries."
          href="/image-search"
        />
      </div>
    </main>
  )
}

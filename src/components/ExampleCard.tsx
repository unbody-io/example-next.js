import Link from 'next/link'

type ExampleCardProps = {
  title: string
  description: string
  href: string
}

export const ExampleCard = (props: ExampleCardProps) => (
  <Link
    href={props.href}
    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:shadow-fuchsia-500 hover:dark:border-neutral-700"
    rel="noopener noreferrer"
  >
    <h2 className={`mb-3 text-2xl font-semibold`}>
      {props.title}{' '}
      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
        -&gt;
      </span>
    </h2>
    <p className={`m-0 max-w-[70ch] text-sm opacity-50`}>{props.description}</p>
  </Link>
)

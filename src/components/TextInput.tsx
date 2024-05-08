type Props = {
  label: string
  value?: string
  placeholder: string
  onChange: (value: string) => void
}

export const TextInput = ({ value, label, placeholder, onChange }: Props) => (
  <div className={'text-balance'}>
    <label className="text-gray-500 font-semibold text-sm p-2 block">
      {label}
    </label>
    <div className="mx-auto relative bg-white flex flex-col md:flex-row items-center justify-center border py-2 px-2 rounded-2xl gap-2 shadow-2xl focus-within:border-gray-300 w-full">
      <input
        placeholder={placeholder}
        name="context"
        className="px-6 py-2 w-full rounded-md flex-1 outline-none bg-white"
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        {...(typeof value !== 'undefined' ? { value } : {})}
      />
    </div>
  </div>
)

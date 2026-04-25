'use client'
import React, { ChangeEvent, useCallback, useState } from 'react';
import "./search.css"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SearchProps {
  searchName?: string;
  rounded?: boolean;
  placeholder: string;
}

const Search: React.FC<SearchProps> = ({ searchName, rounded, placeholder }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [val, setVal] = useState("")

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  return (
    <div
      className={`search-parent flex items-center gap-x-3 ${rounded ? "rounded-full" : ""} border px-4 w-full md:w-full `}
    >
      <i className="ri-search-line text-xl text-gray-400" />
      <input
        id="search"
        value={val}
        type="search"
        name="search"
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const newSearch = event?.target?.value;
          setVal(newSearch)
          router.push(pathname + '?' + createQueryString(searchName ?? 'search', newSearch))
        }}
        className="w-full py-2 my-[1px] outline-none pl-1"
      />
    </div>
  )
}

export default Search;

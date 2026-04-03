import React, { useEffect, useRef } from 'react'

interface IuseCloseOnOutsideClick {
  setIsOpen:(bool: boolean) => void

}
const useCloseOnOutsideClick = ({setIsOpen}:IuseCloseOnOutsideClick) => {
  const selectRef = useRef<HTMLDivElement>(null); // Ref to track the select component

  

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return {selectRef}
}

export default useCloseOnOutsideClick
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useCurrentPath(): string {
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState<string>('/')

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname)
    }
  }, [pathname])

  return currentPath
}

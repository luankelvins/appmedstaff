import { useMemo, useCallback, useRef, useEffect } from 'react'
import { debounce, throttle } from 'lodash'

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      throttledCallback.cancel()
    }
  }, [throttledCallback])

  return throttledCallback as T
}

// Hook para debounce de funções
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      debouncedCallback.cancel()
    }
  }, [debouncedCallback])

  return debouncedCallback as T
}

// Hook para memoização de listas com filtros
export function useFilteredList<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return items.filter(filterFn)
  }, [items, ...dependencies])
}

// Hook para memoização de listas ordenadas
export function useSortedList<T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return [...items].sort(sortFn)
  }, [items, ...dependencies])
}

// Hook para paginação otimizada
export function usePagination<T>(
  items: T[],
  pageSize: number = 10,
  initialPage: number = 1
) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / pageSize)
  }, [items.length, pageSize])

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, pageSize])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  }
}

// Hook para virtualização de listas grandes
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  const totalHeight = itemCount * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll
  }
}

// Hook para otimização de queries do Supabase
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000 // 10 minutos
  } = options

  const isStale = useMemo(() => {
    return Date.now() - lastFetch > staleTime
  }, [lastFetch, staleTime])

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      setData(result)
      setLastFetch(Date.now())
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [queryFn, enabled])

  useEffect(() => {
    if (enabled && (isStale || !data)) {
      fetchData()
    }
  }, [enabled, isStale, data, fetchData, ...dependencies])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    isStale
  }
}

// Hook para otimização de formulários grandes
export function useFormOptimization<T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<string, any> = {}
) {
  const [formData, setFormData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Debounced validation
  const debouncedValidate = useDebouncedCallback(
    (data: T) => {
      const newErrors: Record<string, string> = {}
      
      Object.keys(validationRules).forEach(field => {
        const rule = validationRules[field]
        const value = data[field]
        
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          newErrors[field] = `${field} é obrigatório`
        }
        
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          newErrors[field] = `${field} deve ter pelo menos ${rule.minLength} caracteres`
        }
        
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          newErrors[field] = `${field} tem formato inválido`
        }
        
        if (rule.custom) {
          const customError = rule.custom(value)
          if (customError) {
            newErrors[field] = customError
          }
        }
      })
      
      setErrors(newErrors)
    },
    300
  )

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      debouncedValidate(newData)
      return newData
    })
    setIsDirty(true)
  }, [debouncedValidate])

  const touchField = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialData)
    setErrors({})
    setTouched({})
    setIsDirty(false)
  }, [initialData])

  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    formData,
    errors,
    touched,
    isDirty,
    isFormValid,
    updateField,
    touchField,
    resetForm
  }
}

// Hook para otimização de componentes com muitos re-renders
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[] = []
): T {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: any[]) => callbackRef.current(...args)) as T,
    dependencies
  )
}

// Hook para otimização de listas com busca
export function useSearchableList<T>(
  items: T[],
  searchFields: (keyof T)[],
  searchTerm: string
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return items

    const term = searchTerm.toLowerCase()
    
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term)
        }
        if (typeof value === 'number') {
          return value.toString().includes(term)
        }
        return false
      })
    )
  }, [items, searchFields, searchTerm])
}

// Hook para otimização de componentes com scroll
export function useScrollOptimization(
  threshold: number = 100,
  onScrollEnd?: () => void
) {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const handleScroll = useCallback(() => {
    setIsScrolling(true)
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      onScrollEnd?.()
    }, threshold)
  }, [threshold, onScrollEnd])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    isScrolling,
    handleScroll
  }
}

// Hook para otimização de imagens com lazy loading
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(img)

    return () => observer.disconnect()
  }, [src])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setIsError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsError(true)
    setIsLoaded(false)
  }, [])

  return {
    imageSrc,
    isLoaded,
    isError,
    imgRef,
    handleLoad,
    handleError
  }
}

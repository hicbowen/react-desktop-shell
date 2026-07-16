import { useEffect, useState } from 'react'

const RESPONSIVE_MONTHS_QUERY = '(max-width: 640px)'

export function useResolvedVisibleMonths(
  visibleMonths: 1 | 2 | 'responsive',
): 1 | 2 {
  const [responsiveMonths, setResponsiveMonths] = useState<1 | 2>(() => {
    if (
      visibleMonths !== 'responsive' ||
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return 2
    }

    return window.matchMedia(RESPONSIVE_MONTHS_QUERY).matches ? 1 : 2
  })

  useEffect(() => {
    if (
      visibleMonths !== 'responsive' ||
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }

    const media = window.matchMedia(RESPONSIVE_MONTHS_QUERY)
    const update = () => setResponsiveMonths(media.matches ? 1 : 2)
    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [visibleMonths])

  return visibleMonths === 'responsive' ? responsiveMonths : visibleMonths
}

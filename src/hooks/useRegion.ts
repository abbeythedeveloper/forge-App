import { useState, useEffect } from 'react'

export interface RegionData {
  countryCode: string
  country: string
  isAfrica: boolean
  loading: boolean
}

const DEV_OVERRIDE_KEY = 'smeltr_dev_region_override'

export function useRegion(): RegionData {
  const [region, setRegion] = useState<RegionData>({
    countryCode: 'US',
    country: 'Unknown',
    isAfrica: false,
    loading: true,
  })

  useEffect(() => {
    const detect = async () => {
      // Check dev override first
      const override = localStorage.getItem(DEV_OVERRIDE_KEY)
      if (override) {
        setRegion({
          countryCode: override === 'africa' ? 'NG' : 'US',
          country: override === 'africa' ? 'Nigeria (dev override)' : 'United States (dev override)',
          isAfrica: override === 'africa',
          loading: false,
        })
        return
      }

      try {
        const res = await fetch('/api/region')
        const data = await res.json()
        setRegion({ ...data, loading: false })
      } catch {
        setRegion({ countryCode: 'US', country: 'Unknown', isAfrica: false, loading: false })
      }
    }

    detect()

    // Listen for dev override changes
    const onStorage = () => detect()
    window.addEventListener('storage', onStorage)
    window.addEventListener('smeltr-region-override', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('smeltr-region-override', onStorage)
    }
  }, [])

  return region
}

export function setDevRegionOverride(region: 'africa' | 'international' | null) {
  if (region === null) {
    localStorage.removeItem(DEV_OVERRIDE_KEY)
  } else {
    localStorage.setItem(DEV_OVERRIDE_KEY, region)
  }
  window.dispatchEvent(new Event('smeltr-region-override'))
}

export function getDevRegionOverride(): 'africa' | 'international' | null {
  const val = localStorage.getItem(DEV_OVERRIDE_KEY)
  if (val === 'africa') return 'africa'
  if (val === 'international') return 'international'
  return null
}

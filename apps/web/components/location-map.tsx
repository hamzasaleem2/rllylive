"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import Map from "react-map-gl/mapbox"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { MapPin, Search } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"

interface LocationMapProps {
  isGlobal: boolean
  location: string
  onLocationChange: (location: string) => void
  onToggleChange: (isGlobal: boolean) => void
}

interface SearchResult {
  id: string
  place_name: string
  center: [number, number]
}

export function LocationMap({ isGlobal, location, onLocationChange, onToggleChange }: LocationMapProps) {
  const [viewport, setViewport] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: isGlobal ? 2 : 8
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const mapRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const isSelectingResult = useRef(false)

  // Search for places using Mapbox Geocoding API
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood,address&limit=5`
      )
      const data = await response.json()
      
      if (data.features) {
        const results: SearchResult[] = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center
        }))
        setSearchResults(results)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setSearchResults([])
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (isSelectingResult.current) {
      isSelectingResult.current = false
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchPlaces])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggleChange = useCallback((newIsGlobal: boolean) => {
    onToggleChange(newIsGlobal)
    if (newIsGlobal) {
      const newViewport = {
        longitude: 10,
        latitude: 60,
        zoom: 2
      }
      setViewport(newViewport)
      if (mapRef.current) {
        mapRef.current.flyTo({ 
          center: [newViewport.longitude, newViewport.latitude], 
          zoom: newViewport.zoom 
        })
      }
      onLocationChange("")
      setSearchQuery("")
      setShowResults(false)
    } else {
      const newViewport = {
        longitude: -122.4194,
        latitude: 37.7749,
        zoom: 8
      }
      setViewport(newViewport)
      if (mapRef.current) {
        mapRef.current.flyTo({ 
          center: [newViewport.longitude, newViewport.latitude], 
          zoom: newViewport.zoom 
        })
      }
    }
  }, [viewport, onLocationChange, onToggleChange])

  const handleSelectResult = useCallback((result: SearchResult) => {
    const [longitude, latitude] = result.center
    
    const newViewport = {
      longitude,
      latitude,
      zoom: 12
    }
    
    setViewport(newViewport)
    
    if (mapRef.current) {
      mapRef.current.flyTo({ 
        center: [longitude, latitude], 
        zoom: 12,
        duration: 1000
      })
    }
    
    onLocationChange(result.place_name)
    
    // Set flag to prevent search when updating query
    isSelectingResult.current = true
    setSearchQuery(result.place_name)
    setSearchResults([]) 
    setShowResults(false)
  }, [onLocationChange])

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="h-48 rounded-lg overflow-hidden">
          <Map
            ref={mapRef}
            {...viewport}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            onMove={evt => setViewport(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
            attributionControl={false}
          />
        </div>
        
        {/* Toggle buttons inside map */}
        <div className="absolute top-4 left-4 z-40">
          <div className="flex rounded-lg overflow-hidden bg-gray-200/80 dark:bg-black/80 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => handleToggleChange(false)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                !isGlobal 
                  ? "bg-gray-600 dark:bg-black text-white" 
                  : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-800/50"
              }`}
            >
              City
            </button>
            <button
              type="button"
              onClick={() => handleToggleChange(true)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                isGlobal 
                  ? "bg-gray-600 dark:bg-black text-white" 
                  : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-800/50"
              }`}
            >
              Global
            </button>
          </div>
        </div>
        
        {!isGlobal && (
          <div className="absolute bottom-4 left-4 right-4 z-50">
            <div className="relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && searchQuery.length > 0 && setShowResults(true)}
                  className="pl-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border/30 last:border-b-0 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{result.place_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
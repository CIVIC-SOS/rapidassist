import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

function LocationMap({ location, onLocationChange, showControls = false, height = '300px' }) {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Dynamically import Leaflet to avoid SSR issues
        const initMap = async () => {
            try {
                const L = await import('leaflet')

                // Fix default marker icon issue in webpack
                delete L.Icon.Default.prototype._getIconUrl
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                })

                if (mapRef.current && !mapInstanceRef.current) {
                    // Default to India if no location
                    const defaultLat = location?.lat || 28.6139
                    const defaultLng = location?.lng || 77.2090

                    // Create map
                    mapInstanceRef.current = L.map(mapRef.current).setView([defaultLat, defaultLng], 15)

                    // Add tile layer (OpenStreetMap)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19,
                    }).addTo(mapInstanceRef.current)

                    // Create custom pulsing marker
                    const pulsingIcon = L.divIcon({
                        className: 'pulsing-marker',
                        html: `
                            <div class="marker-pin">
                                <div class="marker-pulse"></div>
                                <div class="marker-core">📍</div>
                            </div>
                        `,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                    })

                    // Add marker
                    markerRef.current = L.marker([defaultLat, defaultLng], {
                        icon: pulsingIcon,
                        draggable: showControls
                    }).addTo(mapInstanceRef.current)

                    // Add accuracy circle if location available
                    if (location?.accuracy) {
                        L.circle([defaultLat, defaultLng], {
                            radius: location.accuracy,
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.15,
                            weight: 2
                        }).addTo(mapInstanceRef.current)
                    }

                    // Handle marker drag if controls enabled
                    if (showControls && onLocationChange) {
                        markerRef.current.on('dragend', (e) => {
                            const pos = e.target.getLatLng()
                            onLocationChange({ lat: pos.lat, lng: pos.lng })
                        })
                    }

                    setIsLoading(false)
                }
            } catch (err) {
                console.error('Error loading map:', err)
                setError('Failed to load map')
                setIsLoading(false)
            }
        }

        initMap()

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Update marker position when location changes
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current && location?.lat && location?.lng) {
            markerRef.current.setLatLng([location.lat, location.lng])
            mapInstanceRef.current.setView([location.lat, location.lng], 15)
        }
    }, [location?.lat, location?.lng])

    if (error) {
        return (
            <div className="map-error" style={{ height }}>
                <span>🗺️</span>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="location-map-wrapper" style={{ height }}>
            {isLoading && (
                <div className="map-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading map...</p>
                </div>
            )}
            <div ref={mapRef} className="location-map" style={{ height: '100%', width: '100%' }} />

            {location && (
                <div className="map-overlay-info">
                    <div className="location-coords">
                        <span>📍</span>
                        <span>{location.lat?.toFixed(6)}, {location.lng?.toFixed(6)}</span>
                    </div>
                    {location.accuracy && (
                        <div className="location-accuracy">
                            ±{Math.round(location.accuracy)}m accuracy
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default LocationMap

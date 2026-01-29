import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import LocationMap from '../components/LocationMap/LocationMap'
import { EMERGENCY_SERVICES } from '../utils/constants'

function SOS() {
    const { user, isAuthenticated } = useAuth()
    const { createSOSReport } = useReports()
    const toast = useToast()

    const [isActivated, setIsActivated] = useState(false)
    const [countdown, setCountdown] = useState(5)
    const [selectedTarget, setSelectedTarget] = useState('myself')
    const [selectedService, setSelectedService] = useState('all')
    const [location, setLocation] = useState(null)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [shakeEnabled, setShakeEnabled] = useState(false)
    const [sosComplete, setSosComplete] = useState(false)

    // Get user's location on mount
    useEffect(() => {
        requestLocation()
    }, [])

    // Countdown timer effect
    useEffect(() => {
        let timer
        if (isActivated && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1)
                // Play beep sound (using Web Audio API)
                playBeep(countdown)
            }, 1000)
        } else if (countdown === 0) {
            handleSOSComplete()
        }
        return () => clearInterval(timer)
    }, [isActivated, countdown])

    // Shake detection
    useEffect(() => {
        if (!shakeEnabled || isActivated) return

        let lastX = 0, lastY = 0, lastZ = 0
        let shakeCount = 0
        const threshold = 15

        const handleMotion = (event) => {
            const { x, y, z } = event.accelerationIncludingGravity || {}
            if (x === undefined) return

            const deltaX = Math.abs(x - lastX)
            const deltaY = Math.abs(y - lastY)
            const deltaZ = Math.abs(z - lastZ)

            if ((deltaX > threshold && deltaY > threshold) ||
                (deltaX > threshold && deltaZ > threshold) ||
                (deltaY > threshold && deltaZ > threshold)) {
                shakeCount++
                if (shakeCount > 3) {
                    handleActivate()
                    shakeCount = 0
                }
            }

            lastX = x; lastY = y; lastZ = z
        }

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleMotion)
        }

        return () => {
            window.removeEventListener('devicemotion', handleMotion)
        }
    }, [shakeEnabled, isActivated])

    const requestLocation = useCallback(() => {
        setIsLocating(true)
        setLocationError(null)

        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported')
            setIsLocating(false)
            // Use default location for demo
            setLocation({ lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' })
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords

                // Try to get address via reverse geocoding
                let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    )
                    const data = await response.json()
                    if (data.display_name) {
                        address = data.display_name.split(',').slice(0, 3).join(', ')
                    }
                } catch (e) {
                    console.log('Reverse geocoding failed, using coordinates')
                }

                setLocation({ lat: latitude, lng: longitude, accuracy, address })
                setIsLocating(false)
                toast.success('Location acquired!')
            },
            (error) => {
                console.error('Geolocation error:', error)
                setLocationError(error.message)
                setIsLocating(false)
                // Use default location for demo
                setLocation({ lat: 28.6139, lng: 77.2090, address: 'New Delhi, India (Demo Location)' })
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }, [toast])

    const playBeep = (count) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.type = 'sine'
            oscillator.frequency.value = count === 1 ? 880 : 440
            gainNode.gain.value = 0.3

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.15)
        } catch (e) {
            // Audio might be blocked, that's okay
        }
    }

    const handleActivate = () => {
        setIsActivated(true)
        setCountdown(5)
        setSosComplete(false)
        // Vibrate if available
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
        }
    }

    const handleCancel = () => {
        setIsActivated(false)
        setCountdown(5)
        toast.info('SOS Alert cancelled')
    }

    const handleSOSComplete = async () => {
        setIsActivated(false)
        setSosComplete(true)

        // Create SOS report
        const reportData = {
            type: selectedService === 'all' ? 'ambulance' : selectedService,
            target: selectedTarget,
            userId: user?.id || 'anonymous',
            userName: user?.name || 'Anonymous User',
            location: location,
            medicalInfo: user ? {
                bloodGroup: user.bloodGroup,
                conditions: Object.entries(user.medicalConditions || {})
                    .filter(([_, v]) => v)
                    .map(([k]) => k),
                allergies: user.allergies
            } : null
        }

        try {
            await createSOSReport(reportData)
            toast.success('Emergency alert sent! Help is on the way.')

            // Simulate notification to emergency contacts
            if (user?.contacts?.length > 0) {
                setTimeout(() => {
                    toast.info(`📱 ${user.contacts.length} emergency contacts notified`)
                }, 1500)
            }
        } catch (e) {
            toast.error('Failed to send alert. Please try calling emergency services directly.')
        }

        // Vibrate success pattern
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100])
        }
    }

    const enableShakeDetection = async () => {
        if (typeof DeviceMotionEvent !== 'undefined' &&
            typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission()
                if (permission === 'granted') {
                    setShakeEnabled(true)
                    toast.success('Shake detection enabled! Shake device to trigger SOS.')
                }
            } catch (e) {
                toast.error('Could not enable shake detection')
            }
        } else {
            setShakeEnabled(true)
            toast.success('Shake detection enabled!')
        }
    }

    return (
        <div className="sos-page">
            <div className="page-header">
                <h1 className="page-title" style={{ color: 'var(--error)' }}>
                    Emergency SOS
                </h1>
                <p className="page-subtitle">
                    Instantly alert emergency services. Your location will be shared automatically.
                </p>
            </div>

            {!sosComplete ? (
                <div className="sos-container">
                    {!isActivated ? (
                        <>
                            {/* Main SOS Button */}
                            <button className="sos-button" onClick={handleActivate}>
                                <span>SOS</span>
                            </button>

                            {/* Target Selection */}
                            <div className="sos-info">
                                <p style={{ color: 'var(--text-secondary)', marginTop: '2rem', marginBottom: '1rem' }}>
                                    Who needs help?
                                </p>

                                <div className="sos-options">
                                    <div
                                        className={`sos-option-card ${selectedTarget === 'myself' ? 'selected' : ''}`}
                                        onClick={() => setSelectedTarget('myself')}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                                        <div style={{ fontWeight: 600 }}>For Myself</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            I need help
                                        </div>
                                    </div>

                                    <div
                                        className={`sos-option-card ${selectedTarget === 'others' ? 'selected' : ''}`}
                                        onClick={() => setSelectedTarget('others')}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                                        <div style={{ fontWeight: 600 }}>For Others</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Report emergency
                                        </div>
                                    </div>
                                </div>

                                {/* Service Selection */}
                                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Emergency service needed:
                                </p>
                                <div className="service-selection">
                                    <button
                                        className={`service-btn ${selectedService === 'all' ? 'active' : ''}`}
                                        onClick={() => setSelectedService('all')}
                                    >
                                        🚨 All Services
                                    </button>
                                    {Object.values(EMERGENCY_SERVICES).map(service => (
                                        <button
                                            key={service.id}
                                            className={`service-btn ${service.id} ${selectedService === service.id ? 'active' : ''}`}
                                            onClick={() => setSelectedService(service.id)}
                                        >
                                            {service.icon} {service.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location Display */}
                            <div className="sos-location-section">
                                <div className="location-header">
                                    <h3>📍 Your Location</h3>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={requestLocation}
                                        disabled={isLocating}
                                    >
                                        {isLocating ? '⏳ Locating...' : '🔄 Refresh'}
                                    </button>
                                </div>

                                {location ? (
                                    <>
                                        <LocationMap location={location} height="200px" />
                                        <p className="location-address">{location.address}</p>
                                    </>
                                ) : isLocating ? (
                                    <div className="location-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Acquiring your location...</p>
                                    </div>
                                ) : locationError ? (
                                    <div className="location-error">
                                        <p>⚠️ {locationError}</p>
                                        <p>Using approximate location for demo</p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Shake Detection Toggle */}
                            <div className="shake-toggle">
                                {!shakeEnabled ? (
                                    <button className="btn btn-secondary" onClick={enableShakeDetection}>
                                        📳 Enable Shake-to-SOS
                                    </button>
                                ) : (
                                    <div className="shake-enabled">
                                        <span className="shake-indicator"></span>
                                        <span>Shake detection active</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Countdown State */
                        <div className="sos-countdown-container">
                            <div className="countdown-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(239, 68, 68, 0.2)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(countdown / 5) * 283} 283`}
                                        transform="rotate(-90 50 50)"
                                        className="countdown-progress"
                                    />
                                </svg>
                                <div className="countdown-number">{countdown}</div>
                            </div>

                            <h2 style={{ color: 'var(--text-primary)', marginTop: '1.5rem' }}>
                                SOS Alert Activating...
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Emergency services will be notified when countdown reaches zero
                            </p>

                            <button className="btn btn-secondary btn-lg" onClick={handleCancel}>
                                ✕ Cancel Alert
                            </button>

                            <div className="alert-recipients">
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Alert will be sent to:
                                </p>
                                <div className="recipient-badges">
                                    {(selectedService === 'all' ? Object.values(EMERGENCY_SERVICES) : [EMERGENCY_SERVICES[selectedService]]).map(s => (
                                        <span
                                            key={s.id}
                                            className="recipient-badge"
                                            style={{ background: s.gradient }}
                                        >
                                            {s.icon} {s.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* SOS Complete State */
                <div className="sos-complete">
                    <div className="success-animation">
                        <div className="success-circle">
                            <span>✓</span>
                        </div>
                    </div>

                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>
                        Emergency Alert Sent!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
                        Help is on the way. Stay calm and stay in your location if it's safe to do so.
                    </p>

                    <div className="eta-cards">
                        {(selectedService === 'all' ? Object.values(EMERGENCY_SERVICES) : [EMERGENCY_SERVICES[selectedService]]).map(s => (
                            <div key={s.id} className="eta-card" style={{ borderColor: s.color }}>
                                <span className="eta-icon">{s.icon}</span>
                                <div className="eta-info">
                                    <div className="eta-service">{s.title}</div>
                                    <div className="eta-time">ETA: ~{Math.floor(Math.random() * 10) + 5} mins</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user?.contacts?.length > 0 && (
                        <div className="contacts-notified">
                            <h4>📱 Contacts Notified:</h4>
                            <div className="contact-list">
                                {user.contacts.map((c, i) => (
                                    <div key={i} className="contact-item">
                                        <span className="contact-initial">{c.name?.charAt(0)}</span>
                                        <span>{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setSosComplete(false)}
                        style={{ marginTop: '2rem' }}
                    >
                        Send Another Alert
                    </button>
                </div>
            )}

            {/* How SOS Works Section */}
            <section className="sos-how-it-works">
                <div className="card">
                    <h3 style={{
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>ℹ️</span> How SOS Works
                    </h3>

                    <div className="steps-grid">
                        {[
                            { num: 1, title: 'Countdown Starts', desc: '5-second countdown gives you time to cancel if pressed accidentally' },
                            { num: 2, title: 'Location Shared', desc: 'Your GPS location is immediately shared with emergency services' },
                            { num: 3, title: 'Services Notified', desc: 'Police, Ambulance, or Fire services are alerted based on your selection' },
                            { num: 4, title: 'Contacts Alerted', desc: 'Your emergency contacts receive notification with your location' }
                        ].map(step => (
                            <div key={step.num} className="step-item">
                                <span className="step-number">{step.num}</span>
                                <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>{step.title}</strong>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SOS

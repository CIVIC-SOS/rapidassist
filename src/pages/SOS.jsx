import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import LocationMap from '../components/LocationMap/LocationMap'
import { EMERGENCY_SERVICES } from '../utils/constants'
import { sendSOS } from '../utils/sendingSOS'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import { database } from '../firebase'
import { ref, push, set, serverTimestamp } from 'firebase/database'

function SOS({ userId: propUserId }) {
    const { user, isAuthenticated } = useAuth()
    const { createSOSReport } = useReports()
    const toast = useToast()

    const [isActivated, setIsActivated] = useState(false)
    const [countdown, setCountdown] = useState(7)
    const [selectedTarget, setSelectedTarget] = useState('myself')
    const [selectedService, setSelectedService] = useState('all')
    const [location, setLocation] = useState(null)
    const [isLocating, setIsLocating] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const [shakeEnabled, setShakeEnabled] = useState(false)
    const [sosComplete, setSosComplete] = useState(false)
    const [evidenceStatus, setEvidenceStatus] = useState('idle') // idle, capturing, uploaded, failed
    const [evidenceUrls, setEvidenceUrls] = useState(null)
    const firebaseIdRef = useRef(null)
    const abortControllerRef = useRef(null)

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
                playBeep(countdown)
            }, 1000)
        } else if (countdown === 0 && isActivated) {
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
            setLocation({ lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' })
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords
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
        } catch (e) { }
    }

    const handleActivate = () => {
        setIsActivated(true)
        setCountdown(7)
        setSosComplete(false)
        setEvidenceStatus('capturing')

        // Start multimedia capture immediately
        const controller = new AbortController()
        abortControllerRef.current = controller

        sendSOS(controller.signal).then(result => {
            setEvidenceUrls(result)
            setEvidenceStatus('uploaded')
            console.log('Final Evidence Object:', result)

            // Update Firebase if it's already pushed
            if (firebaseIdRef.current) {
                const emergencyRef = ref(database, `emergencies/${firebaseIdRef.current}/evidence`)
                set(emergencyRef, result)
            }
        }).catch(err => {
            if (err.message !== 'Aborted') {
                setEvidenceStatus('failed')
                console.error('Evidence capture failed:', err)
            }
        })

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
        }
    }

    const handleCancel = () => {
        setIsActivated(false)
        setCountdown(7)
        setEvidenceStatus('idle')

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }

        toast.info('SOS Alert cancelled')
    }

    const handleSOSComplete = async () => {
        setIsActivated(false)
        setSosComplete(true)

        const reportData = {
            type: selectedService === 'all' ? 'ambulance' : selectedService,
            target: selectedTarget,
            userId: propUserId || user?.id || 'anonymous',
            userName: user?.name || 'Anonymous User',
            location: location,
            timestamp: Date.now(),
            medicalInfo: user ? {
                bloodGroup: user.bloodGroup || 'Not Specified',
                conditions: Object.entries(user.medicalConditions || {})
                    .filter(([_, v]) => v)
                    .map(([k]) => k),
                allergies: user.allergies || 'None reported'
            } : null,
            evidence: evidenceUrls // Note: this might still be uploading
        }

        try {
            await createSOSReport(reportData)

            // Push to Firebase RTDB for Realtime Tracking
            const emergencyListRef = ref(database, 'emergencies')
            const newEmergencyRef = push(emergencyListRef)
            set(newEmergencyRef, {
                ...reportData,
                status: 'active'
            })
            firebaseIdRef.current = newEmergencyRef.key

            toast.success('🆘 Emergency alert sent! Help is on the way.')
            if (user?.contacts?.length > 0) {
                setTimeout(() => {
                    toast.info(`📱 ${user.contacts.length} emergency contacts notified`)
                }, 1500)
            }
        } catch (e) {
            console.error('SOS Send Error:', e)
            toast.error('Failed to send alert. Please call emergency services directly.')
        }

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
                    toast.success('Shake detection enabled!')
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
                            <button className="sos-button" onClick={handleActivate}>
                                <span className="sos-button-icon">{/* 🆘 */}</span>
                                <span>SOS</span>
                            </button>

                            <div className="sos-info">
                                <p style={{ color: 'var(--text-secondary)', marginTop: '2rem', marginBottom: '1rem' }}>
                                    Who needs help?
                                </p>
                                <div className="sos-options">
                                    <div
                                        className={`sos-option-card ${selectedTarget === 'myself' ? 'selected' : ''}`}
                                        onClick={() => setSelectedTarget('myself')}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{/* 👤 */}</div>
                                        <div style={{ fontWeight: 600 }}>For Myself</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>I need help</div>
                                    </div>

                                    <div
                                        className={`sos-option-card ${selectedTarget === 'others' ? 'selected' : ''}`}
                                        onClick={() => setSelectedTarget('others')}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{/* 👥 */}</div>
                                        <div style={{ fontWeight: 600 }}>For Others</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Report emergency</div>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Emergency service needed:
                                </p>
                                <div className="service-selection">
                                    <button
                                        className={`service-btn ${selectedService === 'all' ? 'active' : ''}`}
                                        onClick={() => setSelectedService('all')}
                                    >
                                        All Services
                                    </button>
                                    {Object.values(EMERGENCY_SERVICES).map(service => (
                                        <button
                                            key={service.id}
                                            className={`service-btn ${service.id} ${selectedService === service.id ? 'active' : ''}`}
                                            onClick={() => setSelectedService(service.id)}
                                        >
                                            {/* {service.icon} */} {service.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="sos-location-section">
                                <div className="location-header">
                                    <h3>Your Location</h3>
                                    <button className="btn btn-secondary" onClick={requestLocation} disabled={isLocating}>
                                        {isLocating ? 'Locating...' : 'Refresh'}
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
                                ) : (
                                    <div className="location-error">
                                        <p>{locationError || 'Location not acquired'}</p>
                                    </div>
                                )}
                            </div>

                            <div className="shake-toggle">
                                {!shakeEnabled ? (
                                    <button className="btn btn-secondary" onClick={enableShakeDetection}>
                                        Enable Shake-to-SOS
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
                        <div className="sos-countdown-container">
                            <div className="countdown-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray={`${(countdown / 7) * 283} 283`}
                                        transform="rotate(-90 50 50)"
                                        className="countdown-progress"
                                    />
                                </svg>
                                <div className="countdown-number">{countdown}</div>
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginTop: '1.5rem' }}>SOS Alert Activating...</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Emergency services will be notified in {countdown}s</p>

                            <button className="btn btn-secondary btn-lg" onClick={handleCancel}>Cancel Alert</button>

                            <div className="evidence-immediate-status" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid var(--error)' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 0.5rem', width: '20px', height: '20px' }}></div>
                                <p style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.9rem' }}>Recording Evidence...</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capturing audio and images immediately</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="sos-complete">
                    <div className="success-animation"><div className="success-circle"><span></span></div></div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Emergency Alert Sent!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>Help is on the way. Stay calm and stay in your location.</p>

                    {evidenceStatus === 'capturing' && (
                        <div className="evidence-loader" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid var(--error)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto 0.5rem' }}></div>
                            <p style={{ color: 'var(--error)', fontWeight: 600 }}>Capturing Evidence...</p>
                        </div>
                    )}

                    {evidenceStatus === 'uploaded' && evidenceUrls && (
                        <div className="evidence-success" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{/* ✅ */}</span>
                                <strong style={{ color: 'var(--success)' }}>Multimedia Evidence Secured</strong>
                            </div>

                            {evidenceUrls.audioUrl && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Recorded Audio (7s):</p>
                                    <AudioEvidencePlayer src={evidenceUrls.audioUrl} />
                                </div>
                            )}

                            <div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Captured Images:</p>
                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    {evidenceUrls.imageUrls.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                            <img src={url} alt="Evidence" style={{ height: '60px', width: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="eta-cards">
                        {(selectedService === 'all' ? Object.values(EMERGENCY_SERVICES) : [EMERGENCY_SERVICES[selectedService]]).map(s => (
                            <div key={s.id} className="eta-card" style={{ borderColor: s.color }}>
                                <span className="eta-icon">{/* {s.icon} */}</span>
                                <div className="eta-info">
                                    <div className="eta-service">{s.title}</div>
                                    <div className="eta-time">ETA: ~{Math.floor(Math.random() * 10) + 5} mins</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={() => setSosComplete(false)} style={{ marginTop: '2rem' }}>Send Another Alert</button>
                </div>
            )}
        </div>
    )
}

export default SOS

import { useState, useEffect } from 'react'

function SOSButton({ onActivate, countdownSeconds = 5 }) {
    const [isActivated, setIsActivated] = useState(false)
    const [countdown, setCountdown] = useState(countdownSeconds)
    const [selectedTarget, setSelectedTarget] = useState('myself')

    useEffect(() => {
        let timer
        if (isActivated && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
        } else if (countdown === 0) {
            onActivate && onActivate(selectedTarget)
        }
        return () => clearInterval(timer)
    }, [isActivated, countdown, selectedTarget, onActivate])

    const handleActivate = () => {
        setIsActivated(true)
        setCountdown(countdownSeconds)
    }

    const handleCancel = () => {
        setIsActivated(false)
        setCountdown(countdownSeconds)
    }

    return (
        <div className="sos-container">
            {!isActivated ? (
                <>
                    <button className="sos-button" onClick={handleActivate}>
                        {/* <span className="sos-button-icon">🆘</span> */}
                        <span>SOS</span>
                    </button>

                    <div className="sos-info">
                        <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
                            Press the SOS button to immediately alert emergency services.
                            Your location and profile information will be shared.
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
                    </div>
                </>
            ) : (
                <>
                    <div className="sos-countdown">{countdown}</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        SOS Alert Activating...
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Emergency services will be notified when countdown reaches zero
                    </p>

                    <button className="btn btn-secondary btn-lg" onClick={handleCancel}>
                        ✕ Cancel Alert
                    </button>

                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Alert will be sent to:
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            marginTop: '1rem'
                        }}>
                            <span style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--police-gradient)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }}>
                                {/* 👮 */} Police
                            </span>
                            <span style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--ambulance-gradient)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }}>
                                {/* 🚑 */} Ambulance
                            </span>
                            <span style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--fire-gradient)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }}>
                                {/* 🚒 */} Fireforce
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default SOSButton

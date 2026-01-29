function EmergencyCard({ type, title, number, onCall }) {
    const icons = {
        police: '👮',
        ambulance: '🚑',
        fire: '🚒'
    }

    const actions = [
        { icon: '📍', label: 'LOCATION' },
        { icon: '📋', label: 'DETAILS' }
    ]

    return (
        <div className={`emergency-card ${type}`} onClick={onCall}>
            <div className="emergency-card-header">
                <div className="emergency-card-icon">
                    {icons[type]}
                </div>
                <div>
                    <h3 className="emergency-card-title">{title}</h3>
                    <p className="emergency-card-number">
                        <span>📞</span> {number}
                    </p>
                </div>
            </div>

            <div className="emergency-card-actions">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className="emergency-action-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            console.log(`${action.label} action for ${title}`)
                        }}
                    >
                        <span className="icon">{action.icon}</span>
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="emergency-card-actions" style={{ marginTop: '0.5rem' }}>
                <button
                    className="emergency-action-btn"
                    onClick={(e) => {
                        e.stopPropagation()
                        console.log(`Forward to ${title}`)
                    }}
                    style={{ gridColumn: 'span 2' }}
                >
                    <span className="icon">📤</span>
                    <span>FWD {number}</span>
                </button>
            </div>
        </div>
    )
}

export default EmergencyCard

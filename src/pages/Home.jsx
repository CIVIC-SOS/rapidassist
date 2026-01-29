import { Link } from 'react-router-dom'
import EmergencyCard from '../components/EmergencyCard/EmergencyCard'

function Home() {
    const emergencyServices = [
        { type: 'police', title: 'Police', number: '100' },
        { type: 'ambulance', title: 'Ambulance', number: '108' },
        { type: 'fire', title: 'Fireforce', number: '101' }
    ]

    const handleEmergencyCall = (service) => {
        console.log(`Calling ${service.title} at ${service.number}`)
        // In production, this would trigger actual emergency protocols
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-badge">
                    <span>🛡️</span>
                    <span>Emergency Response Platform</span>
                </div>

                <h1 className="hero-title">
                    Quick Help When <br />
                    <span className="hero-title-gradient">You Need It Most</span>
                </h1>

                <p className="hero-description">
                    Instant access to emergency services, community issue reporting,
                    and real-time status tracking. Your safety is our priority.
                </p>

                <div className="hero-actions">
                    <Link to="/sos" className="btn btn-danger btn-lg">
                        Emergency SOS
                    </Link>
                    <Link to="/report" className="btn btn-primary btn-lg">
                        📝 Report an Issue
                    </Link>
                    <Link to="/community" className="btn btn-secondary btn-lg">
                        👥 Community Issues
                    </Link>
                </div>
            </section>

            {/* Emergency Services Grid */}
            <section>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: 'var(--text-primary)'
                }}>
                    Emergency Services
                </h2>

                <div className="emergency-grid">
                    {emergencyServices.map((service) => (
                        <EmergencyCard
                            key={service.type}
                            type={service.type}
                            title={service.title}
                            number={service.number}
                            onCall={() => handleEmergencyCall(service)}
                        />
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section style={{ marginTop: '1.5rem' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    color: 'var(--text-primary)'
                }}>
                    Quick Actions
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <Link to="/report" className="card" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Report Public/Civic Issue
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Upload photos and report issues in your area
                        </p>
                    </Link>

                    <Link to="/community" className="card" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗳️</div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Community Issues
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            View and support community-reported issues
                        </p>
                    </Link>

                    <Link to="/dashboard" className="card" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            SOS Reports
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Track your reports and their status
                        </p>
                    </Link>

                    <Link to="/register" className="card" style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            User Information
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Update your profile and medical info
                        </p>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home

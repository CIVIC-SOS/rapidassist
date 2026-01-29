import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { STATUS_CONFIG } from '../utils/constants'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'

function Dashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { getUserReports, getStats } = useReports()
    const [activeTab, setActiveTab] = useState('sos')

    if (!isAuthenticated) {
        return (
            <div className="dashboard-login-prompt">
                <div className="prompt-icon">🔐</div>
                <h2>Access Your Dashboard</h2>
                <p>Login to view your SOS history, reports, and manage your profile</p>
                <Link to="/login" className="btn btn-primary">Login to Continue</Link>
            </div>
        )
    }

    const stats = getStats()
    const userReports = getUserReports(user?.id)

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div className="welcome-section">
                    <div className="welcome-avatar">{user?.name?.charAt(0) || '👤'}</div>
                    <div>
                        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className="page-subtitle">
                            Here's an overview of your emergency services activity
                        </p>
                    </div>
                </div>

                <Link to="/profile" className="btn btn-secondary">
                    ⚙️ Profile Settings
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-stats">
                <div className="stat-card sos">
                    <div className="stat-icon">🆘</div>
                    <div className="stat-details">
                        <div className="stat-value">{userReports.sos.length}</div>
                        <div className="stat-name">SOS Alerts</div>
                    </div>
                </div>

                <div className="stat-card reports">
                    <div className="stat-icon">📝</div>
                    <div className="stat-details">
                        <div className="stat-value">{userReports.community.length}</div>
                        <div className="stat-name">Reports Filed</div>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-details">
                        <div className="stat-value">
                            {userReports.sos.filter(r => r.status !== 'completed').length +
                                userReports.community.filter(r => r.status !== 'completed').length}
                        </div>
                        <div className="stat-name">Pending</div>
                    </div>
                </div>

                <div className="stat-card resolved">
                    <div className="stat-icon">✓</div>
                    <div className="stat-details">
                        <div className="stat-value">
                            {userReports.sos.filter(r => r.status === 'completed').length +
                                userReports.community.filter(r => r.status === 'completed').length}
                        </div>
                        <div className="stat-name">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/sos" className="action-card sos">
                    <span className="action-icon">🆘</span>
                    <div>
                        <h3>Emergency SOS</h3>
                        <p>Instant alert to emergency services</p>
                    </div>
                </Link>

                <Link to="/report" className="action-card report">
                    <span className="action-icon">📝</span>
                    <div>
                        <h3>Report Issue</h3>
                        <p>Report a community problem</p>
                    </div>
                </Link>

                <Link to="/community" className="action-card community">
                    <span className="action-icon">👥</span>
                    <div>
                        <h3>Community Issues</h3>
                        <p>View and vote on local issues</p>
                    </div>
                </Link>
            </div>

            {/* Reports History */}
            <div className="reports-section">
                <div className="reports-header">
                    <h2>Your Activity</h2>
                    <div className="tab-buttons">
                        <button
                            className={`tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sos')}
                        >
                            🆘 SOS Alerts ({userReports.sos.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
                            onClick={() => setActiveTab('community')}
                        >
                            📝 Reports ({userReports.community.length})
                        </button>
                    </div>
                </div>

                <div className="reports-list">
                    {activeTab === 'sos' ? (
                        userReports.sos.length === 0 ? (
                            <div className="empty-reports">
                                <span>🛡️</span>
                                <p>No SOS alerts yet - stay safe!</p>
                            </div>
                        ) : (
                            userReports.sos.map(report => (
                                <div key={report.id} className="report-item sos">
                                    <div className="report-icon">
                                        {report.type === 'police' ? '👮' : report.type === 'ambulance' ? '🚑' : '🚒'}
                                    </div>
                                    <div className="report-details">
                                        <div className="report-title">
                                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Alert
                                            <span className={`status-badge ${report.status}`}>
                                                {STATUS_CONFIG[report.status]?.icon} {STATUS_CONFIG[report.status]?.label}
                                            </span>
                                        </div>
                                        <div className="report-meta">
                                            <span>📍 {report.location?.address || 'Location shared'}</span>
                                            <span>🕐 {formatDate(report.timestamp)}</span>
                                        </div>

                                        {report.evidence && (
                                            <div className="report-evidence-preview" style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                background: 'rgba(239, 68, 68, 0.05)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(239, 68, 68, 0.1)'
                                            }}>
                                                <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                                                    {report.evidence.imageUrls?.slice(0, 4).map((url, i) => (
                                                        <img key={i} src={url} alt="Evidence" style={{ width: '35px', height: '35px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    ))}
                                                    {report.evidence.imageUrls?.length > 4 && (
                                                        <div style={{ width: '35px', height: '35px', background: 'var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                            +{report.evidence.imageUrls.length - 4}
                                                        </div>
                                                    )}
                                                </div>

                                                {report.evidence.audioUrl && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Voice Evidence:
                                                        </span>
                                                        <AudioEvidencePlayer src={report.evidence.audioUrl} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Tracker */}
                                    <div className="status-tracker">
                                        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([key, config]) => {
                                            const currentStep = STATUS_CONFIG[report.status]?.step || 1
                                            const isCompleted = config.step <= currentStep
                                            const isCurrent = config.step === currentStep

                                            return (
                                                <div
                                                    key={key}
                                                    className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                                >
                                                    <div className="step-dot">{config.icon}</div>
                                                    <span className="step-label">{config.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        userReports.community.length === 0 ? (
                            <div className="empty-reports">
                                <span>📋</span>
                                <p>You haven't reported any community issues yet</p>
                                <Link to="/report" className="btn btn-primary">Report an Issue</Link>
                            </div>
                        ) : (
                            userReports.community.map(issue => (
                                <div key={issue.id} className="report-item community">
                                    {issue.image && (
                                        <img src={issue.image} alt="" className="report-thumb" />
                                    )}
                                    <div className="report-details">
                                        <div className="report-title">
                                            {issue.title}
                                            <span className={`status-badge ${issue.status}`}>
                                                {STATUS_CONFIG[issue.status]?.icon || '⏳'} {STATUS_CONFIG[issue.status]?.label || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="report-meta">
                                            <span>📍 {issue.location}</span>
                                            <span>🕐 {formatDate(issue.timestamp)}</span>
                                        </div>
                                        <div className="report-votes">
                                            <span>👍 {issue.upvotes}</span>
                                            <span>👎 {issue.downvotes}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Medical Info Card */}
            {user && (
                <div className="medical-info-card">
                    <div className="card-header">
                        <h3>🏥 Medical Information</h3>
                        <Link to="/profile" className="edit-link">Edit</Link>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Blood Group</span>
                            <span className="blood-badge">{user.bloodGroup || 'Not set'}</span>
                        </div>
                        {user.allergies && (
                            <div className="info-row warning">
                                <span className="info-label">⚠️ Allergies</span>
                                <span>{user.allergies}</span>
                            </div>
                        )}
                        <div className="info-row">
                            <span className="info-label">Emergency Contacts</span>
                            <span>{user.contacts?.length || 0} contacts</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard

import { useState } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import LocationMap from '../components/LocationMap/LocationMap'
import { useAuth } from '../context/AuthContext'
import { EMERGENCY_SERVICES, STATUS_CONFIG } from '../utils/constants'

function FireAdmin() {
    const { sosReports, updateSOSStatus, getStats } = useReports()
    const { user } = useAuth()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [selectedReport, setSelectedReport] = useState(null)

    // Filter only fire-related reports
    const fireReports = sosReports.filter(r => r.type === 'fire' || r.assignedTo === 'fire')
    
    const filteredReports = filter === 'all'
        ? fireReports
        : fireReports.filter(r => r.status === filter)

    const handleStatusChange = async (reportId, newStatus) => {
        await updateSOSStatus(reportId, newStatus)
        toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label}`)
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return date.toLocaleDateString()
    }

    const pendingCount = fireReports.filter(r => r.status === 'submitted' || r.status === 'assigned').length
    const inProgressCount = fireReports.filter(r => r.status === 'in-progress').length
    const completedCount = fireReports.filter(r => r.status === 'completed').length

    return (
        <div className="admin-dashboard fire-admin">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>🚒</span>
                    <div>
                        <h1 className="page-title">Fire & Rescue Control Center</h1>
                        <p className="page-subtitle">
                            Welcome, {user?.name} • {user?.department || 'Fire Department'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="admin-stat-card urgent" style={{ borderColor: '#f97316' }}>
                    <div className="stat-icon-large">🔥</div>
                    <div className="stat-info">
                        <div className="stat-number">{pendingCount}</div>
                        <div className="stat-label">Active Fires</div>
                    </div>
                    <div className="stat-pulse" style={{ background: '#f97316' }}></div>
                </div>

                <div className="admin-stat-card active">
                    <div className="stat-icon-large">🚒</div>
                    <div className="stat-info">
                        <div className="stat-number">{inProgressCount}</div>
                        <div className="stat-label">Units Deployed</div>
                    </div>
                </div>

                <div className="admin-stat-card success">
                    <div className="stat-icon-large">✓</div>
                    <div className="stat-info">
                        <div className="stat-number">{completedCount}</div>
                        <div className="stat-label">Fires Contained</div>
                    </div>
                </div>

                <div className="admin-stat-card info" style={{ borderColor: '#f97316' }}>
                    <div className="stat-icon-large">📋</div>
                    <div className="stat-info">
                        <div className="stat-number">{fireReports.length}</div>
                        <div className="stat-label">Total Incidents</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="filter-group">
                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Filter:</span>
                    {[
                        { value: 'all', label: 'All Incidents', icon: '📋' },
                        { value: 'submitted', label: 'New', icon: '🆕' },
                        { value: 'assigned', label: 'Assigned', icon: '📌' },
                        { value: 'in-progress', label: 'Active', icon: '🔥' },
                        { value: 'completed', label: 'Contained', icon: '✅' }
                    ].map(f => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
                            style={filter === f.value ? { background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' } : {}}
                        >
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Grid */}
            <div className="admin-reports-grid">
                <div className="reports-list">
                    <h3 style={{
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>🔥</span> Fire Emergency Reports
                        <span className="live-indicator" style={{ background: '#f97316' }}></span>
                    </h3>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '3rem' }}>✅</span>
                            <p>No active fire emergencies</p>
                        </div>
                    ) : (
                        filteredReports.map(report => (
                            <div
                                key={report.id}
                                className={`admin-report-card fire ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReport(report)}
                                style={{ borderLeft: '4px solid #f97316' }}
                            >
                                <div className="report-header">
                                    <div className="report-type-badge" style={{
                                        background: EMERGENCY_SERVICES.fire.gradient
                                    }}>
                                        🔥 Fire Emergency
                                    </div>
                                    <span className={`status-badge ${report.status}`}>
                                        {STATUS_CONFIG[report.status]?.icon} {STATUS_CONFIG[report.status]?.label}
                                    </span>
                                </div>

                                <div className="report-body">
                                    <div className="report-user">
                                        <span style={{ fontSize: '1.5rem' }}>👤</span>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{report.userName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {report.target === 'myself' ? 'Personal Emergency' : 'Witness Report'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="report-location">
                                        <span>📍</span>
                                        <span>{report.location?.address || 'Location pending...'}</span>
                                    </div>

                                    <div className="report-time">
                                        <span>🕐</span>
                                        <span>{formatTime(report.timestamp)}</span>
                                    </div>

                                    {report.description && (
                                        <div className="report-description" style={{ 
                                            marginTop: '0.5rem', 
                                            padding: '0.5rem', 
                                            background: 'rgba(249, 115, 22, 0.1)', 
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid rgba(249, 115, 22, 0.3)'
                                        }}>
                                            🔥 {report.description}
                                        </div>
                                    )}
                                </div>

                                <div className="report-actions">
                                    {report.status === 'submitted' && (
                                        <button
                                            className="action-btn progress"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(report.id, 'assigned')
                                            }}
                                            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                                        >
                                            📋 Accept Alert
                                        </button>
                                    )}
                                    {report.status === 'assigned' && (
                                        <button
                                            className="action-btn progress"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(report.id, 'in-progress')
                                            }}
                                        >
                                            🚒 Deploy Fire Unit
                                        </button>
                                    )}
                                    {report.status === 'in-progress' && (
                                        <button
                                            className="action-btn progress"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(report.id, 'completed')
                                            }}
                                            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}
                                        >
                                            ✓ Fire Contained
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Report Detail Panel */}
                <div className="report-detail-panel">
                    {selectedReport ? (
                        <>
                            <div className="detail-header" style={{ borderBottom: '2px solid #f97316' }}>
                                <h3>🔥 Incident Details</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="detail-section">
                                <h4>📍 Incident Location</h4>
                                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                    <LocationMap key={selectedReport.id} location={selectedReport.location} height="200px" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {selectedReport.location?.address}
                                </p>
                            </div>

                            {selectedReport.description && (
                                <div className="detail-section" style={{
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(249, 115, 22, 0.3)'
                                }}>
                                    <h4>🔥 Incident Description</h4>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {selectedReport.description}
                                    </p>
                                </div>
                            )}

                            {selectedReport.evidence && (
                                <div className="detail-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                        📂 Evidence
                                    </h4>

                                    {selectedReport.evidence.audioUrl && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Voice Recording:</p>
                                            <AudioEvidencePlayer src={selectedReport.evidence.audioUrl} />
                                        </div>
                                    )}

                                    {selectedReport.evidence.imageUrls?.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Images ({selectedReport.evidence.imageUrls.length}):</p>
                                            <div className="evidence-grid" style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                gap: '8px'
                                            }}>
                                                {selectedReport.evidence.imageUrls.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={url}
                                                            alt={`Evidence ${i + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                objectFit: 'cover',
                                                                border: '1px solid var(--border)'
                                                            }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>📊 Response Timeline</h4>
                                <div className="status-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot" style={{ background: '#f97316' }}></div>
                                        <div className="timeline-content">
                                            <span>Fire Alert Received</span>
                                            <span className="timeline-time">{formatTime(selectedReport.timestamp)}</span>
                                        </div>
                                    </div>
                                    {selectedReport.status !== 'submitted' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#f97316' }}></div>
                                            <div className="timeline-content">
                                                <span>Alert Acknowledged</span>
                                            </div>
                                        </div>
                                    )}
                                    {(selectedReport.status === 'in-progress' || selectedReport.status === 'completed') && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#f59e0b' }}></div>
                                            <div className="timeline-content">
                                                <span>Fire Unit Deployed</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedReport.status === 'completed' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#22c55e' }}></div>
                                            <div className="timeline-content">
                                                <span>Fire Contained & Secured</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="detail-empty">
                            <span style={{ fontSize: '3rem' }}>🚒</span>
                            <p>Select an incident to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FireAdmin

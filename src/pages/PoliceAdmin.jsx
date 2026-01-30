import { useState } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import LocationMap from '../components/LocationMap/LocationMap'
import { useAuth } from '../context/AuthContext'
import { EMERGENCY_SERVICES, STATUS_CONFIG } from '../utils/constants'

function PoliceAdmin() {
    const { sosReports, updateSOSStatus, getStats } = useReports()
    const { user } = useAuth()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [selectedReport, setSelectedReport] = useState(null)

    const stats = getStats()

    // Filter only police-related reports
    const policeReports = sosReports.filter(r => r.type === 'police' || r.assignedTo === 'police')
    
    const filteredReports = filter === 'all'
        ? policeReports
        : policeReports.filter(r => r.status === filter)

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

    const pendingCount = policeReports.filter(r => r.status === 'submitted' || r.status === 'assigned').length
    const inProgressCount = policeReports.filter(r => r.status === 'in-progress').length
    const completedCount = policeReports.filter(r => r.status === 'completed').length

    return (
        <div className="admin-dashboard police-admin">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>👮</span>
                    <div>
                        <h1 className="page-title">Police Control Center</h1>
                        <p className="page-subtitle">
                            Welcome, {user?.name} • {user?.department || 'Police Department'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="admin-stat-card urgent" style={{ borderColor: '#3b82f6' }}>
                    <div className="stat-icon-large">🚨</div>
                    <div className="stat-info">
                        <div className="stat-number">{pendingCount}</div>
                        <div className="stat-label">Pending Cases</div>
                    </div>
                    <div className="stat-pulse" style={{ background: '#3b82f6' }}></div>
                </div>

                <div className="admin-stat-card active">
                    <div className="stat-icon-large">🔄</div>
                    <div className="stat-info">
                        <div className="stat-number">{inProgressCount}</div>
                        <div className="stat-label">Active Response</div>
                    </div>
                </div>

                <div className="admin-stat-card success">
                    <div className="stat-icon-large">✓</div>
                    <div className="stat-info">
                        <div className="stat-number">{completedCount}</div>
                        <div className="stat-label">Resolved Today</div>
                    </div>
                </div>

                <div className="admin-stat-card info" style={{ borderColor: '#3b82f6' }}>
                    <div className="stat-icon-large">📋</div>
                    <div className="stat-info">
                        <div className="stat-number">{policeReports.length}</div>
                        <div className="stat-label">Total Cases</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="filter-group">
                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Filter:</span>
                    {[
                        { value: 'all', label: 'All Cases', icon: '📋' },
                        { value: 'submitted', label: 'New', icon: '🆕' },
                        { value: 'assigned', label: 'Assigned', icon: '📌' },
                        { value: 'in-progress', label: 'Active', icon: '🔄' },
                        { value: 'completed', label: 'Resolved', icon: '✅' }
                    ].map(f => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
                            style={filter === f.value ? { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' } : {}}
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
                        <span>👮</span> Police Emergency Reports
                        <span className="live-indicator" style={{ background: '#3b82f6' }}></span>
                    </h3>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '3rem' }}>✅</span>
                            <p>No pending police reports</p>
                        </div>
                    ) : (
                        filteredReports.map(report => (
                            <div
                                key={report.id}
                                className={`admin-report-card police ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReport(report)}
                                style={{ borderLeft: '4px solid #3b82f6' }}
                            >
                                <div className="report-header">
                                    <div className="report-type-badge" style={{
                                        background: EMERGENCY_SERVICES.police.gradient
                                    }}>
                                        👮 Police Emergency
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
                                                {report.target === 'myself' ? 'Personal Emergency' : 'Reporting for Others'}
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
                                            background: 'var(--bg-glass)', 
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {report.description}
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
                                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                                        >
                                            📋 Accept Case
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
                                            🚔 Dispatch Unit
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
                                            ✓ Case Resolved
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
                            <div className="detail-header" style={{ borderBottom: '2px solid #3b82f6' }}>
                                <h3>👮 Case Details</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="detail-section">
                                <h4>📍 Location</h4>
                                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                    <LocationMap key={selectedReport.id} location={selectedReport.location} height="200px" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {selectedReport.location?.address}
                                </p>
                            </div>

                            {selectedReport.description && (
                                <div className="detail-section">
                                    <h4>📝 Case Description</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>
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
                                <h4>📊 Case Timeline</h4>
                                <div className="status-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot" style={{ background: '#3b82f6' }}></div>
                                        <div className="timeline-content">
                                            <span>Report Received</span>
                                            <span className="timeline-time">{formatTime(selectedReport.timestamp)}</span>
                                        </div>
                                    </div>
                                    {selectedReport.status !== 'submitted' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#3b82f6' }}></div>
                                            <div className="timeline-content">
                                                <span>Case Assigned to Police</span>
                                            </div>
                                        </div>
                                    )}
                                    {(selectedReport.status === 'in-progress' || selectedReport.status === 'completed') && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#f59e0b' }}></div>
                                            <div className="timeline-content">
                                                <span>Unit Dispatched</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedReport.status === 'completed' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#22c55e' }}></div>
                                            <div className="timeline-content">
                                                <span>Case Resolved</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="detail-empty">
                            <span style={{ fontSize: '3rem' }}>👮</span>
                            <p>Select a case to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PoliceAdmin

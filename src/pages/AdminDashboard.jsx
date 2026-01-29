import { useState } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import { useAuth } from '../context/AuthContext'
import { EMERGENCY_SERVICES, STATUS_CONFIG } from '../utils/constants'

function AdminDashboard() {
    const { sosReports, communityIssues, updateSOSStatus, assignSOS, getStats } = useReports()
    const { user } = useAuth()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [selectedReport, setSelectedReport] = useState(null)

    const stats = getStats()

    const filteredReports = filter === 'all'
        ? sosReports
        : sosReports.filter(r => r.type === filter || r.status === filter)

    const handleAssign = async (reportId, department) => {
        await assignSOS(reportId, department)
        toast.success(`Report assigned to ${EMERGENCY_SERVICES[department]?.title || department}`)
    }

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

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>🛡️</span>
                    <div>
                        <h1 className="page-title">Admin Control Center</h1>
                        <p className="page-subtitle">
                            Welcome, {user?.name} • {user?.department || 'Emergency Response'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="admin-stat-card urgent">
                    <div className="stat-icon-large">🛡️</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.pendingSOS}</div>
                        <div className="stat-label">Pending SOS</div>
                    </div>
                    <div className="stat-pulse"></div>
                </div>

                <div className="admin-stat-card active">
                    <div className="stat-icon-large">🔄</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.inProgressSOS}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>

                <div className="admin-stat-card success">
                    <div className="stat-icon-large">✓</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.completedSOS}</div>
                        <div className="stat-label">Resolved Today</div>
                    </div>
                </div>

                <div className="admin-stat-card info">
                    <div className="stat-icon-large">📋</div>
                    <div className="stat-info">
                        <div className="stat-number">{stats.totalCommunity}</div>
                        <div className="stat-label">Community Issues</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="filter-group">
                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Filter:</span>
                    {[
                        { value: 'all', label: 'All Reports', icon: '📋' },
                        { value: 'submitted', label: 'Pending', icon: '⏳' },
                        { value: 'police', label: 'Police', icon: '👮' },
                        { value: 'ambulance', label: 'Medical', icon: '🚑' },
                        { value: 'fire', label: 'Fire', icon: '🚒' }
                    ].map(f => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
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
                        <span>📍</span> Live SOS Reports
                        <span className="live-indicator"></span>
                    </h3>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '3rem' }}>✅</span>
                            <p>No pending reports</p>
                        </div>
                    ) : (
                        filteredReports.map(report => (
                            <div
                                key={report.id}
                                className={`admin-report-card ${report.type} ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="report-header">
                                    <div className="report-type-badge" style={{
                                        background: EMERGENCY_SERVICES[report.type]?.gradient
                                    }}>
                                        {EMERGENCY_SERVICES[report.type]?.icon} {EMERGENCY_SERVICES[report.type]?.title}
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
                                </div>

                                {report.status === 'submitted' && (
                                    <div className="report-actions">
                                        <button
                                            className="action-btn police"
                                            onClick={(e) => { e.stopPropagation(); handleAssign(report.id, 'police') }}
                                        >
                                            👮 Police
                                        </button>
                                        <button
                                            className="action-btn ambulance"
                                            onClick={(e) => { e.stopPropagation(); handleAssign(report.id, 'ambulance') }}
                                        >
                                            🚑 Ambulance
                                        </button>
                                        <button
                                            className="action-btn fire"
                                            onClick={(e) => { e.stopPropagation(); handleAssign(report.id, 'fire') }}
                                        >
                                            🚒 Fire
                                        </button>
                                    </div>
                                )}

                                {(report.status === 'assigned' || report.status === 'in-progress') && (
                                    <div className="report-actions">
                                        <button
                                            className="action-btn progress"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(report.id, report.status === 'assigned' ? 'in-progress' : 'completed')
                                            }}
                                        >
                                            {report.status === 'assigned' ? '🔄 Start Response' : '✓ Mark Complete'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Report Detail Panel */}
                <div className="report-detail-panel">
                    {selectedReport ? (
                        <>
                            <div className="detail-header">
                                <h3>Report Details</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="detail-section">
                                <h4>📍 Location</h4>
                                <div className="map-placeholder">
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        background: 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {selectedReport.location?.address}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            Lat: {selectedReport.location?.lat?.toFixed(4)},
                                            Lng: {selectedReport.location?.lng?.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedReport.medicalInfo && (
                                <div className="detail-section">
                                    <h4>🏥 Medical Information</h4>
                                    <div className="medical-info">
                                        <div className="info-row">
                                            <span>Blood Group:</span>
                                            <span className="blood-badge">{selectedReport.medicalInfo.bloodGroup}</span>
                                        </div>
                                        {selectedReport.medicalInfo.conditions?.length > 0 && (
                                            <div className="info-row">
                                                <span>Conditions:</span>
                                                <div className="condition-tags">
                                                    {selectedReport.medicalInfo.conditions.map(c => (
                                                        <span key={c} className="condition-tag">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedReport.medicalInfo.allergies && (
                                            <div className="info-row alert">
                                                <span>⚠️ Allergies:</span>
                                                <span>{selectedReport.medicalInfo.allergies}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport.description && (
                                <div className="detail-section">
                                    <h4>📝 Description</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {selectedReport.description}
                                    </p>
                                </div>
                            )}

                            {selectedReport.evidence && (
                                <div className="detail-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                        📂 Multimedia Evidence
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
                                                                border: '1px solid var(--border)',
                                                                transition: 'transform 0.2s ease'
                                                            }}
                                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>📊 Status History</h4>
                                <div className="status-timeline">
                                    <div className="timeline-item completed">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <span>Report Submitted</span>
                                            <span className="timeline-time">{formatTime(selectedReport.timestamp)}</span>
                                        </div>
                                    </div>
                                    {selectedReport.assignedTo && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <span>Assigned to {EMERGENCY_SERVICES[selectedReport.assignedTo]?.title}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="detail-empty">
                            <span style={{ fontSize: '3rem' }}>👆</span>
                            <p>Select a report to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard

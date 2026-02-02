import { useState, useEffect, useRef } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import LocationMap from '../components/LocationMap/LocationMap'
import { useAuth } from '../context/AuthContext'
import { EMERGENCY_SERVICES, STATUS_CONFIG } from '../utils/constants'

function AdminDashboard() {
    const { sosReports, communityIssues, updateSOSStatus, assignSOS, getStats } = useReports()
    const { user } = useAuth()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [selectedReportId, setSelectedReportId] = useState(null)
    const [quickViewReport, setQuickViewReport] = useState(null)
    const lastReportIdRef = useRef(null)

    // Derived: Get the full report object from the live context array
    const selectedReport = sosReports.find(r => r.id === selectedReportId)

    // Auto-select newest report when it arrives
    useEffect(() => {
        if (sosReports.length > 0) {
            const latestReport = sosReports[0]
            if (latestReport.id !== lastReportIdRef.current) {
                setSelectedReportId(latestReport.id)
                lastReportIdRef.current = latestReport.id
            }
        }
    }, [sosReports])

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
                    <div className="stat-icon-large">🆘</div>
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
                    <div className="stat-icon-large">✅</div>
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
                        { value: 'all', label: 'All Reports' },
                        { value: 'submitted', label: 'Pending' },
                        { value: 'police', label: 'Police' },
                        { value: 'ambulance', label: 'Medical' },
                        { value: 'fire', label: 'Fire' }
                    ].map(f => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
                        >
                            {/* <span>{f.icon}</span> */}
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
                                className={`admin-report-card ${report.type} ${selectedReportId === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReportId(report.id)}
                            >
                                <div className="report-header">
                                    <div className="report-type-badge" style={{
                                        background: EMERGENCY_SERVICES[report.type]?.gradient
                                    }}>
                                        {EMERGENCY_SERVICES[report.type]?.icon} {EMERGENCY_SERVICES[report.type]?.title}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setQuickViewReport(report)
                                        }}
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            border: '1px solid rgba(99, 102, 241, 0.4)',
                                            color: 'var(--primary)',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        🤖 Details
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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
                                            {report.status === 'assigned' ? 'Start Response' : 'Mark Complete'}
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
                                <div>
                                    <h3 style={{ margin: 0 }}>Report Details</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Registered: {new Date(selectedReport.timestamp).toLocaleString(undefined, {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedReportId(null)}
                                >
                                    Close
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

                            {/* User Profile - Basic Info Only */}
                            {selectedReport.userProfile && (
                                <div className="detail-section">
                                    <h4>👤 User Details</h4>
                                    <div className="user-profile-info" style={{ 
                                        background: 'var(--bg-glass)', 
                                        padding: '1rem', 
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                                            <span style={{ fontWeight: 600 }}>{selectedReport.userProfile.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Mobile:</span>
                                            <a href={`tel:${selectedReport.userProfile.mobile}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                📞 {selectedReport.userProfile.mobile}
                                            </a>
                                        </div>
                                        {selectedReport.userProfile.gender && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Gender:</span>
                                                <span style={{ textTransform: 'capitalize' }}>{selectedReport.userProfile.gender}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setQuickViewReport(selectedReport)}
                                        style={{
                                            width: '100%',
                                            marginTop: '0.75rem',
                                            padding: '0.6rem 1rem',
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                            border: '1px solid rgba(99, 102, 241, 0.4)',
                                            color: 'var(--primary)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        🤖 View Health Summary & Contacts
                                    </button>
                                </div>
                            )}

                            {selectedReport.evidence && (
                                <div className="detail-section">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                        Multimedia Evidence
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
                        </>
                    ) : (
                        <div className="detail-empty">
                            <span style={{ fontSize: '3rem' }}>👆</span>
                            <p>Select a report to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            {quickViewReport && (
                <div 
                    className="quick-view-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setQuickViewReport(null)}
                >
                    <div 
                        className="quick-view-modal"
                        style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            maxWidth: '400px',
                            width: '100%',
                            border: '1px solid var(--border)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'modalSlideIn 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: EMERGENCY_SERVICES[quickViewReport.type]?.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem'
                                }}>
                                    {EMERGENCY_SERVICES[quickViewReport.type]?.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{quickViewReport.userName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {EMERGENCY_SERVICES[quickViewReport.type]?.title} Emergency
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setQuickViewReport(null)}
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.25rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* AI Summary */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                marginBottom: '0.5rem',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}>
                                <span>🤖</span> AI Health Summary
                            </div>
                            <p style={{ 
                                color: 'var(--text-primary)', 
                                fontSize: '0.95rem', 
                                lineHeight: 1.6,
                                margin: 0
                            }}>
                                {quickViewReport.userProfile?.emergencySummary || 
                                 `${quickViewReport.userName}, Blood Group: ${quickViewReport.medicalInfo?.bloodGroup || 'Unknown'}. ${quickViewReport.medicalInfo?.conditions?.length > 0 ? `Conditions: ${quickViewReport.medicalInfo.conditions.join(', ')}.` : 'No known conditions.'} ${quickViewReport.medicalInfo?.allergies && quickViewReport.medicalInfo.allergies !== 'None reported' ? `Allergies: ${quickViewReport.medicalInfo.allergies}.` : ''}`}
                            </p>
                        </div>

                        {/* Medical Information */}
                        {quickViewReport.medicalInfo && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    marginBottom: '0.75rem',
                                    color: '#ef4444',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    <span>🏥</span> Medical Information
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Blood Group:</span>
                                    <span style={{ 
                                        background: '#ef4444', 
                                        color: 'white', 
                                        padding: '0.15rem 0.5rem', 
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700
                                    }}>{quickViewReport.medicalInfo.bloodGroup}</span>
                                </div>
                                {quickViewReport.medicalInfo.conditions?.length > 0 && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Conditions: </span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                            {quickViewReport.medicalInfo.conditions.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {quickViewReport.medicalInfo.allergies && quickViewReport.medicalInfo.allergies !== 'None reported' && (
                                    <div style={{ 
                                        background: '#f59e0b', 
                                        color: 'white', 
                                        padding: '0.5rem 0.75rem', 
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        marginTop: '0.5rem'
                                    }}>
                                        ⚠️ Allergies: {quickViewReport.medicalInfo.allergies}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Emergency Contacts */}
                        {quickViewReport.userProfile?.emergencyContacts?.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    <span>📱</span> Emergency Contacts
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {quickViewReport.userProfile.emergencyContacts.map((contact, i) => (
                                        <div key={i} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            padding: '0.5rem 0.75rem',
                                            background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{contact.relation || 'Contact'}</div>
                                            </div>
                                            <a href={`tel:${contact.phone}`} style={{ 
                                                background: 'var(--success)', 
                                                color: 'white', 
                                                padding: '0.35rem 0.75rem', 
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                textDecoration: 'none'
                                            }}>
                                                📞 {contact.phone}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Button - Only Assign */}
                        {quickViewReport.status === 'submitted' && (
                            <button
                                onClick={() => {
                                    handleAssign(quickViewReport.id, quickViewReport.type)
                                    setQuickViewReport(null)
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: EMERGENCY_SERVICES[quickViewReport.type]?.gradient,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Assign to {EMERGENCY_SERVICES[quickViewReport.type]?.title}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard

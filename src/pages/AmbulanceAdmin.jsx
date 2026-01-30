import { useState } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import AudioEvidencePlayer from '../components/AudioEvidencePlayer'
import LocationMap from '../components/LocationMap/LocationMap'
import { useAuth } from '../context/AuthContext'
import { EMERGENCY_SERVICES, STATUS_CONFIG } from '../utils/constants'

function AmbulanceAdmin() {
    const { sosReports, updateSOSStatus, getStats } = useReports()
    const { user } = useAuth()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [selectedReport, setSelectedReport] = useState(null)

    // Filter only ambulance/medical-related reports
    const ambulanceReports = sosReports.filter(r => r.type === 'ambulance' || r.assignedTo === 'ambulance')
    
    const filteredReports = filter === 'all'
        ? ambulanceReports
        : ambulanceReports.filter(r => r.status === filter)

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

    const pendingCount = ambulanceReports.filter(r => r.status === 'submitted' || r.status === 'assigned').length
    const inProgressCount = ambulanceReports.filter(r => r.status === 'in-progress').length
    const completedCount = ambulanceReports.filter(r => r.status === 'completed').length

    return (
        <div className="admin-dashboard ambulance-admin">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>🚑</span>
                    <div>
                        <h1 className="page-title">Ambulance Control Center</h1>
                        <p className="page-subtitle">
                            Welcome, {user?.name} • {user?.department || 'Medical Emergency Services'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="admin-stat-card urgent" style={{ borderColor: '#ef4444' }}>
                    <div className="stat-icon-large">🆘</div>
                    <div className="stat-info">
                        <div className="stat-number">{pendingCount}</div>
                        <div className="stat-label">Critical Calls</div>
                    </div>
                    <div className="stat-pulse" style={{ background: '#ef4444' }}></div>
                </div>

                <div className="admin-stat-card active">
                    <div className="stat-icon-large">🚑</div>
                    <div className="stat-info">
                        <div className="stat-number">{inProgressCount}</div>
                        <div className="stat-label">En Route</div>
                    </div>
                </div>

                <div className="admin-stat-card success">
                    <div className="stat-icon-large">✓</div>
                    <div className="stat-info">
                        <div className="stat-number">{completedCount}</div>
                        <div className="stat-label">Patients Served</div>
                    </div>
                </div>

                <div className="admin-stat-card info" style={{ borderColor: '#ef4444' }}>
                    <div className="stat-icon-large">🏥</div>
                    <div className="stat-info">
                        <div className="stat-number">{ambulanceReports.length}</div>
                        <div className="stat-label">Total Emergencies</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
                <div className="filter-group">
                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Filter:</span>
                    {[
                        { value: 'all', label: 'All Calls', icon: '📋' },
                        { value: 'submitted', label: 'New', icon: '🆕' },
                        { value: 'assigned', label: 'Assigned', icon: '📌' },
                        { value: 'in-progress', label: 'En Route', icon: '🚑' },
                        { value: 'completed', label: 'Completed', icon: '✅' }
                    ].map(f => (
                        <button
                            key={f.value}
                            className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                            onClick={() => setFilter(f.value)}
                            style={filter === f.value ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' } : {}}
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
                        <span>🚑</span> Medical Emergency Calls
                        <span className="live-indicator" style={{ background: '#ef4444' }}></span>
                    </h3>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: '3rem' }}>✅</span>
                            <p>No pending medical emergencies</p>
                        </div>
                    ) : (
                        filteredReports.map(report => (
                            <div
                                key={report.id}
                                className={`admin-report-card ambulance ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => setSelectedReport(report)}
                                style={{ borderLeft: '4px solid #ef4444' }}
                            >
                                <div className="report-header">
                                    <div className="report-type-badge" style={{
                                        background: EMERGENCY_SERVICES.ambulance.gradient
                                    }}>
                                        🚑 Medical Emergency
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
                                                {report.target === 'myself' ? 'Patient Self-Report' : 'Third Party Report'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Info Badge */}
                                    {report.medicalInfo && (
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '0.5rem', 
                                            flexWrap: 'wrap',
                                            marginTop: '0.5rem'
                                        }}>
                                            {report.medicalInfo.bloodGroup && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    🩸 {report.medicalInfo.bloodGroup}
                                                </span>
                                            )}
                                            {report.medicalInfo.allergies && (
                                                <span style={{
                                                    background: '#f59e0b',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    ⚠️ Allergies
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="report-location">
                                        <span>📍</span>
                                        <span>{report.location?.address || 'Location pending...'}</span>
                                    </div>

                                    <div className="report-time">
                                        <span>🕐</span>
                                        <span>{formatTime(report.timestamp)}</span>
                                    </div>
                                </div>

                                <div className="report-actions">
                                    {report.status === 'submitted' && (
                                        <button
                                            className="action-btn progress"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(report.id, 'assigned')
                                            }}
                                            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                                        >
                                            📋 Accept Call
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
                                            🚑 Dispatch Ambulance
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
                                            ✓ Patient Delivered
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
                            <div className="detail-header" style={{ borderBottom: '2px solid #ef4444' }}>
                                <h3>🏥 Patient Details</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="detail-section">
                                <h4>📍 Pickup Location</h4>
                                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                    <LocationMap key={selectedReport.id} location={selectedReport.location} height="200px" />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {selectedReport.location?.address}
                                </p>
                            </div>

                            {selectedReport.medicalInfo && (
                                <div className="detail-section" style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    padding: '1rem', 
                                    borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    <h4>🏥 Critical Medical Information</h4>
                                    <div className="medical-info" style={{ marginTop: '1rem' }}>
                                        <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>Blood Group:</span>
                                            <span className="blood-badge" style={{ 
                                                background: '#ef4444', 
                                                color: 'white', 
                                                padding: '0.25rem 0.75rem', 
                                                borderRadius: '20px',
                                                fontWeight: 700,
                                                fontSize: '1rem'
                                            }}>{selectedReport.medicalInfo.bloodGroup}</span>
                                        </div>
                                        {selectedReport.medicalInfo.conditions?.length > 0 && (
                                            <div className="info-row" style={{ marginBottom: '0.5rem' }}>
                                                <span>Medical Conditions:</span>
                                                <div className="condition-tags" style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                                    {selectedReport.medicalInfo.conditions.map(c => (
                                                        <span key={c} className="condition-tag" style={{
                                                            background: 'rgba(239, 68, 68, 0.2)',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem'
                                                        }}>{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedReport.medicalInfo.allergies && (
                                            <div className="info-row alert" style={{ 
                                                background: '#f59e0b', 
                                                color: 'white', 
                                                padding: '0.75rem', 
                                                borderRadius: '8px',
                                                marginTop: '0.5rem'
                                            }}>
                                                <span style={{ fontWeight: 700 }}>⚠️ ALLERGIES:</span>
                                                <span style={{ marginLeft: '0.5rem' }}>{selectedReport.medicalInfo.allergies}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedReport.description && (
                                <div className="detail-section">
                                    <h4>📝 Emergency Description</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {selectedReport.description}
                                    </p>
                                </div>
                            )}

                            {/* User Profile & Emergency Contacts */}
                            {selectedReport.userProfile && (
                                <div className="detail-section">
                                    <h4>👤 Patient Profile</h4>
                                    <div style={{ 
                                        background: 'var(--bg-glass)', 
                                        padding: '1rem', 
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                                            <span style={{ fontWeight: 600 }}>{selectedReport.userProfile.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Mobile:</span>
                                            <a href={`tel:${selectedReport.userProfile.mobile}`} style={{ color: '#ef4444', fontWeight: 600 }}>
                                                📞 {selectedReport.userProfile.mobile}
                                            </a>
                                        </div>
                                        {selectedReport.userProfile.dob && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>DOB:</span>
                                                <span>{new Date(selectedReport.userProfile.dob).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {selectedReport.userProfile.gender && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Gender:</span>
                                                <span style={{ textTransform: 'capitalize' }}>{selectedReport.userProfile.gender}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedReport.userProfile.emergencySummary && (
                                        <div style={{ 
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            padding: '1rem', 
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem'
                                        }}>
                                            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: 600 }}>
                                                🤖 AI Medical Summary
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {selectedReport.userProfile.emergencySummary}
                                            </p>
                                        </div>
                                    )}

                                    {selectedReport.userProfile.emergencyContacts?.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                📱 Emergency Contacts
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {selectedReport.userProfile.emergencyContacts.map((contact, i) => (
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
                                                            background: '#ef4444', 
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
                                        <div className="timeline-dot" style={{ background: '#ef4444' }}></div>
                                        <div className="timeline-content">
                                            <span>Emergency Call Received</span>
                                            <span className="timeline-time">{formatTime(selectedReport.timestamp)}</span>
                                        </div>
                                    </div>
                                    {selectedReport.status !== 'submitted' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#ef4444' }}></div>
                                            <div className="timeline-content">
                                                <span>Call Assigned</span>
                                            </div>
                                        </div>
                                    )}
                                    {(selectedReport.status === 'in-progress' || selectedReport.status === 'completed') && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#f59e0b' }}></div>
                                            <div className="timeline-content">
                                                <span>Ambulance Dispatched</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedReport.status === 'completed' && (
                                        <div className="timeline-item completed">
                                            <div className="timeline-dot" style={{ background: '#22c55e' }}></div>
                                            <div className="timeline-content">
                                                <span>Patient Delivered to Hospital</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="detail-empty">
                            <span style={{ fontSize: '3rem' }}>🚑</span>
                            <p>Select an emergency to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AmbulanceAdmin

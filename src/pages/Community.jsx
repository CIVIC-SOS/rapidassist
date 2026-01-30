import { useState } from 'react'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'

function Community() {
    const { communityIssues, voteOnIssue, getUserVote } = useReports()
    const toast = useToast()
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('votes')
    const [selectedIssue, setSelectedIssue] = useState(null)

    const filteredIssues = communityIssues
        .filter(issue => filter === 'all' || issue.status === filter)
        .sort((a, b) => {
            if (sortBy === 'votes') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
            if (sortBy === 'recent') return new Date(b.timestamp) - new Date(a.timestamp)
            return 0
        })

    const handleVote = async (issueId, voteType, e) => {
        e.stopPropagation()
        await voteOnIssue(issueId, voteType)
    }

    const filterOptions = [
        { value: 'all', label: 'All Issues' },
        { value: 'submitted', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ]

    const statusLabels = {
        completed: { label: 'RESOLVED', icon: '✅', color: '#10b981', bg: '#ecfdf5' },
        'in-progress': { label: 'IN PROGRESS', icon: '🚧', color: '#3b82f6', bg: '#eff6ff' },
        rejected: { label: 'REJECTED', icon: '❌', color: '#ef4444', bg: '#fef2f2' },
        submitted: { label: 'PENDING REVIEW', icon: '⏳', color: '#f59e0b', bg: '#fffbeb' }
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date

        if (diff < 86400000) return 'Today'
        if (diff < 172800000) return 'Yesterday'
        return date.toLocaleDateString()
    }

    const stats = {
        total: communityIssues.length,
        pending: communityIssues.filter(i => i.status === 'submitted').length,
        inProgress: communityIssues.filter(i => i.status === 'in-progress').length,
        resolved: communityIssues.filter(i => i.status === 'completed').length
    }

    return (
        <div className="community-page">
            <div className="page-header">
                <h1 className="page-title">Community Issues</h1>
                <p className="page-subtitle">
                    View and support issues reported by the community. Your votes help prioritize resolutions.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="community-controls">
                <div className="filter-tabs">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            className={`filter-tab ${filter === option.value ? 'active' : ''}`}
                            onClick={() => setFilter(option.value)}
                        >
                            <span></span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>

                <div className="sort-control">
                    <label>Sort:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="votes">Most Votes</option>
                        <option value="recent">Most Recent</option>
                    </select>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="community-stats">
                <div className="stat-item">
                    <span className="stat-value">{stats.total}</span> Total Issues
                </div>
                <div className="stat-item">
                    <span className="stat-value warning">{stats.pending}</span> <span className="text-warning">Pending</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value info">{stats.inProgress}</span> <span className="text-info">In Progress</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value success">{stats.resolved}</span> <span className="text-success">Resolved</span>
                </div>
            </div>

            {/* Issues Grid */}
            <div className="community-grid">
                {filteredIssues.length === 0 ? (
                    <div className="empty-state">
                        <span></span>
                        <p>No issues found with the selected filter</p>
                    </div>
                ) : (
                    filteredIssues.map((issue) => {
                        const userVote = getUserVote(issue.id)
                        const statusInfo = statusLabels[issue.status] || statusLabels.submitted

                        return (
                            <div
                                key={issue.id}
                                className="issue-card"
                                onClick={() => setSelectedIssue(issue)}
                                style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: '1px solid var(--neutral-800)',
                                    backdropFilter: 'blur(10px)',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                                    e.currentTarget.style.border = '1px solid var(--primary-500)'
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                    e.currentTarget.style.border = '1px solid var(--neutral-800)'
                                }}
                            >
                                {/* Card Image Header */}
                                <div style={{
                                    height: '200px',
                                    background: issue.image ? `url(${issue.image}) center/cover` : 'var(--neutral-800)',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid var(--neutral-800)'
                                }}>
                                    {!issue.image && <span style={{ fontSize: '3rem', opacity: 0.3 }}>📷</span>}

                                    {/* Status Badge Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: statusInfo.bg,
                                        color: statusInfo.color,
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <span>{statusInfo.icon}</span>
                                        {statusInfo.label}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem' }}>
                                    {/* Author & Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--neutral-700)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)'
                                        }}>
                                            {issue.userName?.charAt(0) || 'A'}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{issue.userName || 'Anonymous'}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(issue.timestamp)}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        lineHeight: 1.4
                                    }}>
                                        {issue.title}
                                    </h3>

                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '0.925rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {issue.description}
                                    </p>

                                    {/* Meta Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                        <span style={{
                                            background: 'var(--neutral-800)',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            border: '1px solid var(--neutral-700)'
                                        }}>
                                            🏢 {issue.category}
                                        </span>
                                        <span style={{
                                            background: 'var(--neutral-800)',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            border: '1px solid var(--neutral-700)'
                                        }}>
                                            📍 {issue.location?.slice(0, 20)}...
                                        </span>
                                    </div>

                                    {/* Action Footer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--neutral-800)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={(e) => handleVote(issue.id, 'up', e)}
                                                style={{
                                                    background: userVote === 'up' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                                    border: userVote === 'up' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                                                    color: userVote === 'up' ? '#60a5fa' : 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span>👍</span> {issue.upvotes || 0}
                                            </button>
                                            <button
                                                onClick={(e) => handleVote(issue.id, 'down', e)}
                                                style={{
                                                    background: userVote === 'down' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                                                    border: userVote === 'down' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent',
                                                    color: userVote === 'down' ? '#f87171' : 'var(--text-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span>👎</span> {issue.downvotes || 0}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Issue Detail Modal */}
            {selectedIssue && (
                <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedIssue(null)}>Close</button>

                        {selectedIssue.image && (
                            <img src={selectedIssue.image} alt={selectedIssue.title} className="modal-image" />
                        )}

                        <div className="modal-body">
                            <div className="modal-header">
                                <span className="issue-category">{selectedIssue.category}</span>
                                <span className={`issue-status ${statusLabels[selectedIssue.status]?.class}`}>
                                    {statusLabels[selectedIssue.status]?.label}
                                </span>
                            </div>

                            <h2>{selectedIssue.title}</h2>
                            <p className="modal-description">{selectedIssue.description}</p>

                            <div className="modal-location">
                                <span></span>
                                <span>{selectedIssue.location}</span>
                            </div>

                            <div className="modal-reporter">
                                <span className="reporter-avatar-lg">{selectedIssue.userName?.charAt(0)}</span>
                                <div>
                                    <div className="reporter-name">{selectedIssue.userName}</div>
                                    <div className="reporter-date">Reported on {new Date(selectedIssue.timestamp).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="modal-votes">
                                <button
                                    className={`vote-btn-lg upvote ${getUserVote(selectedIssue.id) === 'up' ? 'active' : ''}`}
                                    onClick={(e) => handleVote(selectedIssue.id, 'up', e)}
                                >
                                    <span></span>
                                    <span>Support ({selectedIssue.upvotes})</span>
                                </button>
                                <button
                                    className={`vote-btn-lg downvote ${getUserVote(selectedIssue.id) === 'down' ? 'active' : ''}`}
                                    onClick={(e) => handleVote(selectedIssue.id, 'down', e)}
                                >
                                    <span></span>
                                    <span>Not an issue ({selectedIssue.downvotes})</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Community

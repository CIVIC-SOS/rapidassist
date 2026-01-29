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
        toast.success(voteType === 'up' ? 'Upvoted!' : 'Downvoted')
    }

    const filterOptions = [
        { value: 'all', label: 'All Issues' },
        { value: 'submitted', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' }
    ]

    const statusLabels = {
        completed: { label: 'Completed', icon: '✓', class: 'completed' },
        submitted: { label: 'Pending', icon: '⏳', class: 'pending' },
        'in-progress': { label: 'In Progress', icon: '🔄', class: 'in-progress' }
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
                            >
                                {issue.image && (
                                    <div
                                        className="issue-image"
                                        style={{ backgroundImage: `url(${issue.image})` }}
                                    >
                                        <span className={`issue-status ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                )}

                                <div className="issue-content">
                                    <div className="issue-meta">
                                        <span className="issue-category">{issue.category}</span>
                                        <span className="issue-time">{formatTime(issue.timestamp)}</span>
                                    </div>

                                    <h3 className="issue-title">{issue.title}</h3>
                                    <p className="issue-description">{issue.description}</p>

                                    <div className="issue-location">
                                        <span></span>
                                        <span>{issue.location}</span>
                                    </div>

                                    <div className="issue-footer">
                                        <div className="issue-reporter">
                                            <span className="reporter-avatar">{issue.userName?.charAt(0)}</span>
                                            <span>{issue.userName}</span>
                                        </div>

                                        <div className="vote-buttons">
                                            <button
                                                className={`vote-btn upvote ${userVote === 'up' ? 'active' : ''}`}
                                                onClick={(e) => handleVote(issue.id, 'up', e)}
                                            >
                                                <span></span>
                                                <span>👍 {issue.upvotes}</span>
                                            </button>
                                            <button
                                                className={`vote-btn downvote ${userVote === 'down' ? 'active' : ''}`}
                                                onClick={(e) => handleVote(issue.id, 'down', e)}
                                            >
                                                <span></span>
                                                <span>👎 {issue.downvotes}</span>
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

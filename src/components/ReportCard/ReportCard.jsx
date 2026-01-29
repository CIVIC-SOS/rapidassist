function ReportCard({ report }) {
    const {
        id,
        image,
        category,
        title,
        description,
        location,
        status,
        upvotes = 0,
        downvotes = 0
    } = report

    const statusLabels = {
        completed: { label: 'Completed', icon: '✓' },
        pending: { label: 'Pending', icon: '⏳' },
        'in-progress': { label: 'In Progress', icon: '🔄' }
    }

    const statusInfo = statusLabels[status] || statusLabels.pending

    return (
        <div className="complaint-card">
            {image && (
                <div
                    className="complaint-image"
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            )}

            <div className="complaint-content">
                <div className="complaint-header">
                    <span className="complaint-category">{category}</span>
                    <span className={`complaint-status ${status}`}>
                        {statusInfo.icon} {statusInfo.label}
                    </span>
                </div>

                <h3 className="complaint-title">{title}</h3>
                <p className="complaint-description">{description}</p>

                <div className="complaint-meta">
                    <span className="complaint-location">
                        📍 {location}
                    </span>

                    <div className="complaint-votes">
                        <button className="vote-btn upvote">
                            👍 {upvotes}
                        </button>
                        <button className="vote-btn downvote">
                            👎 {downvotes}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportCard

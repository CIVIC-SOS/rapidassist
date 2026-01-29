function StatusTracker({ steps, currentStep }) {
    return (
        <div className="status-tracker">
            {steps.map((step, index) => (
                <>
                    <div
                        key={step.id}
                        className={`status-step ${index < currentStep ? 'completed' :
                                index === currentStep ? 'current' : ''
                            }`}
                    >
                        <div className="status-step-icon">
                            {index < currentStep ? '✓' : step.icon || (index + 1)}
                        </div>
                        <span className="status-step-label">{step.label}</span>
                    </div>

                    {index < steps.length - 1 && (
                        <div
                            className={`status-connector ${index < currentStep ? 'completed' : ''}`}
                        />
                    )}
                </>
            ))}
        </div>
    )
}

export default StatusTracker

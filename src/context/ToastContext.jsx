import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        const id = Date.now() + Math.random()
        const newToast = {
            id,
            type: 'info',
            duration: 4000,
            ...toast
        }

        setToasts(prev => [...prev, newToast])

        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const success = useCallback((message, options = {}) => {
        return addToast({ type: 'success', message, ...options })
    }, [addToast])

    const error = useCallback((message, options = {}) => {
        return addToast({ type: 'error', message, ...options })
    }, [addToast])

    const warning = useCallback((message, options = {}) => {
        return addToast({ type: 'warning', message, ...options })
    }, [addToast])

    const info = useCallback((message, options = {}) => {
        return addToast({ type: 'info', message, ...options })
    }, [addToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

function Toast({ toast, onRemove }) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    }

    return (
        <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onRemove(toast.id)}>
                ✕
            </button>
            {toast.duration > 0 && (
                <div
                    className="toast-progress"
                    style={{ animationDuration: `${toast.duration}ms` }}
                />
            )}
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export default ToastContext

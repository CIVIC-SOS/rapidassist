import { useState } from 'react'

function LoginForm({ onSubmit }) {
    const [loginMethod, setLoginMethod] = useState(null)
    const [formData, setFormData] = useState({
        aadhar: '',
        mobile: '',
        otp: '',
        adminId: '',
        password: ''
    })

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit && onSubmit(formData, loginMethod)
    }

    const renderLoginForm = () => {
        switch (loginMethod) {
            case 'aadhar':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Aadhar Number</label>
                            <input
                                type="text"
                                name="aadhar"
                                className="form-input"
                                placeholder="Enter 12-digit Aadhar number"
                                value={formData.aadhar}
                                onChange={handleInputChange}
                                maxLength={12}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">OTP</label>
                            <input
                                type="text"
                                name="otp"
                                className="form-input"
                                placeholder="Enter OTP sent to registered mobile"
                                value={formData.otp}
                                onChange={handleInputChange}
                                maxLength={6}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Verify & Login
                        </button>
                    </form>
                )

            case 'mobile':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                className="form-input"
                                placeholder="Enter 10-digit mobile number"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                maxLength={10}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">OTP</label>
                            <input
                                type="text"
                                name="otp"
                                className="form-input"
                                placeholder="Enter OTP"
                                value={formData.otp}
                                onChange={handleInputChange}
                                maxLength={6}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Verify & Login
                        </button>
                    </form>
                )

            case 'admin':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Admin ID</label>
                            <input
                                type="text"
                                name="adminId"
                                className="form-input"
                                placeholder="Enter Admin ID"
                                value={formData.adminId}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Login as Admin
                        </button>
                    </form>
                )

            default:
                return null
        }
    }

    return (
        <div className="auth-card">
            <div className="auth-header">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Choose your login method to continue</p>
            </div>

            {!loginMethod ? (
                <div className="auth-methods">
                    <button
                        className="auth-method-btn aadhar"
                        onClick={() => setLoginMethod('aadhar')}
                    >
                        <div className="auth-method-icon">🪪</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Login with Aadhar</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Use your Aadhar card for verification
                            </div>
                        </div>
                    </button>

                    <button
                        className="auth-method-btn mobile"
                        onClick={() => setLoginMethod('mobile')}
                    >
                        <div className="auth-method-icon">📱</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Login with Mobile</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                OTP will be sent to your number
                            </div>
                        </div>
                    </button>

                    <button
                        className="auth-method-btn admin"
                        onClick={() => setLoginMethod('admin')}
                    >
                        <div className="auth-method-icon">🔐</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Admin Login</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                For authorized personnel only
                            </div>
                        </div>
                    </button>
                </div>
            ) : (
                <>
                    <button
                        className="btn btn-secondary w-full mb-6"
                        onClick={() => setLoginMethod(null)}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        ← Back to login options
                    </button>
                    {renderLoginForm()}
                </>
            )}

            <div className="auth-divider">or</div>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Don't have an account?{' '}
                <a href="/register" style={{ color: 'var(--primary-400)' }}>Register here</a>
            </p>
        </div>
    )
}

export default LoginForm

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function Login() {
    const navigate = useNavigate()
    const { loginWithAadhar, loginWithMobile, loginAsAdmin, requestOTP } = useAuth()
    const toast = useToast()

    const [loginMethod, setLoginMethod] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
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

    const handleRequestOTP = async () => {
        const identifier = loginMethod === 'aadhar' ? formData.aadhar : formData.mobile

        if ((loginMethod === 'aadhar' && formData.aadhar.length !== 12) ||
            (loginMethod === 'mobile' && formData.mobile.length !== 10)) {
            toast.error(`Please enter a valid ${loginMethod === 'aadhar' ? '12-digit Aadhar' : '10-digit mobile'} number`)
            return
        }

        setIsLoading(true)
        const result = await requestOTP(identifier)
        setIsLoading(false)

        if (result.success) {
            setOtpSent(true)
            toast.success(result.message)
            // Auto-fill OTP for demo
            setTimeout(() => {
                setFormData(prev => ({ ...prev, otp: '123456' }))
                toast.info('Demo: OTP auto-filled')
            }, 1500)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        let result
        switch (loginMethod) {
            case 'aadhar':
                result = await loginWithAadhar(formData.aadhar, formData.otp)
                break
            case 'mobile':
                result = await loginWithMobile(formData.mobile, formData.otp)
                break
            case 'admin':
                result = await loginAsAdmin(formData.adminId, formData.password)
                break
            default:
                result = { success: false, error: 'Invalid login method' }
        }

        setIsLoading(false)

        if (result.success) {
            toast.success(`Welcome, ${result.user.name}!`)
            navigate(result.user.type === 'admin' ? '/admin' : '/')
        } else {
            toast.error(result.error)
        }
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
                                pattern="[0-9]*"
                                inputMode="numeric"
                                disabled={otpSent}
                            />
                        </div>

                        {!otpSent ? (
                            <button
                                type="button"
                                className="btn btn-primary w-full"
                                onClick={handleRequestOTP}
                                disabled={isLoading || formData.aadhar.length !== 12}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label">OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        className="form-input otp-input"
                                        placeholder="Enter 6-digit OTP"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        maxLength={6}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                    />
                                    <button
                                        type="button"
                                        className="resend-link"
                                        onClick={handleRequestOTP}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={isLoading || formData.otp.length !== 6}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </>
                        )}
                    </form>
                )

            case 'mobile':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <div className="phone-input-group">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    name="mobile"
                                    className="form-input"
                                    placeholder="Enter 10-digit mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    disabled={otpSent}
                                />
                            </div>
                        </div>

                        {!otpSent ? (
                            <button
                                type="button"
                                className="btn btn-primary w-full"
                                onClick={handleRequestOTP}
                                disabled={isLoading || formData.mobile.length !== 10}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label">OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        className="form-input otp-input"
                                        placeholder="Enter 6-digit OTP"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        maxLength={6}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                    />
                                    <button
                                        type="button"
                                        className="resend-link"
                                        onClick={handleRequestOTP}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={isLoading || formData.otp.length !== 6}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </>
                        )}
                    </form>
                )

            case 'admin':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="admin-login-notice">
                            <span>{/* 🔐 */}</span>
                            <span>Admin access is restricted to authorized personnel</span>
                        </div>

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

                        <div className="demo-credentials">
                            <span>Demo:</span> admin / admin123
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Login as Admin'}
                        </button>
                    </form>
                )

            default:
                return null
        }
    }

    return (
        <div className="auth-container">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Sign In</h1>
                <p className="page-subtitle">
                    Access emergency services and track your reports
                </p>
            </div>

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
                            <div>
                                <div style={{ fontWeight: 600 }}>Login with Aadhar</div>
                            </div>
                             </button>

                        <button
                            className="auth-method-btn mobile"
                            onClick={() => setLoginMethod('mobile')}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>Login with Mobile</div>
                            </div>
                        </button>

                        <button
                            className="auth-method-btn admin"
                            onClick={() => setLoginMethod('admin')}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>Admin Login</div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            className="back-button"
                            onClick={() => {
                                setLoginMethod(null)
                                setOtpSent(false)
                                setFormData({ aadhar: '', mobile: '', otp: '', adminId: '', password: '' })
                            }}
                        >
                            ← Back to login options
                        </button>
                        {renderLoginForm()}
                    </>
                )}

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    )
}

export default Login

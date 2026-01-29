import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { BLOOD_GROUPS, MEDICAL_CONDITIONS } from '../utils/constants'

function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)

    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        password: '',
        confirmPassword: '',
        medicalConditions: {},
        allergies: '',
        contacts: [{ name: '', phone: '', relation: '' }]
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleMedicalChange = (condition) => {
        setFormData({
            ...formData,
            medicalConditions: {
                ...formData.medicalConditions,
                [condition]: !formData.medicalConditions[condition]
            }
        })
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts]
        newContacts[index][field] = value
        setFormData({ ...formData, contacts: newContacts })
    }

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { name: '', phone: '', relation: '' }]
        })
    }

    const removeContact = (index) => {
        if (formData.contacts.length > 1) {
            setFormData({
                ...formData,
                contacts: formData.contacts.filter((_, i) => i !== index)
            })
        }
    }

    const validateStep = (currentStep) => {
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.mobile || !formData.dob || !formData.gender) {
                    toast.error('Please fill in all required fields')
                    return false
                }
                if (formData.mobile.length !== 10) {
                    toast.error('Please enter a valid 10-digit mobile number')
                    return false
                }
                return true
            case 2:
                if (!formData.password || !formData.confirmPassword) {
                    toast.error('Please enter a password')
                    return false
                }
                if (formData.password !== formData.confirmPassword) {
                    toast.error('Passwords do not match')
                    return false
                }
                if (formData.password.length < 6) {
                    toast.error('Password must be at least 6 characters')
                    return false
                }
                return true
            case 3:
                return true // Medical info is optional
            default:
                return true
        }
    }

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateStep(step)) return

        setIsLoading(true)

        const result = await register({
            name: formData.fullName,
            mobile: formData.mobile,
            dob: formData.dob,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            medicalConditions: formData.medicalConditions,
            allergies: formData.allergies,
            contacts: formData.contacts.filter(c => c.name && c.phone)
        })

        setIsLoading(false)

        if (result.success) {
            toast.success('🎉 Registration successful! Welcome to Rapid Assist.')
            navigate('/')
        } else {
            toast.error(result.error || 'Registration failed')
        }
    }

    return (
        <div className="register-page">
            <div className="page-header">
                <h1 className="page-title">Create Account</h1>
                <p className="page-subtitle">
                    Register to access emergency services and keep your medical information ready for emergencies
                </p>
            </div>

            {/* Progress Steps */}
            <div className="register-progress">
                {[
                    { num: 1, label: 'Personal' },
                    { num: 2, label: 'Security' },
                    { num: 3, label: 'Medical' },
                    { num: 4, label: 'Contacts' }
                ].map((s) => (
                    <div
                        key={s.num}
                        className={`progress-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
                    >
                        <div className="step-circle">
                            {step > s.num ? '✓' : s.num}
                        </div>
                        <span className="step-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="register-form">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                    <div className="register-section animate-in">
                        <h3 className="section-title">
                            <span>👤</span> Personal Information
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile Number *</label>
                            <div className="phone-input-group">
                                <span className="country-code">+91</span>
                                <input
                                    type="tel"
                                    name="mobile"
                                    className="form-input"
                                    placeholder="10-digit mobile number"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Date of Birth *</label>
                                <input
                                    type="date"
                                    name="dob"
                                    className="form-input"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender *</label>
                                <select
                                    name="gender"
                                    className="form-input form-select"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Security */}
                {step === 2 && (
                    <div className="register-section animate-in">
                        <h3 className="section-title">
                            <span>🔐</span> Create Password
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={6}
                                required
                            />
                            <div className="input-hint">Minimum 6 characters</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Medical Information */}
                {step === 3 && (
                    <div className="register-section animate-in">
                        <h3 className="section-title">
                            <span>🏥</span> Medical Information
                            <span className="optional-badge">Recommended</span>
                        </h3>

                        <div className="medical-info-notice">
                            <span>ℹ️</span>
                            <span>This information will be shared with emergency services during SOS alerts</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <div className="blood-group-grid">
                                {BLOOD_GROUPS.map(bg => (
                                    <button
                                        key={bg}
                                        type="button"
                                        className={`blood-group-btn ${formData.bloodGroup === bg ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                                    >
                                        {bg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Medical Conditions</label>
                            <div className="checkbox-grid">
                                {MEDICAL_CONDITIONS.map(condition => (
                                    <label key={condition.id} className="form-checkbox condition-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.medicalConditions[condition.id] || false}
                                            onChange={() => handleMedicalChange(condition.id)}
                                        />
                                        <span className="checkbox-content">
                                            <span className="condition-icon">{condition.icon}</span>
                                            <span>{condition.label}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Allergies</label>
                            <textarea
                                name="allergies"
                                className="form-input"
                                placeholder="List any allergies (medications, food, etc.)"
                                rows={3}
                                value={formData.allergies}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Emergency Contacts */}
                {step === 4 && (
                    <div className="register-section animate-in">
                        <h3 className="section-title">
                            <span>📞</span> Emergency Contacts
                            <span className="optional-badge">Recommended</span>
                        </h3>

                        <div className="contacts-notice">
                            <span>📱</span>
                            <span>These contacts will be notified during SOS alerts with your location</span>
                        </div>

                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="contact-entry">
                                <div className="contact-header">
                                    <span className="contact-number">Contact {index + 1}</span>
                                    {formData.contacts.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeContact(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="contact-fields">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Name"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                    />
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="Phone number"
                                        value={contact.phone}
                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                        maxLength={10}
                                    />
                                    <select
                                        className="form-input form-select"
                                        value={contact.relation}
                                        onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                                    >
                                        <option value="">Relation</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        ))}

                        <button type="button" className="btn btn-secondary add-contact-btn" onClick={addContact}>
                            + Add Another Contact
                        </button>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="register-actions">
                    {step > 1 && (
                        <button type="button" className="btn btn-secondary" onClick={prevStep}>
                            ← Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button type="button" className="btn btn-primary" onClick={nextStep}>
                            Next →
                        </button>
                    ) : (
                        <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                            {isLoading ? '⏳ Creating Account...' : '🎉 Complete Registration'}
                        </button>
                    )}
                </div>

                <p className="login-link">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </p>
            </form>
        </div>
    )
}

export default Register

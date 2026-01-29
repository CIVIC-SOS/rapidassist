import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import { MEDICAL_CONDITIONS, BLOOD_GROUPS } from '../utils/constants'

function UserProfile() {
    const { user, updateProfile, logout } = useAuth()
    const { getUserReports } = useReports()
    const toast = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        dob: user?.dob || '',
        gender: user?.gender || '',
        bloodGroup: user?.bloodGroup || '',
        allergies: user?.allergies || '',
        medicalConditions: user?.medicalConditions || {},
        contacts: user?.contacts || [{ name: '', phone: '', relation: '' }]
    })

    const userReports = user ? getUserReports(user.id) : { sos: [], community: [] }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleMedicalChange = (condition) => {
        setFormData(prev => ({
            ...prev,
            medicalConditions: {
                ...prev.medicalConditions,
                [condition]: !prev.medicalConditions[condition]
            }
        }))
    }

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts]
        newContacts[index][field] = value
        setFormData(prev => ({ ...prev, contacts: newContacts }))
    }

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [...prev.contacts, { name: '', phone: '', relation: '' }]
        }))
    }

    const removeContact = (index) => {
        if (formData.contacts.length > 1) {
            setFormData(prev => ({
                ...prev,
                contacts: prev.contacts.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSave = async () => {
        const result = await updateProfile(formData)
        if (result.success) {
            toast.success('Profile updated successfully!')
            setIsEditing(false)
        }
    }

    const handleLogout = () => {
        logout()
        toast.info('You have been logged out')
    }

    if (!user) {
        return (
            <div className="empty-state" style={{ padding: '4rem' }}>
                <span style={{ fontSize: '3rem' }}>🔒</span>
                <p>Please login to view your profile</p>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">
                    Manage your information and emergency contacts
                </p>
            </div>

            {/* Profile Header Card */}
            <div className="profile-header-card">
                <div className="profile-avatar">
                    <span>{user.name?.charAt(0) || '👤'}</span>
                </div>
                <div className="profile-info">
                    <h2>{user.name}</h2>
                    <p>{user.mobile ? `📱 ${user.mobile}` : user.aadhar ? `🪪 ****${user.aadhar?.slice(-4)}` : ''}</p>
                    <div className="profile-badges">
                        <span className="badge-verified">✓ Verified</span>
                        {user.bloodGroup && (
                            <span className="badge-blood">{user.bloodGroup}</span>
                        )}
                    </div>
                </div>
                <div className="profile-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="profile-grid">
                {/* Personal Information */}
                <div className="profile-section">
                    <h3 className="section-title">
                        <span>👤</span> Personal Information
                    </h3>

                    {isEditing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="form-input"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        name="gender"
                                        className="form-input form-select"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Full Name</span>
                                <span className="info-value">{user.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Date of Birth</span>
                                <span className="info-value">{user.dob || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Gender</span>
                                <span className="info-value" style={{ textTransform: 'capitalize' }}>
                                    {user.gender || 'Not set'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Medical Information */}
                <div className="profile-section">
                    <h3 className="section-title">
                        <span>🏥</span> Medical Information
                        <span className="section-badge important">Shared in Emergencies</span>
                    </h3>

                    {isEditing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label className="form-label">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    className="form-input form-select"
                                    value={formData.bloodGroup}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Blood Group</option>
                                    {BLOOD_GROUPS.map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Medical Conditions</label>
                                <div className="checkbox-grid">
                                    {MEDICAL_CONDITIONS.map(condition => (
                                        <label key={condition.id} className="form-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.medicalConditions[condition.id] || false}
                                                onChange={() => handleMedicalChange(condition.id)}
                                            />
                                            <span className="form-checkbox-label">
                                                {condition.icon} {condition.label}
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
                                    placeholder="List any allergies..."
                                    value={formData.allergies}
                                    onChange={handleInputChange}
                                    rows={2}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="medical-display">
                            <div className="blood-group-display">
                                <span className="blood-icon">🩸</span>
                                <span className="blood-type">{user.bloodGroup || 'Not set'}</span>
                            </div>

                            <div className="conditions-display">
                                <span className="label">Conditions:</span>
                                <div className="condition-tags">
                                    {Object.entries(user.medicalConditions || {})
                                        .filter(([_, v]) => v)
                                        .map(([key]) => (
                                            <span key={key} className="condition-tag">
                                                {MEDICAL_CONDITIONS.find(c => c.id === key)?.icon} {MEDICAL_CONDITIONS.find(c => c.id === key)?.label || key}
                                            </span>
                                        ))
                                    }
                                    {Object.values(user.medicalConditions || {}).every(v => !v) && (
                                        <span className="no-conditions">None reported</span>
                                    )}
                                </div>
                            </div>

                            {user.allergies && (
                                <div className="allergy-warning">
                                    <span>⚠️</span>
                                    <div>
                                        <strong>Allergies:</strong>
                                        <span>{user.allergies}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Emergency Contacts */}
                <div className="profile-section full-width">
                    <h3 className="section-title">
                        <span>📞</span> Emergency Contacts
                        <span className="section-badge">Notified during SOS</span>
                    </h3>

                    {isEditing ? (
                        <div className="contacts-edit">
                            {formData.contacts.map((contact, index) => (
                                <div key={index} className="contact-entry">
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
                                            placeholder="Phone"
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Relation"
                                            value={contact.relation}
                                            onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                                        />
                                    </div>
                                    {formData.contacts.length > 1 && (
                                        <button
                                            className="remove-contact-btn"
                                            onClick={() => removeContact(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={addContact}>
                                + Add Another Contact
                            </button>
                        </div>
                    ) : (
                        <div className="contacts-display">
                            {(user.contacts || []).map((contact, index) => (
                                <div key={index} className="contact-card">
                                    <div className="contact-avatar">
                                        {contact.name?.charAt(0) || '👤'}
                                    </div>
                                    <div className="contact-details">
                                        <div className="contact-name">{contact.name}</div>
                                        <div className="contact-phone">{contact.phone}</div>
                                        <div className="contact-relation">{contact.relation}</div>
                                    </div>
                                    <a href={`tel:${contact.phone}`} className="call-btn">
                                        📞
                                    </a>
                                </div>
                            ))}
                            {(!user.contacts || user.contacts.length === 0) && (
                                <p className="no-contacts">No emergency contacts added</p>
                            )}
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="save-section">
                        <button className="btn btn-primary btn-lg" onClick={handleSave}>
                            💾 Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* My Reports Section */}
            <div className="my-reports-section">
                <h3 className="section-title">
                    <span>📋</span> My Reports
                </h3>

                <div className="reports-tabs">
                    <div className="reports-summary">
                        <div className="summary-card">
                            <span className="summary-icon">🛡️</span>
                            <div>
                                <div className="summary-number">{userReports.sos.length}</div>
                                <div className="summary-label">SOS Alerts</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <span className="summary-icon">📝</span>
                            <div>
                                <div className="summary-number">{userReports.community.length}</div>
                                <div className="summary-label">Community Reports</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile

import { useState } from 'react'

function RegistrationForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        password: '',
        confirmPassword: '',
        medicalConditions: {
            heartCondition: false,
            asthma: false,
            diabetes: false,
            disabilities: false,
            other: false
        },
        allergies: '',
        contacts: [
            { name: '', phone: '', relation: '' }
        ]
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
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
        setFormData({
            ...formData,
            contacts: newContacts
        })
    }

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { name: '', phone: '', relation: '' }]
        })
    }

    const removeContact = (index) => {
        if (formData.contacts.length > 1) {
            const newContacts = formData.contacts.filter((_, i) => i !== index)
            setFormData({
                ...formData,
                contacts: newContacts
            })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit && onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="register-grid">
                {/* Personal Information */}
                <div className="register-section">
                    <h3 className="register-section-title">
                        <span className="icon">👤</span>
                        Personal Information
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
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
                        <label className="form-label">Date of Birth</label>
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
                        <label className="form-label">Gender</label>
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

                    <div className="form-group">
                        <label className="form-label">Blood Group</label>
                        <select
                            name="bloodGroup"
                            className="form-input form-select"
                            value={formData.bloodGroup}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select blood group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
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

                {/* Medical Information */}
                <div className="register-section">
                    <h3 className="register-section-title">
                        <span className="icon">🏥</span>
                        Medical Information
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Existing Medical Conditions</label>
                        <div className="form-checkbox-group">
                            {Object.entries({
                                heartCondition: 'Heart Condition',
                                asthma: 'Asthma',
                                diabetes: 'Diabetes',
                                disabilities: 'Disabilities',
                                other: 'Other'
                            }).map(([key, label]) => (
                                <label key={key} className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.medicalConditions[key]}
                                        onChange={() => handleMedicalChange(key)}
                                    />
                                    <span className="form-checkbox-label">{label}</span>
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
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="register-section" style={{ gridColumn: 'span 2' }}>
                    <h3 className="register-section-title">
                        <span className="icon">📞</span>
                        Emergency Contacts
                    </h3>

                    {formData.contacts.map((contact, index) => (
                        <div key={index} className="contact-entry">
                            <div className="contact-entry-header">
                                <span className="contact-entry-title">Contact {index + 1}</span>
                                {formData.contacts.length > 1 && (
                                    <span
                                        className="contact-entry-remove"
                                        onClick={() => removeContact(index)}
                                    >
                                        ✕
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Contact name"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="Phone number"
                                        value={contact.phone}
                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Relation</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Parent, Spouse"
                                        value={contact.relation}
                                        onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={addContact}
                        style={{ marginTop: '0.5rem' }}
                    >
                        + Add Another Contact
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button type="submit" className="btn btn-primary btn-lg">
                    Complete Registration
                </button>
            </div>
        </form>
    )
}

export default RegistrationForm

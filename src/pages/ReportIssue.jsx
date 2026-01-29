import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'

function ReportIssue() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addIssue } = useReports()
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
        image: null,
        priority: 'medium'
    })

    const categories = [
        'Roads & Potholes',
        'Street Lights',
        'Water Supply',
        'Drainage',
        'Garbage',
        'Public Safety',
        'Noise Pollution',
        'Other'
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            // In a real app, we'd upload this to a server
            // For demo, we'll convert to a local URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    image: reader.result
                })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAuthenticated) {
            showToast('Please login to report an issue', 'warning')
            navigate('/login')
            return
        }

        try {
            const newIssue = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                location: formData.location,
                image: formData.image, // Base64 string from reader
                priority: formData.priority,
                reporterId: user.id,
                reporterName: user.name,
                status: 'pending',
                timestamp: Date.now(),
                upvotes: 0,
                downvotes: 0
            }

            addIssue(newIssue)
            showToast('Report submitted successfully! Thank you for your contribution.', 'success')
            navigate('/dashboard')
        } catch (error) {
            showToast('Failed to submit report. Please try again.', 'error')
        }
    }

    return (
        <div className="report-container">
            <div className="page-header">
                <h1 className="page-title">Report an Issue</h1>
                <p className="page-subtitle">
                    Help improve your community by reporting public and civic issues
                </p>
            </div>

            <div className="report-card">
                <form onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Upload Image</label>
                        <label className="upload-area">
                            <input
                                type="file"
                                name="imageInput"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            {formData.image ? (
                                <div>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{/* ✅ */}</div>
                                    <div style={{ color: 'var(--primary-400)' }}>
                                        Image Selected
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        Click to change
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="upload-icon">{/* 📷 */}</div>
                                    <div className="upload-text">Click to upload an image</div>
                                    <div className="upload-hint">or drag and drop here</div>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Issue Title */}
                    <div className="form-group">
                        <label className="form-label">Issue Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="Brief title describing the issue"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            name="category"
                            className="form-input form-select"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Issue Brief / Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            placeholder="Provide detailed description of the issue..."
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            style={{ resize: 'vertical' }}
                            required
                        />
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="Enter location or use current location"
                                value={formData.location}
                                onChange={handleInputChange}
                                style={{ flex: 1 }}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    // Get current location
                                    if (navigator.geolocation) {
                                        showToast('Acquiring location...', 'info')
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                setFormData({
                                                    ...formData,
                                                    location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                                                })
                                                showToast('Location acquired!', 'success')
                                            },
                                            (error) => {
                                                showToast('Failed to get location. Please enter manually.', 'error')
                                            }
                                        )
                                    }
                                }}
                            >
                                {/* 📍 */} Use GPS
                            </button>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {['low', 'medium', 'high', 'urgent'].map((priority) => (
                                <label key={priority} className="form-checkbox">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={priority}
                                        checked={formData.priority === priority}
                                        onChange={handleInputChange}
                                    />
                                    <span className="form-checkbox-label" style={{ textTransform: 'capitalize' }}>
                                        {priority}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary btn-lg w-full">
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReportIssue


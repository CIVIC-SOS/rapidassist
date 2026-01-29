import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { useToast } from '../context/ToastContext'
import CivicIssueAnalyzer from '../utils/civicAnalyzer'


function ReportIssue() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addIssue } = useReports()
    const { info, success, error, warning } = useToast()

    // UI States
    const [step, setStep] = useState('camera') // camera, preview, form
    const [stream, setStream] = useState(null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
        priority: 'medium'
    })

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

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

    // Initialize Camera
    useEffect(() => {
        if (step === 'camera') {
            startCamera()
        }
        return () => stopCamera()
    }, [step])

    async function startCamera() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            console.error('Camera access error:', err)
            error('Unable to access camera. Please check permissions.')
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const captureImage = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        const context = canvas.getContext('2d')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        setStep('preview')
        stopCamera()
    }

    const uploadToImageBB = async (imageData) => {
        setIsUploading(true)
        setIsAnalyzing(true)
        info('Processing image with AI...')

        try {
            const result = await CivicIssueAnalyzer.processCivicImage(imageData)

            if (result) {
                setUploadedUrl(result.imageUrl)

                // Auto-populate form with AI insights
                setFormData({
                    title: result.title || '',
                    category: result.category || '',
                    description: result.description || '',
                    location: '', // Still needs user/GPS input
                    priority: result.priority || 'medium'
                })

                setStep('form')
                success('AI Analysis complete! Review and finalize your report.')
            } else {
                // Fallback if AI fails but we still want to try just upload or manual entry
                error('AI Analysis failed. Please fill in details manually.')
                setStep('form')
            }
        } catch (err) {
            console.error('Pipeline Error:', err)
            error('Failed to process image. You can still fill the form.')
            setStep('form')
        } finally {
            setIsUploading(false)
            setIsAnalyzing(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            warning('Please login to report an issue')
            navigate('/login')
            return
        }

        const newIssue = {
            ...formData,
            image: uploadedUrl || capturedImage,
            reporterId: user.id,
            reporterName: user.name,
            status: 'pending',
            timestamp: Date.now(),
            upvotes: 0,
            downvotes: 0
        }

        addIssue(newIssue)
        success('Report submitted successfully!')
        navigate('/dashboard')
    }

    return (
        <div className="report-redesign" style={{
            minHeight: 'calc(100vh - 80px)',
            padding: '2rem',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {step === 'camera' && (
                <div style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
                    <div style={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        background: '#000',
                        aspectRatio: '16/9',
                        position: 'relative'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '0',
                            right: '0',
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 10
                        }}>
                            <button
                                onClick={captureImage}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: '6px solid rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    border: '2px solid #000'
                                }} />
                            </button>
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: '1.5rem',
                            left: '1.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '100px',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                            LIVE CAMERA
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Snap the Issue</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Align the problem in the frame and hit the capture button</p>
                    </div>
                </div>
            )}

            {step === 'preview' && (
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                        <img src={capturedImage} style={{ width: '100%', display: 'block' }} alt="Capture" />
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            padding: '2rem',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center'
                        }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep('camera')}
                                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}
                            >
                                🔄 Retake
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => uploadToImageBB(capturedImage)}
                                disabled={isUploading || isAnalyzing}
                                style={{ minWidth: '180px' }}
                            >
                                {isAnalyzing ? '🤖 Analyzing...' : isUploading ? 'Uploading...' : '✨ Analyze & Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'form' && (
                <div className="report-card" style={{ width: '100%', maxWidth: '600px', animation: 'scaleIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                            <img src={capturedImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Finalize Report</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Add some context about what you captured</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Issue Title</label>
                            <input type="text" name="title" className="form-input" placeholder="What's the problem?" value={formData.title} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-input form-select" value={formData.category} onChange={handleInputChange} required>
                                <option value="">Select a category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-input" placeholder="Tell us more..." rows={3} value={formData.description} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input type="text" name="location" className="form-input" placeholder="Where is this?" value={formData.location} onChange={handleInputChange} required />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '1rem' }}>
                            🚀 Post to Community
                        </button>

                        <button type="button" className="btn btn-ghost w-full" onClick={() => setStep('camera')} style={{ marginTop: '0.5rem' }}>
                            Start Over
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

export default ReportIssue

// Emergency Services Configuration
export const EMERGENCY_SERVICES = {
    police: {
        id: 'police',
        title: 'Police',
        number: '100',
        icon: '👮',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    ambulance: {
        id: 'ambulance',
        title: 'Ambulance',
        number: '108',
        icon: '🚑',
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    fire: {
        id: 'fire',
        title: 'Fireforce',
        number: '101',
        icon: '🚒',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    }
}

// Report Status Workflow
export const REPORT_STATUS = {
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
}

export const STATUS_CONFIG = {
    submitted: { label: 'Submitted', icon: '📝', color: '#94a3b8', step: 1 },
    reviewed: { label: 'Reviewed', icon: '👁️', color: '#3b82f6', step: 2 },
    assigned: { label: 'Assigned', icon: '📋', color: '#8b5cf6', step: 3 },
    'in-progress': { label: 'In Progress', icon: '🔧', color: '#f59e0b', step: 4 },
    completed: { label: 'Completed', icon: '✓', color: '#22c55e', step: 5 }
}

// Issue Categories
export const ISSUE_CATEGORIES = [
    { id: 'roads', label: 'Roads & Potholes', icon: '🛣️' },
    { id: 'lights', label: 'Street Lights', icon: '💡' },
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'drainage', label: 'Drainage', icon: '🚰' },
    { id: 'garbage', label: 'Garbage', icon: '🗑️' },
    { id: 'safety', label: 'Public Safety', icon: '🛡️' },
    { id: 'noise', label: 'Noise Pollution', icon: '🔊' },
    { id: 'other', label: 'Other', icon: '📌' }
]

// Blood Group Options
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Medical Conditions
export const MEDICAL_CONDITIONS = [
    { id: 'heartCondition', label: 'Heart Condition', icon: '❤️' },
    { id: 'asthma', label: 'Asthma', icon: '🫁' },
    { id: 'diabetes', label: 'Diabetes', icon: '💉' },
    { id: 'disabilities', label: 'Disabilities', icon: '♿' },
    { id: 'epilepsy', label: 'Epilepsy', icon: '⚡' },
    { id: 'other', label: 'Other', icon: '🏥' }
]

// Demo Users for Testing
export const DEMO_USERS = {
    citizen: {
        id: 'citizen-001',
        type: 'citizen',
        name: 'Rahul Sharma',
        mobile: '9876543210',
        aadhar: '123456789012',
        dob: '1995-05-15',
        gender: 'male',
        bloodGroup: 'O+',
        medicalConditions: { asthma: true },
        allergies: 'Penicillin',
        contacts: [
            { name: 'Priya Sharma', phone: '9876543211', relation: 'Spouse' },
            { name: 'Vikram Sharma', phone: '9876543212', relation: 'Father' }
        ]
    },
    admin: {
        id: 'admin-001',
        type: 'admin',
        name: 'Inspector Kumar',
        adminId: 'ADMIN001',
        department: 'Police Control Room',
        badge: 'PCR-1234'
    }
}

// Demo SOS Reports
export const DEMO_SOS_REPORTS = [
    {
        id: 'sos-001',
        type: 'ambulance',
        target: 'myself',
        userId: 'citizen-001',
        userName: 'Rahul Sharma',
        status: 'in-progress',
        location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        medicalInfo: { bloodGroup: 'O+', conditions: ['asthma'], allergies: 'Penicillin' },
        assignedTo: 'ambulance'
    },
    {
        id: 'sos-002',
        type: 'police',
        target: 'others',
        userId: 'citizen-002',
        userName: 'Anita Verma',
        status: 'submitted',
        location: { lat: 28.5355, lng: 77.3910, address: 'Sector 18, Noida' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        description: 'Suspicious activity near ATM'
    },
    {
        id: 'sos-003',
        type: 'fire',
        target: 'others',
        userId: 'citizen-003',
        userName: 'Mohammad Khan',
        status: 'completed',
        location: { lat: 28.4595, lng: 77.0266, address: 'DLF Phase 3, Gurugram' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        description: 'Small fire in building kitchen'
    }
]

// Demo Community Issues
export const DEMO_COMMUNITY_ISSUES = [
    {
        id: 'issue-001',
        image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
        category: 'Roads',
        title: 'Large Pothole on MG Road',
        description: 'Dangerous pothole near the junction causing accidents. Multiple vehicles damaged.',
        location: 'MG Road, Near Central Mall',
        status: 'in-progress',
        upvotes: 47,
        downvotes: 2,
        userId: 'citizen-001',
        userName: 'Rahul Sharma',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
        id: 'issue-002',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        category: 'Street Lights',
        title: '5 Street Lights Not Working',
        description: 'Complete darkness on the street for past 2 weeks. Safety concern for pedestrians.',
        location: 'Sector 21, Near Park',
        status: 'submitted',
        upvotes: 23,
        downvotes: 0,
        userId: 'citizen-002',
        userName: 'Anita Verma',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
        id: 'issue-003',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
        category: 'Garbage',
        title: 'Garbage Overflow at Market',
        description: 'Garbage not collected for 5 days. Creating health hazard and bad odor.',
        location: 'Old Market Area',
        status: 'completed',
        upvotes: 89,
        downvotes: 1,
        userId: 'citizen-003',
        userName: 'Mohammad Khan',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    }
]

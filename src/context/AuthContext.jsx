import { createContext, useContext, useState, useEffect } from 'react'
import { ref, set } from 'firebase/database'
import { database } from '../firebase'
import { DEMO_USERS } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('rapidAssist_user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem('rapidAssist_user')
            }
        }
        setIsLoading(false)
    }, [])

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('rapidAssist_user', JSON.stringify(user))
        } else {
            localStorage.removeItem('rapidAssist_user')
        }
    }, [user])

    // Simulate Aadhar login with OTP
    const loginWithAadhar = async (aadhar, otp) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Demo: Accept any 12-digit Aadhar with OTP "123456"
        if (aadhar.length === 12 && otp === '123456') {
            const demoUser = { ...DEMO_USERS.citizen, aadhar }
            setUser(demoUser)
            return { success: true, user: demoUser }
        }

        // Also accept demo Aadhar
        if (aadhar === DEMO_USERS.citizen.aadhar && otp === '123456') {
            setUser(DEMO_USERS.citizen)
            return { success: true, user: DEMO_USERS.citizen }
        }

        return { success: false, error: 'Invalid Aadhar or OTP. Use OTP: 123456' }
    }

    // Simulate Mobile login with OTP
    const loginWithMobile = async (mobile, otp) => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Demo: Accept any 10-digit mobile with OTP "123456"
        if (mobile.length === 10 && otp === '123456') {
            const demoUser = { ...DEMO_USERS.citizen, mobile }
            setUser(demoUser)
            return { success: true, user: demoUser }
        }

        return { success: false, error: 'Invalid mobile or OTP. Use OTP: 123456' }
    }

    // Admin login
    const loginAsAdmin = async (adminId, password) => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Police Admin login
        if ((adminId.toLowerCase() === 'police' || adminId === 'POLICE001') && password === 'police123') {
            setUser(DEMO_USERS.policeAdmin)
            return { success: true, user: DEMO_USERS.policeAdmin }
        }

        // Ambulance Admin login
        if ((adminId.toLowerCase() === 'ambulance' || adminId === 'AMBULANCE001') && password === 'ambulance123') {
            setUser(DEMO_USERS.ambulanceAdmin)
            return { success: true, user: DEMO_USERS.ambulanceAdmin }
        }

        // Fire Admin login
        if ((adminId.toLowerCase() === 'fire' || adminId === 'FIRE001') && password === 'fire123') {
            setUser(DEMO_USERS.fireAdmin)
            return { success: true, user: DEMO_USERS.fireAdmin }
        }

        // General Admin login (for backward compatibility)
        if ((adminId === 'admin' || adminId === 'ADMIN001') && password === 'admin123') {
            setUser(DEMO_USERS.admin)
            return { success: true, user: DEMO_USERS.admin }
        }

        return { success: false, error: 'Invalid credentials. Try: police/police123, ambulance/ambulance123, or fire/fire123' }
    }

    // Register new user
    const register = async (userData) => {
        try {
            const userId = `citizen-${Date.now()}`
            const newUser = {
                id: userId,
                type: 'citizen',
                ...userData,
                createdAt: new Date().toISOString()
            }

            // Save to Firebase RTDB
            const userRef = ref(database, `users/${userId}`)
            await set(userRef, {
                ...newUser,
                // Don't store the password if it's passed here (though it shouldn't be)
                password: null
            })

            setUser(newUser)
            return { success: true, user: newUser }
        } catch (error) {
            console.error('Registration Error:', error)
            return { success: false, error: error.message }
        }
    }

    // Update user profile
    const updateProfile = async (updates) => {
        await new Promise(resolve => setTimeout(resolve, 500))

        const updatedUser = { ...user, ...updates }
        setUser(updatedUser)
        return { success: true, user: updatedUser }
    }

    // Logout
    const logout = () => {
        localStorage.removeItem('rapidAssist_user')
        setUser(null)
    }

    // Request OTP (simulated)
    const requestOTP = async (identifier) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`OTP sent to: ${identifier}`)
        // In demo mode, always return success
        return { success: true, message: `OTP sent! For demo, use: 123456` }
    }

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.type === 'admin',
        loginWithAadhar,
        loginWithMobile,
        loginAsAdmin,
        register,
        updateProfile,
        logout,
        requestOTP
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext

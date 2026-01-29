import { createContext, useContext, useState, useEffect } from 'react'
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

        // Demo: Accept admin/admin123
        if ((adminId === 'admin' || adminId === 'ADMIN001') && password === 'admin123') {
            setUser(DEMO_USERS.admin)
            return { success: true, user: DEMO_USERS.admin }
        }

        return { success: false, error: 'Invalid credentials. Use: admin / admin123' }
    }

    // Register new user
    const register = async (userData) => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newUser = {
            id: `citizen-${Date.now()}`,
            type: 'citizen',
            ...userData,
            createdAt: new Date().toISOString()
        }

        setUser(newUser)
        return { success: true, user: newUser }
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

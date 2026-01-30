import { createContext, useContext, useState, useEffect } from 'react'
import { ref, onValue, query, orderByChild, limitToLast, push, set, runTransaction } from 'firebase/database'
import { database } from '../firebase'
import { DEMO_SOS_REPORTS, DEMO_COMMUNITY_ISSUES } from '../utils/constants'

const ReportsContext = createContext(null)

export function ReportsProvider({ children }) {
    const [sosReports, setSosReports] = useState([])
    const [communityIssues, setCommunityIssues] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from localStorage on mount, or use demo data
    useEffect(() => {
        // Initial demo data only if firebase is empty (not handling here to keep simple, empty start is fine for real-time)

        setIsLoading(false)

        // Real-time SOS Sync from Firebase
        const emergenciesRef = query(
            ref(database, 'emergencies'),
            orderByChild('timestamp'),
            limitToLast(50)
        )

        const unsubscribe = onValue(emergenciesRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                // Convert Firebase object to array and ensure IDs are preserved
                const firebaseEmergencies = Object.entries(data).map(([id, val]) => ({
                    id,
                    ...val,
                    isLive: true
                }))

                // Newest first, purely from Firebase
                setSosReports(firebaseEmergencies.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                ))
            }
        })

        return () => unsubscribe()
    }, [])


    // Real-time Community Reports Sync
    useEffect(() => {
        const reportsRef = query(
            ref(database, 'reports'),
            limitToLast(50)
        )

        const unsubscribeReports = onValue(reportsRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const firebaseReports = Object.entries(data).map(([id, val]) => ({
                    id,
                    ...val
                }))
                // Sort by timestamp descending
                setCommunityIssues(firebaseReports.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                ))
            } else {
                setCommunityIssues([])
            }
        })

        return () => {
            unsubscribeReports()
        }
    }, [])

    // Create new SOS report
    const createSOSReport = async (reportData) => {
        const newReport = {
            id: `sos-${Date.now()}`,
            timestamp: Date.now(),
            status: 'submitted',
            ...reportData
        }

        setSosReports(prev => [newReport, ...prev])
        return { success: true, report: newReport }
    }

    // Update SOS report status
    const updateSOSStatus = async (reportId, status, updates = {}) => {
        setSosReports(prev => prev.map(report =>
            report.id === reportId
                ? { ...report, status, ...updates, updatedAt: new Date().toISOString() }
                : report
        ))
        return { success: true }
    }

    // Assign SOS to department
    const assignSOS = async (reportId, department) => {
        return updateSOSStatus(reportId, 'assigned', { assignedTo: department })
    }

    // Create community issue report
    const addIssue = async (issueData) => {
        try {
            const reportsRef = ref(database, 'reports')
            const newReportRef = push(reportsRef)
            const reportId = newReportRef.key

            const newIssue = {
                id: reportId,
                status: 'submitted',
                upvotes: 0,
                downvotes: 0,
                timestamp: new Date().toISOString(),
                ...issueData
            }

            await set(newReportRef, newIssue)
            return { success: true, issue: newIssue }
        } catch (error) {
            console.error('Error adding issue:', error)
            return { success: false, error: error.message }
        }
    }

    // LEGACY: Keep for compatibility if needed, but alias to addIssue or remove
    const createCommunityIssue = addIssue

    // Vote on community issue with Firebase Transaction
    const voteOnIssue = async (issueId, voteType) => {
        const userVotesKey = 'rapidAssist_userVotes'
        const savedVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}')
        const previousVote = savedVotes[issueId]

        const issueRef = ref(database, `reports/${issueId}`)

        try {
            await runTransaction(issueRef, (issue) => {
                if (issue) {
                    if (previousVote === voteType) {
                        // Toggle off (remove vote)
                        issue[voteType === 'up' ? 'upvotes' : 'downvotes'] = (issue[voteType === 'up' ? 'upvotes' : 'downvotes'] || 0) - 1
                    } else {
                        // If changing vote, remove old one
                        if (previousVote) {
                            issue[previousVote === 'up' ? 'upvotes' : 'downvotes'] = (issue[previousVote === 'up' ? 'upvotes' : 'downvotes'] || 0) - 1
                        }
                        // Add new vote
                        issue[voteType === 'up' ? 'upvotes' : 'downvotes'] = (issue[voteType === 'up' ? 'upvotes' : 'downvotes'] || 0) + 1
                    }

                    // Prevent negatives
                    if (issue.upvotes < 0) issue.upvotes = 0
                    if (issue.downvotes < 0) issue.downvotes = 0
                }
                return issue
            })

            // Update local storage to track user's vote status
            if (previousVote === voteType) {
                delete savedVotes[issueId]
            } else {
                savedVotes[issueId] = voteType
            }
            localStorage.setItem(userVotesKey, JSON.stringify(savedVotes))

            return { success: true }
        } catch (error) {
            console.error("Vote failed", error)
            return { success: false, error: error.message }
        }
    }

    // Get user's vote for an issue
    const getUserVote = (issueId) => {
        const savedVotes = JSON.parse(localStorage.getItem('rapidAssist_userVotes') || '{}')
        return savedVotes[issueId] || null
    }

    // Update community issue status (admin)
    const updateIssueStatus = async (issueId, status) => {
        setCommunityIssues(prev => prev.map(issue =>
            issue.id === issueId
                ? { ...issue, status, updatedAt: new Date().toISOString() }
                : issue
        ))
        return { success: true }
    }

    // Get reports by user
    const getUserReports = (userId) => {
        return {
            sos: sosReports.filter(r => r.userId === userId),
            community: communityIssues.filter(i => i.reporterId === userId)
        }
    }

    // Get stats for dashboard
    const getStats = () => {
        return {
            totalSOS: sosReports.length,
            pendingSOS: sosReports.filter(r => r.status === 'submitted' || r.status === 'reviewed').length,
            inProgressSOS: sosReports.filter(r => r.status === 'assigned' || r.status === 'in-progress').length,
            completedSOS: sosReports.filter(r => r.status === 'completed').length,
            totalCommunity: communityIssues.length,
            pendingCommunity: communityIssues.filter(i => i.status === 'submitted').length,
            completedCommunity: communityIssues.filter(i => i.status === 'completed').length
        }
    }

    // Reset to demo data (for testing)
    const resetToDemo = () => {
        setSosReports(DEMO_SOS_REPORTS)
        setCommunityIssues(DEMO_COMMUNITY_ISSUES)
        localStorage.removeItem('rapidAssist_userVotes')
    }

    const value = {
        sosReports,
        communityIssues,
        isLoading,
        createSOSReport,
        updateSOSStatus,
        assignSOS,
        addIssue,
        createCommunityIssue,
        voteOnIssue,
        getUserVote,
        updateIssueStatus,
        getUserReports,
        getStats,
        resetToDemo
    }

    return (
        <ReportsContext.Provider value={value}>
            {children}
        </ReportsContext.Provider>
    )
}

export function useReports() {
    const context = useContext(ReportsContext)
    if (!context) {
        throw new Error('useReports must be used within a ReportsProvider')
    }
    return context
}

export default ReportsContext

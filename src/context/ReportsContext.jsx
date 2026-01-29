import { createContext, useContext, useState, useEffect } from 'react'
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database'
import { database } from '../firebase'
import { DEMO_SOS_REPORTS, DEMO_COMMUNITY_ISSUES } from '../utils/constants'

const ReportsContext = createContext(null)

export function ReportsProvider({ children }) {
    const [sosReports, setSosReports] = useState([])
    const [communityIssues, setCommunityIssues] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Load from localStorage on mount, or use demo data
    useEffect(() => {
        const savedCommunity = localStorage.getItem('rapidAssist_communityIssues')

        if (savedCommunity) {
            try {
                setCommunityIssues(JSON.parse(savedCommunity))
            } catch (e) {
                setCommunityIssues(DEMO_COMMUNITY_ISSUES)
            }
        } else {
            setCommunityIssues(DEMO_COMMUNITY_ISSUES)
        }

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


    // Persist community issues
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('rapidAssist_communityIssues', JSON.stringify(communityIssues))
        }
    }, [communityIssues, isLoading])

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
    const createCommunityIssue = async (issueData) => {
        const newIssue = {
            id: `issue-${Date.now()}`,
            status: 'submitted',
            upvotes: 0,
            downvotes: 0,
            timestamp: new Date().toISOString(),
            ...issueData
        }

        setCommunityIssues(prev => [newIssue, ...prev])
        return { success: true, issue: newIssue }
    }

    // Vote on community issue
    const voteOnIssue = async (issueId, voteType) => {
        // Get or create user votes from localStorage
        const userVotesKey = 'rapidAssist_userVotes'
        const savedVotes = JSON.parse(localStorage.getItem(userVotesKey) || '{}')

        const previousVote = savedVotes[issueId]

        // If same vote, remove it (toggle off)
        if (previousVote === voteType) {
            delete savedVotes[issueId]
            localStorage.setItem(userVotesKey, JSON.stringify(savedVotes))

            setCommunityIssues(prev => prev.map(issue => {
                if (issue.id === issueId) {
                    return {
                        ...issue,
                        [voteType === 'up' ? 'upvotes' : 'downvotes']: Math.max(0, issue[voteType === 'up' ? 'upvotes' : 'downvotes'] - 1)
                    }
                }
                return issue
            }))
            return { success: true, action: 'removed' }
        }

        // Remove previous vote if exists
        if (previousVote) {
            setCommunityIssues(prev => prev.map(issue => {
                if (issue.id === issueId) {
                    return {
                        ...issue,
                        [previousVote === 'up' ? 'upvotes' : 'downvotes']: Math.max(0, issue[previousVote === 'up' ? 'upvotes' : 'downvotes'] - 1)
                    }
                }
                return issue
            }))
        }

        // Add new vote
        savedVotes[issueId] = voteType
        localStorage.setItem(userVotesKey, JSON.stringify(savedVotes))

        setCommunityIssues(prev => prev.map(issue => {
            if (issue.id === issueId) {
                return {
                    ...issue,
                    [voteType === 'up' ? 'upvotes' : 'downvotes']: issue[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1
                }
            }
            return issue
        }))

        return { success: true, action: 'added' }
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
            community: communityIssues.filter(i => i.userId === userId)
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

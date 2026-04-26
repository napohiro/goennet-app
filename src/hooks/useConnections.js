import { useState, useEffect, useCallback } from 'react'
import {
  getIncomingRequests,
  getOutgoingRequests,
  getDirectConnections,
  approveRequest,
  rejectRequest,
} from '../services/connectionService'

export function useConnectionRequests(myProfileId) {
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    if (!myProfileId) return
    setLoading(true)
    try {
      const [inc, out] = await Promise.all([
        getIncomingRequests(myProfileId),
        getOutgoingRequests(myProfileId),
      ])
      setIncoming(inc)
      setOutgoing(out)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [myProfileId])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function approve(requestId) {
    await approveRequest(requestId, myProfileId)
    await fetchRequests()
  }

  async function reject(requestId) {
    await rejectRequest(requestId)
    await fetchRequests()
  }

  return { incoming, outgoing, loading, error, approve, reject, refetch: fetchRequests }
}

export function useDirectConnections(myProfileId) {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!myProfileId) return
    setLoading(true)
    getDirectConnections(myProfileId)
      .then(setConnections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [myProfileId])

  return { connections, loading, error }
}

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import useAuthStore from '../store/useAuthStore'

const DashboardRedirect = () => {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/sign-in')
      return
    }
    // Normalize role string
    const r = (role || '').toString().toLowerCase()
    if (r === 'vendor') navigate('/dashboard/vendor')
    else if (r === 'admin') navigate('/dashboard/admin')
    else navigate('/dashboard/user')
  }, [isLoggedIn, role, navigate])

  return (
    <div className="p-6 text-center">Redirecting to your dashboard...</div>
  )
}

export default DashboardRedirect

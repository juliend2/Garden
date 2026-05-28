import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { api, type User } from './api'
import Login from './pages/Login'
import Spaces from './pages/Spaces'
import Space from './pages/Space'
import ObjectPage from './pages/ObjectPage'

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  if (user === undefined) return null

  if (!user) return <Login />

  return (
    <BrowserRouter>
      <div className="wrapper">
        <nav className="nav">
          <span>{user.name} ({user.email})</span>
          <button className='logout' onClick={() => api.auth.logout().then(() => setUser(null))}>
            Logout
          </button>
        </nav>
        <Routes>
          <Route path="/"           element={<Spaces />} />
          <Route path="/space/:id"  element={<Space />} />
          <Route path="/object/:id" element={<ObjectPage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Space } from '../api'

export default function Spaces() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')

  useEffect(() => {
    api.spaces.list().then(setSpaces).catch(e => setError(e.message))
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const space = await api.spaces.create(name.trim())
      setSpaces(prev => [space, ...prev])
      setName('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <div>
      <h1>Spaces</h1>
      {error && <p>{error}</p>}
      <form onSubmit={create}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Space name"
        />
        <button type="submit">Create</button>
      </form>
      <ul>
        {spaces.map(s => (
          <li key={s._id}>
            <Link to={`/space/${s._id}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

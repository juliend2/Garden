import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, type Space as SpaceType, type Obj } from '../api'

export default function Space() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const [space, setSpace]   = useState<SpaceType | null>(null)
  const [objects, setObjects] = useState<Obj[]>([])
  const [json, setJson]     = useState('{}')
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) return
    api.spaces.get(id).then(setSpace).catch(e => setError(e.message))
    api.spaces.objects(id).then(setObjects).catch(e => setError(e.message))
  }, [id])

  async function createObject(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    let data: Record<string, unknown>
    try {
      data = JSON.parse(json)
    } catch {
      setError('Invalid JSON')
      return
    }
    try {
      const obj = await api.spaces.createObject(id, data)
      setObjects(prev => [obj, ...prev])
      setJson('{}')
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  async function deleteSpace() {
    if (!id || !confirm('Delete this space and all its objects?')) return
    await api.spaces.delete(id)
    navigate('/')
  }

  if (!space) return null

  return (
    <div>
      <Link to="/">← Spaces</Link>
      <h1>{space.name}</h1>
      <button onClick={deleteSpace}>Delete space</button>

      <h2>New object</h2>
      {error && <p>{error}</p>}
      <form onSubmit={createObject}>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={5}
          cols={50}
        />
        <br />
        <button type="submit">Create object</button>
      </form>

      <h2>Objects</h2>
      <ul>
        {objects.map(o => (
          <li key={o._id}>
            <Link to={`/object/${o._id}`}>{o._id}</Link>
            {' — '}
            {new Date(o.createdAt as string).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

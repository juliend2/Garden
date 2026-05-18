import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, type Obj } from '../api'

export default function ObjectPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [obj, setObj]     = useState<Obj | null>(null)
  const [json, setJson]   = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.objects.get(id).then(o => {
      setObj(o)
      const { _id, spaceId, userId, createdAt, updatedAt, ...fields } = o
      setJson(JSON.stringify(fields, null, 2))
    })
  }, [id])

  async function update(e: React.FormEvent) {
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
      const updated = await api.objects.update(id, data)
      setObj(updated)
      setError('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  async function deleteObject() {
    if (!id || !obj || !confirm('Delete this object?')) return
    await api.objects.delete(id)
    navigate(`/space/${obj.spaceId}`)
  }

  if (!obj) return null

  return (
    <div>
      <Link to={`/space/${obj.spaceId}`}>← Space</Link>
      <h1>Object</h1>
      <p>ID: {obj._id}</p>
      <p>Created: {new Date(obj.createdAt as string).toLocaleString()}</p>
      <p>Updated: {new Date(obj.updatedAt as string).toLocaleString()}</p>

      <h2>Fields</h2>
      {error && <p>{error}</p>}
      <form onSubmit={update}>
        <textarea
          value={json}
          onChange={e => setJson(e.target.value)}
          rows={12}
          cols={50}
        />
        <br />
        <button type="submit">Save</button>
      </form>

      <button onClick={deleteObject}>Delete object</button>
    </div>
  )
}

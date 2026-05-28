import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, type Obj } from '../api'

export default function ObjectPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [obj, setObj]     = useState<Obj | null>(null)
  const [text, setText]   = useState('')
  const [color, setColor] = useState('#ffffff')
  const [url, setUrl]     = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.objects.get(id).then(o => {
      setObj(o)
      setText(typeof o.text === 'string' ? o.text : '')
      setColor(typeof o.color === 'string' && o.color ? o.color : '#ffffff')
      setUrl(typeof o.url === 'string' ? o.url : '')
    })
  }, [id])

  async function update(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    try {
      const updated = await api.objects.update(id, { text, color, url })
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
      <form className='object-form' onSubmit={update}>
        <label>
          <span className='field-label'>Text</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={12}
            cols={50}
          />
        </label>
        <br />
        <label>
          <span className='field-label'>Color</span>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        <br />
        <label>
          <span className='field-label'>URL</span>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </label>
        <br />
        <button type="submit" className='form-button' >Save</button>
      </form>

      <button onClick={deleteObject}>Delete object</button>
    </div>
  )
}

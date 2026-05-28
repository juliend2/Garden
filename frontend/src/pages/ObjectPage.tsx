import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, type Obj } from '../api'

export default function ObjectPage() {
  const WHITE = '#ffffff'
  const BLACK = '#000000'
  const DEFAULT_BACKGROUND_COLOR = WHITE
  const DEFAULT_TEXT_COLOR = BLACK
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [obj, setObj]     = useState<Obj | null>(null)
  const [text, setText]   = useState('')
  const [color, setColor] = useState(DEFAULT_BACKGROUND_COLOR)
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR)
  const [url, setUrl]     = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.objects.get(id).then(o => {
      setObj(o)
      setText(typeof o.text === 'string' ? o.text : '')
      setColor(typeof o.color === 'string' && o.color ? o.color : DEFAULT_BACKGROUND_COLOR)
      setTextColor(typeof o.textColor === 'string' && o.textColor ? o.textColor : DEFAULT_TEXT_COLOR)
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
      console.log('yo', id)
      navigate(`/space/${obj.spaceId}`)
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
        <label>
          <span className='field-label'>Color</span>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        <div className='field'>
          <span className='field-label'>Text Color</span>
          <label>
            <input
              type="radio"
              value={BLACK}
              checked={textColor === BLACK}
              onChange={e => setTextColor(e.target.value)}
            />Black
          </label>
          <label>
            <input
              type="radio"
              value={WHITE}
              checked={textColor === BLACK}
              onChange={e => setTextColor(e.target.value)}
            />White
          </label>
        </div>
        <label>
          <span className='field-label'>URL</span>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </label>
        <div className='inline-block'>
          <button type="submit" className='form-button' >Save</button>
          <span>or</span>
          <Link to={`/space/${obj.spaceId}`}>Cancel</Link>
        </div>
      </form>

      <div className="danger-zone">
        <h3>Danger zone</h3>
        <button onClick={deleteObject}>Delete object</button>
      </div>
    </div>
  )
}

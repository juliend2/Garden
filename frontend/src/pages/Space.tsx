import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api, type Space as SpaceType, type Obj } from '../api'

interface TextObjectProps {
  id: string;
  text: string;
  color?: string;
}

export function TextObject(props: TextObjectProps) {
  const styles = {}
  if ("color" in props) {
    styles.backgroundColor = props.color
  }
  console.log('houra', styles)
  return <Link className='object object--text' style={styles} to={`/object/${props.id}`}>{props.text}</Link>
}

function objectComponentFactory(object) {
  // TODO: support color-only object
  if ('text' in object) {
    if ('color' in object) {
      return <TextObject id={object._id} text={object.text} color={object.color} />
    } else {
      return <TextObject id={object._id} text={object.text} />
    }
  }
  return <></>
}

export default function Space() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const [space, setSpace]   = useState<SpaceType | null>(null)
  const [objects, setObjects] = useState<Obj[]>([])
  const [text, setText]     = useState('')
  const [color, setColor]   = useState('#ffffff')
  const [url, setUrl]       = useState('')
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) return
    api.spaces.get(id).then(setSpace).catch(e => setError(e.message))
    api.spaces.objects(id).then(setObjects).catch(e => setError(e.message))
  }, [id])

  async function createObject(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    try {
      const obj = await api.spaces.createObject(id, { text, color, url })
      setObjects(prev => [obj, ...prev])
      setText('')
      setColor('#ffffff')
      setUrl('')
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
        <label>
          Text
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            cols={50}
          />
        </label>
        <br />
        <label>
          Color
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        <br />
        <label>
          URL
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Create</button>
      </form>

      <h2>Objects</h2>
      <section className="objects">
        {objects.map(o => (
          <div key={o._id}>
            {objectComponentFactory(o)}
          </div>
        ))}
      </section>
    </div>
  )
}

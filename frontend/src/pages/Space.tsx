import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api, type Space as SpaceType, type Obj } from '../api'

interface TextObjectProps {
  id: string;
  text: string;
  color?: string;
}

export function TextObject(props: TextObjectProps) {
  const styles: React.CSSProperties = {}
  if (props.color) {
    styles.backgroundColor = props.color
  }
  return <Link className='object object--text' style={styles} to={`/object/${props.id}`}>{props.text}</Link>
}

function objectComponentFactory(object: Obj) {
  if ('text' in object) {
    if ('color' in object) {
      return <TextObject id={object._id} text={object.text as string} color={object.color as string} />
    } else {
      return <TextObject id={object._id} text={object.text as string} />
    }
  }
  return <></>
}

function SortableObject({ obj }: { obj: Obj }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: obj._id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  }
  return (
    <div ref={setNodeRef} style={style}>
      <span
        className="object__handle"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >⋮⋮</span>
      {objectComponentFactory(obj)}
    </div>
  )
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

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
      setObjects(prev => [...prev, obj])
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!id || !over || active.id === over.id) return
    const oldIndex = objects.findIndex(o => o._id === active.id)
    const newIndex = objects.findIndex(o => o._id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const previous = objects
    const next = arrayMove(objects, oldIndex, newIndex)
    setObjects(next)
    try {
      await api.spaces.reorderObjects(id, next.map(o => o._id))
    } catch (e: unknown) {
      setObjects(previous)
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  if (!space) return null

  return (
    <div>
      <Link to="/">← Spaces</Link>
      <h1>{space.name}</h1>
      <button onClick={deleteSpace}>Delete space</button>

      <h2>New object</h2>
      {error && <p>{error}</p>}
      <form className='object-form' onSubmit={createObject}>
        <label>
          <span className='field-label'>Text</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
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
        <button type="submit" className='form-button'>Create</button>
      </form>

      <h2>Objects</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={objects.map(o => o._id)} strategy={rectSortingStrategy}>
          <section className="objects">
            {objects.map(o => (
              <SortableObject key={o._id} obj={o} />
            ))}
          </section>
        </SortableContext>
      </DndContext>
    </div>
  )
}

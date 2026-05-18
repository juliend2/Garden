export interface User {
  _id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Space {
  _id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Obj {
  _id: string
  spaceId: string
  userId: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json()
}

export const api = {
  auth: {
    me:     () => request<User>('GET', '/api/auth/me'),
    logout: () => request<{ ok: boolean }>('POST', '/api/auth/logout'),
  },
  spaces: {
    list:         ()                                    => request<Space[]>('GET',    '/api/spaces'),
    create:       (name: string)                        => request<Space>  ('POST',   '/api/spaces', { name }),
    get:          (id: string)                          => request<Space>  ('GET',    `/api/spaces/${id}`),
    update:       (id: string, name: string)            => request<Space>  ('PATCH',  `/api/spaces/${id}`, { name }),
    delete:       (id: string)                          => request<{ ok: boolean }>('DELETE', `/api/spaces/${id}`),
    objects:      (id: string)                          => request<Obj[]>  ('GET',    `/api/spaces/${id}/objects`),
    createObject: (id: string, data: Record<string, unknown>) =>
      request<Obj>('POST', `/api/spaces/${id}/objects`, data),
    reorderObjects: (id: string, ids: string[]) =>
      request<{ ok: boolean }>('POST', `/api/spaces/${id}/objects/reorder`, { ids }),
  },
  objects: {
    get:    (id: string)                               => request<Obj>('GET',   `/api/objects/${id}`),
    update: (id: string, data: Record<string, unknown>) => request<Obj>('PATCH', `/api/objects/${id}`, data),
    delete: (id: string)                               => request<{ ok: boolean }>('DELETE', `/api/objects/${id}`),
  },
}

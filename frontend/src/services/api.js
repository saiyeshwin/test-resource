const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://35.154.124.181:8080/api'


const getToken = () => localStorage.getItem('rm_token')



async function request(path, options = {}) {

  const headers = {

    ...(options.headers || {}),

  }



  if (!(options.body instanceof FormData)) {

    headers['Content-Type'] = 'application/json'

  }



  const token = getToken()

  if (token) {

    headers['Authorization'] = `Bearer ${token}`

  }



  const response = await fetch(`${API_BASE}${path}`, {

    ...options,

    headers,

  })



  const contentType = response.headers.get('content-type') || ''

  const text = await response.text()

  const payload = contentType.includes('application/json') && text ? JSON.parse(text) : text



  if (!response.ok) {

    const errorMessage = payload?.message || payload || response.statusText || 'Request failed'

    throw new Error(errorMessage)

  }



  return payload

}



export const api = {

  get: path => request(path, { method: 'GET' }),

  post: (path, data) => request(path, {

    method: 'POST',

    body: data instanceof FormData ? data : JSON.stringify(data),

    headers: data instanceof FormData ? {} : undefined

  }),

  put: (path, data) => request(path, {

    method: 'PUT',

    body: data instanceof FormData ? data : JSON.stringify(data),

    headers: data instanceof FormData ? {} : undefined

  }),

  delete: path => request(path, { method: 'DELETE' }),

  upload: (path, file) => {

    const form = new FormData()

    form.append('file', file)

    return request(path, {

      method: 'POST',

      body: form,

      headers: {}

    })

  }

}




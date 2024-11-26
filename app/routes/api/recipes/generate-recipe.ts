import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/recipes/generate-recipe')({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/recipes/generate-recipe"!' })
  },
})

import { FalClient } from '@fal-ai/client'

const falClient = new FalClient({
  credentials: import.meta.env.VITE_FAL_KEY,
})

export default falClient 
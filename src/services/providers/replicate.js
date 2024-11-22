import Replicate from 'replicate'

const replicate = new Replicate({
  auth: import.meta.env.VITE_REPLICATE_API_KEY
})

export default replicate 
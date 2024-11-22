import { PortkeyClient } from 'portkey-ai'

const portkey = new PortkeyClient({
  apiKey: import.meta.env.VITE_PORTKEY_API_KEY,
})

export default portkey 
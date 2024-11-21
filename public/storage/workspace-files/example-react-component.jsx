import React, { useState } from 'react'
import { Button } from './ui/button'

export function ExampleComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-4">
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(prev => prev + 1)}>
        Increment
      </Button>
    </div>
  )
}
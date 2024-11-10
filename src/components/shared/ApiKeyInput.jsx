import React, { useState } from 'react'
import { useOpenAI } from '@/context/OpenAIContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ApiKeyInput() {
  const { apiKey, setApiKey } = useOpenAI()
  const [inputKey, setInputKey] = useState(apiKey)

  const handleSubmit = (e) => {
    e.preventDefault()
    setApiKey(inputKey)
  }

  return (
    <div className="p-4 mb-4 border rounded-lg bg-background">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="flex-1"
        />
        <Button type="submit">Save API Key</Button>
      </form>
      {!apiKey && (
        <p className="mt-2 text-sm text-red-500">
          Please enter your OpenAI API key to use the services
        </p>
      )}
    </div>
  )
} 
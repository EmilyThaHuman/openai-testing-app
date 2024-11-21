import React, { useState } from 'react'
import { useOpenAI } from '@/hooks/use-openai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function ApiKeyInput() {
  const { apiKey, initialize } = useOpenAI()
  const [inputKey, setInputKey] = useState(apiKey)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await initialize(inputKey)
      toast({
        title: 'Success',
        description: 'API key updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
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

export default React.memo(ApiKeyInput) 
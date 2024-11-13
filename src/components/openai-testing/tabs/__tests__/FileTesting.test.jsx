import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils'
import FileTesting from '../FileTesting'
import { UnifiedOpenAIService } from '@/services/openai/unifiedOpenAIService'
import { beforeEach } from 'vitest'

// Mock the UnifiedOpenAIService
vi.mock('@/services/openai/unifiedOpenAIService', () => ({
  UnifiedOpenAIService: {
    listFiles: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    retrieveFile: vi.fn(),
  },
}))

describe('FileTesting', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders file testing interface', () => {
    render(<FileTesting />)
    expect(screen.getByText('File Upload')).toBeInTheDocument()
    expect(screen.getByText('Files List')).toBeInTheDocument()
  })

  it('handles file upload', async () => {
    UnifiedOpenAIService.uploadFile.mockResolvedValueOnce({ id: '123' })
    UnifiedOpenAIService.listFiles.mockResolvedValueOnce({ data: [] })

    render(<FileTesting />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/Source/i)
    
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByText('Upload File'))

    await waitFor(() => {
      expect(UnifiedOpenAIService.uploadFile).toHaveBeenCalledWith(file)
    })
  })
}) 
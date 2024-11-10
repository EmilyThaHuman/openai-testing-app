import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { OpenAIProvider } from '@/context/OpenaiContext'
import { ChatProvider } from '@/context/ChatContext'
import PropTypes from 'prop-types'

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <OpenAIProvider>
        <ChatProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ChatProvider>
      </OpenAIProvider>
    </ThemeProvider>
  )
}

AllTheProviders.propTypes = {
  children: PropTypes.node.isRequired,
}

const customRender = (ui, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render } 
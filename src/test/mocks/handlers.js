import { rest } from 'msw'

export const handlers = [
  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.json({
        choices: [
          {
            message: {
              content: 'Test response',
              role: 'assistant'
            }
          }
        ]
      })
    )
  }),
  
] 
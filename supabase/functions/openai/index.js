import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.js';

Deno.serve(async req => {
  const { query } = await req.json();
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const openai = new OpenAI(apiKey);

  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: query }],
    stream: false,
  });

  const reply = chatCompletion.choices[0].message.content;

  return new Response(reply, {
    headers: { 'Content-Type': 'text/plain' },
  });
});

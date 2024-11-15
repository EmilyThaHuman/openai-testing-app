import { fal } from '@fal-ai/client';
import PropTypes from 'prop-types';

export const falAiStableDiffusion3Medium = async (
  mentionTool,
  userMessage,
  streamable
) => {
  const result = await fal.subscribe('fal-ai/stable-diffusion3-medium', {
    input: {
      prompt: userMessage,
      sync_mode: true,
    },
    logs: true,
    onQueueUpdate: update => {
      if (update.status === 'IN_PROGRESS' && update.logs) {
        update.logs.map(log => log.message).forEach(console.log);
      }
    },
  });

  if (result.images && result.images.length > 0) {
    const imageUrl = result.images[0].url;
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    let base64data = Buffer.from(buffer).toString('base64');
    base64data = `data:image/png;base64,${base64data}`;
    streamable.done({ falBase64Image: base64data });
  } else {
    streamable.done({ llmResponseEnd: true });
  }
  return;
};

falAiStableDiffusion3Medium.propTypes = {
  mentionTool: PropTypes.string.isRequired,
  userMessage: PropTypes.string.isRequired,
  streamable: PropTypes.object.isRequired,
};

export default falAiStableDiffusion3Medium;

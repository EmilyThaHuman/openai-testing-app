export async function lookupTool(mentionTool, userMessage, streamable, file) {
  const toolInfo = AI_TOOL_CONFIG.mentionTools.find(
    tool => tool.id === mentionTool
  );
  if (toolInfo) {
    if (file) {
      const decodedFile = await Buffer.from(file, 'base64')
        .toString('utf-8')
        .replace(/^data:image\/\w+;base64,/, '');
      await mentionFunctions[toolInfo.functionName](
        mentionTool,
        userMessage + 'File Content: ' + decodedFile,
        streamable
      );
    } else {
      await mentionFunctions[toolInfo.functionName](
        mentionTool,
        userMessage,
        streamable
      );
    }
  }
}

lookupTool.propTypes = {
  mentionTool: PropTypes.string.isRequired,
  userMessage: PropTypes.string.isRequired,
  streamable: PropTypes.any.isRequired,
  file: PropTypes.string,
};

export default lookupTool;

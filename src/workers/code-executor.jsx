self.onmessage = async (event) => {
  const { code, language } = event.data;
  
  try {
    let result;
    
    switch (language) {
      case 'javascript':
        result = await executeJavaScript(code);
        break;
      case 'python':
        result = await executePython(code);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    
    self.postMessage({ output: result });
  } catch (error) {
    self.postMessage({ 
      error: error instanceof Error ? error.message : 'Execution failed' 
    });
  }
};

async function executeJavaScript(code) {
  const context = {
    console: {
      log: (...args) => logs.push(args.join(' ')),
      error: (...args) => errors.push(args.join(' '))
    }
  };

  const logs = [];
  const errors = [];

  try {
    const fn = new Function('context', `
      with (context) {
        ${code}
      }
    `);
    
    await fn(context);
    return logs.join('\n');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Execution failed');
  }
}

async function executePython(code) {
  // Implement Python execution using Pyodide or similar
  throw new Error('Python execution not implemented');
}

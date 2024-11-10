/**
 * @typedef {Object} ExecutionResult
 * @property {string} output
 * @property {string} [error]
 */

export class CodeExecutor {
  constructor() {
    /** @type {Worker|null} */
    this.worker = null;
  }

  /**
   * @param {string} code
   * @param {string} language
   * @returns {Promise<ExecutionResult>}
   */
  async execute(code, language) {
    if (this.worker) {
      this.worker.terminate();
    }

    return new Promise((resolve) => {
      this.worker = new Worker(
        new URL('../workers/code-executor.js', import.meta.url)
      );

      this.worker.onmessage = (event) => {
        resolve(event.data);
        this.worker?.terminate();
        this.worker = null;
      };

      this.worker.postMessage({ code, language });
    });
  }
}

const fs = require('fs-extra')
const path = require('path')

const workerFiles = [
  ['editor.worker.js', 'vs/base/worker/workerMain.js'],
  ['json.worker.js', 'vs/language/json/jsonWorker.js'],
  ['css.worker.js', 'vs/language/css/cssWorker.js'],
  ['html.worker.js', 'vs/language/html/htmlWorker.js'],
  ['ts.worker.js', 'vs/language/typescript/tsWorker.js']
]

async function copyWorkers() {
  const monacoPath = path.join(__dirname, '../node_modules/monaco-editor/min')
  const publicPath = path.join(__dirname, '../public/monaco-editor')

  await fs.ensureDir(publicPath)

  for (const [dest, source] of workerFiles) {
    await fs.copy(
      path.join(monacoPath, source),
      path.join(publicPath, dest)
    )
  }
}

copyWorkers().catch(console.error) 
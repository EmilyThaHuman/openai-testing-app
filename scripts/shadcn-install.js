import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const components = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "button",
  "calendar",
  "card",
  "checkbox",
  "collapsible",
  "command",
  "context-menu",
  "dialog",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "label",
  "menubar",
  "navigation-menu",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "skeleton",
  "slider",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "tooltip"
]

const targetDir = path.join(process.cwd(), 'src', 'components', 'ui')

// Create the ui directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// Install each component
components.forEach(component => {
  try {
    console.log(`Installing ${component}...`)
    execSync(`npx shadcn-ui@latest add ${component} --yes`, { stdio: 'inherit' })
  } catch (error) {
    console.error(`Failed to install ${component}:`, error)
  }
}) 
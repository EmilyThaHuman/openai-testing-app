import fs from 'fs/promises';
import path from 'path';

const sourceDirs = [
  'utils',
  'pages',
  'store',
  'services',
  'components',
  'actions',
];
const targetDir = 'data/js';

async function createDirectoryIfNotExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function processDirectory(src, destDir) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(srcPath, destDir);
    } else {
      // Generate a unique filename to avoid conflicts
      const baseFileName = entry.name.endsWith('.jsx')
        ? entry.name.replace('.jsx', '.js')
        : entry.name;

      // Create a filename that includes parent directory names to avoid conflicts
      const parentDir = path.relative('src', path.dirname(srcPath));
      const uniqueFileName = parentDir
        .split(path.sep)
        .filter(part => part !== '.')
        .concat(baseFileName)
        .join('_');

      const destPath = path.join(destDir, uniqueFileName);

      await fs.copyFile(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

async function main() {
  try {
    // Create or clean the contextExport directory
    try {
      await fs.rm(targetDir, { recursive: true });
    } catch (err) {
      // Directory doesn't exist, that's fine
    }
    await createDirectoryIfNotExists(targetDir);

    // Process each source directory
    for (const dir of sourceDirs) {
      const sourcePath = path.join('src', dir);

      try {
        await fs.access(sourcePath);
        console.log(`Processing directory: ${dir}`);
        await processDirectory(sourcePath, targetDir);
      } catch (error) {
        console.warn(`Directory ${dir} not found in src, skipping...`);
      }
    }

    console.log('Context compilation completed successfully!');
  } catch (error) {
    console.error('Error during context compilation:', error);
    process.exit(1);
  }
}

main();

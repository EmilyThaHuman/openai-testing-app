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
const targetDir = 'contextExport';

async function createDirectoryIfNotExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function copyDirectory(src, dest) {
  await createDirectoryIfNotExists(dest);

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      // If the file is .jsx, change the extension to .js in the destination
      const destFileName = entry.name.endsWith('.jsx')
        ? entry.name.replace('.jsx', '.js')
        : entry.name;
      const finalDestPath = path.join(path.dirname(destPath), destFileName);

      await fs.copyFile(srcPath, finalDestPath);
      console.log(`Copied: ${srcPath} -> ${finalDestPath}`);
    }
  }
}

async function main() {
  try {
    // Create the root contextExport directory
    await createDirectoryIfNotExists(targetDir);

    // Process each source directory
    for (const dir of sourceDirs) {
      const sourcePath = path.join('src', dir);
      const destPath = path.join(targetDir, dir);

      try {
        await fs.access(sourcePath);
        console.log(`Processing directory: ${dir}`);
        await copyDirectory(sourcePath, destPath);
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

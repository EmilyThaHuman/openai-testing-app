import { PuppeteerWebBaseLoader } from 'langchain/document_loaders/web/puppeteer';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export async function scrapeWebsite({ url }) {
  try {
    const websiteName = new URL(url).hostname;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDirectory = path.join('.', 'output');
    
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    
    const saveFileName = `${websiteName}_${timestamp}.html`;
    const saveFilePathWithDate = path.join(outputDirectory, saveFileName);
    
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: 'new',
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      async evaluate(page, browser) {
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        fs.writeFileSync(saveFilePathWithDate, html);
        return `Website HTML saved to ${saveFilePathWithDate}`;
      },
    });
    
    await loader.load();
    return `Website HTML saved to ${saveFilePathWithDate}`;
  } catch (error) {
    logger.error('Error occurred while scraping HTML:', error);
    throw error;
  }
} 
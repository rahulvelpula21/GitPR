import fs from 'fs';
import path from 'path';

// Define the structure of our configuration
export interface IConfig {
  azure_devops: {
    pat_token: string;
    default_target_branch: string;
  };
  reviewers: string[];
  teams_webhook_url?: string;
}

const configPath = path.join(process.cwd(), 'config.json');

/**
 * Loads the configuration from config.json
 * @returns {IConfig} The loaded configuration object
 */
export function loadConfig(): IConfig {
  if (!fs.existsSync(configPath)) {
    console.error("❌ Configuration file 'config.json' not found. Please run 'npm run dev -- setup' first.");
    process.exit(1);
  }
  const rawData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(rawData) as IConfig;
}

/**
 * Saves the configuration object to config.json
 * @param {IConfig} config The configuration object to save
 */
export function saveConfig(config: IConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ Configuration saved to ${configPath}`);
}
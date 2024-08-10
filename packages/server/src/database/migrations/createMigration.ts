import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the migrations directory if it doesn't exist
const migrationDir = path.join(__dirname, 'migrationScripts');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir);
}

// current timestamp in the format YYYYMMDDHHMMSS
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

// migration name from the command line arguments, default to 'migration'
const migrationName = process.argv[2] || 'migration';
const migrationFileName = `${timestamp}_${migrationName}.ts`;
const migrationFilePath = path.join(migrationDir, migrationFileName);


const migrationTemplate = `import db from '../config/database';
import { sql } from 'kysely';

export async function up() {
  // Define the schema changes for the up migration here
}

export async function down() {
  // Define the schema changes for the down migration here
}
`;

// write  template to new file
fs.writeFileSync(migrationFilePath, migrationTemplate);

console.log(`Created migration file: ${migrationFilePath}`);

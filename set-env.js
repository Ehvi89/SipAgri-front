const fs = require('fs');
const dotenv = require('dotenv');

const env = process.env.ANGULAR_ENV || 'development'; // par défaut dev
const envFile = `.env.${env}`;

// Charger le bon fichier .env
dotenv.config({ path: envFile });

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error(`❌ GOOGLE_MAPS_API_KEY n'est pas défini dans ${envFile}`);
  process.exit(1);
}

// On génère un fichier TypeScript lisible par Angular
const targetPath = './src/environments/environment.ts';

const envConfigFile = `// ⚠️ Ce fichier est généré automatiquement par set-env.js
export const environment = {
  prod: ${env === 'production'},
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY}',
  apiUrl: '${process.env.API_URL}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`✅ Fichier d'environnement généré depuis ${envFile}`);

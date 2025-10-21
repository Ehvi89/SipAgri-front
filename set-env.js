const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

try {
  const env = process.env.ANGULAR_ENV || 'development';
  const envFile = `.env.${env}`;

  console.log(`🎯 Démarrage de la génération de l'environnement: ${env}`);

  // Charger le fichier .env s'il existe
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    console.log(`📁 Fichier ${envFile} chargé avec succès`);
  } else {
    console.log(`ℹ️ Fichier ${envFile} non trouvé, utilisation des variables d'environnement`);
  }

  // Vérification des variables obligatoires
  const requiredVars = {
    'GOOGLE_MAPS_API_KEY': process.env.GOOGLE_MAPS_API_KEY,
    'API_URL': process.env.API_URL
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error(`❌ Variables manquantes: ${missingVars.join(', ')}`);
    console.error('💡 Vérifiez vos secrets GitHub Actions ou votre fichier .env');
    process.exit(1);
  }

  // Préparer le chemin de destination
  const targetPath = './src/environments/environment.ts';
  const targetDir = path.dirname(targetPath);

  // Créer le dossier si nécessaire
  if (!fs.existsSync(targetDir)) {
    console.log(`📁 Création du dossier: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Générer le contenu du fichier environment.ts
  const envConfigFile = `// ⚠️ Ce fichier est généré automatiquement - NE PAS MODIFIER MANUELLEMENT
// Généré le: ${new Date().toISOString()}
// Environment: ${env}
export const environment = {
  prod: ${env === 'production'},
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY}',
  apiUrl: '${process.env.API_URL}'
};
`;

  // Écrire le fichier
  fs.writeFileSync(targetPath, envConfigFile, 'utf8');

  // Vérifier que le fichier a été créé
  if (fs.existsSync(targetPath)) {
    console.log(`✅ Fichier d'environnement généré avec succès: ${targetPath}`);
    console.log(`📊 Statistiques:`);
    console.log(`   - Environment: ${env}`);
    console.log(`   - Production: ${env === 'production'}`);
    console.log(`   - Taille du fichier: ${envConfigFile.length} caractères`);
  } else {
    throw new Error(`Le fichier ${targetPath} n'a pas pu être créé`);
  }

} catch (error) {
  console.error('💥 Erreur lors de la génération du fichier d\'environnement:');
  console.error(error.message);
  process.exit(1);
}

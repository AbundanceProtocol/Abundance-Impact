#!/usr/bin/env node

/**
 * Script to update all router imports from next/router to useAppRouter
 * This helps migrate components to work with both Pages Router and App Router
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to match files that import useRouter from next/router
const patterns = [
  'components/**/*.js',
  'components/**/*.jsx',
  'pages/**/*.js',
  'pages/**/*.jsx',
  'hooks/**/*.js',
  'hooks/**/*.jsx'
];

// Files to exclude (already updated or special cases)
const excludeFiles = [
  'hooks/useAppRouter.js',
  'APP_ROUTER_MIGRATION.md',
  'scripts/update-router-imports.js'
];

function updateRouterImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file imports useRouter from next/router
    if (content.includes("import { useRouter } from 'next/router'") || 
        content.includes('import { useRouter } from "next/router"')) {
      
      console.log(`🔄 Updating: ${filePath}`);
      
      // Replace the import
      let updatedContent = content
        .replace(/import \{ useRouter \} from ['"]next\/router['"];?/g, 
                "import { useAppRouter } from '../hooks/useAppRouter';")
        .replace(/import \{ useRouter \} from ['"]next\/router['"];?/g, 
                'import { useAppRouter } from "../hooks/useAppRouter";');
      
      // Update the hook usage
      updatedContent = updatedContent
        .replace(/\bconst router = useRouter\(\)/g, 'const router = useAppRouter()')
        .replace(/\bconst router = useRouter\(\)/g, 'const router = useAppRouter()');
      
      // Fix relative paths for different directory depths
      const relativePath = path.relative(path.dirname(filePath), 'hooks');
      const importPath = relativePath === 'hooks' ? './hooks/useAppRouter' : `${relativePath}/hooks/useAppRouter`;
      
      updatedContent = updatedContent
        .replace(/from ['"]\.\.\/hooks\/useAppRouter['"]/g, `from '${importPath}'`)
        .replace(/from ['"]\.\.\/hooks\/useAppRouter['"]/g, `from "${importPath}"`);
      
      // Write the updated content
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting router import updates...\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: excludeFiles });
    
    files.forEach(filePath => {
      totalFiles++;
      if (updateRouterImports(filePath)) {
        updatedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files updated: ${updatedFiles}`);
  console.log(`Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n🎉 Successfully updated ${updatedFiles} files!`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Test your app with 'npm run dev'`);
    console.log(`2. Check for any remaining router errors`);
    console.log(`3. Update any remaining components manually if needed`);
  } else {
    console.log(`\n✨ No files needed updating!`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateRouterImports };

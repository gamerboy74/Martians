import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Generate types using Supabase CLI
try {
  execSync('supabase gen types typescript --local > src/types/supabase.ts');
  console.log('✅ Types generated successfully');
} catch (error) {
  console.error('❌ Error generating types:', error);
  process.exit(1);
}

// Format the generated types file
try {
  execSync('prettier --write src/types/supabase.ts');
  console.log('✅ Types formatted successfully');
} catch (error) {
  console.error('❌ Error formatting types:', error);
  process.exit(1);
}
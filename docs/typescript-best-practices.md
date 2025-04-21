# TypeScript Best Practices for This Project

## File Structure and Naming

1. **Use TypeScript files only in the source directory**
   - Write all source code in `.ts` or `.tsx` files
   - Never maintain parallel `.js` and `.ts` files with the same name
   - JavaScript files will be generated in the `dist` directory during build

2. **Descriptive Module Names**
   - Use descriptive file names that clearly indicate purpose
   - Example: `supabase-client.ts` instead of generic `supabase.ts`

## Imports and Exports

1. **Named Exports**
   - Prefer named exports for better discoverability and explicit imports
   - Example: `export const supabase = createClient(...)`

2. **Import Paths**
   - Use absolute imports with alias for improved readability
   - Example: `import { supabase } from '@/lib/supabase-client'`
   - Avoid relative imports like `../../../lib/supabase-client` when possible

## TypeScript Configuration

1. **Output Control**
   - The project is configured to not output JS files directly from TS (noEmit: true)
   - Vite handles the compilation during bundling
   - Built files go to the `dist` directory

2. **Module Resolution**
   - We use ESM (ECMAScript Modules) as specified in package.json (`"type": "module"`)
   - Always use import/export syntax, not require()

## Handling Legacy Code

If you encounter issues with duplicate JS/TS files:

1. Run the cleanup script: `npm run cleanup`
2. If files need to be deleted: `npm run cleanup:delete`
3. Update imports to reference the correct TypeScript files

## Troubleshooting

If you get import errors, check:

1. Are you importing from the correct file? (TypeScript, not JavaScript)
2. Is the export exposed correctly in the module?
3. Did you check for duplicate JS files that might be causing conflicts?

## Refactoring Best Practices

When renaming or moving modules:

1. Create a temporary re-export file in the old location to maintain compatibility
2. Update imports in all files to use the new location
3. Remove the re-export file once all imports have been updated 
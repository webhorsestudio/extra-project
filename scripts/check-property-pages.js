const fs = require('fs');
const path = require('path');

function checkPropertyPages() {
  console.log('🔍 Checking for duplicate property pages...\n');

  const appDir = path.join(__dirname, '../src/app');
  const propertyPages = [];

  // Recursively find all property page files
  function findPropertyPages(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Check if this is a property-related directory
        if (item === 'properties') {
          const pagePath = path.join(fullPath, 'page.tsx');
          if (fs.existsSync(pagePath)) {
            propertyPages.push({
              path: path.join(relativePath, item, 'page.tsx'),
              fullPath: pagePath,
              type: 'listing'
            });
          }
          
          // Check for [id] or [slug] subdirectories
          const subDirs = fs.readdirSync(fullPath);
          for (const subDir of subDirs) {
            if (subDir === '[id]' || subDir === '[slug]') {
              const detailPagePath = path.join(fullPath, subDir, 'page.tsx');
              if (fs.existsSync(detailPagePath)) {
                propertyPages.push({
                  path: path.join(relativePath, item, subDir, 'page.tsx'),
                  fullPath: detailPagePath,
                  type: 'detail'
                });
              }
            }
          }
        }
        
        // Continue searching in subdirectories
        findPropertyPages(fullPath, path.join(relativePath, item));
      }
    }
  }

  findPropertyPages(appDir);

  console.log('📋 Found property pages:');
  propertyPages.forEach(page => {
    console.log(`  - ${page.path} (${page.type})`);
  });

  // Check for potential duplicates
  const detailPages = propertyPages.filter(p => p.type === 'detail');
  const listingPages = propertyPages.filter(p => p.type === 'listing');

  console.log(`\n📊 Summary:`);
  console.log(`  - Detail pages: ${detailPages.length}`);
  console.log(`  - Listing pages: ${listingPages.length}`);

  // Check for potential issues
  const issues = [];

  if (detailPages.length > 3) {
    issues.push(`⚠️  Too many detail pages found (${detailPages.length}). Expected max 3 (web, mobile, admin).`);
  }

  if (listingPages.length > 3) {
    issues.push(`⚠️  Too many listing pages found (${listingPages.length}). Expected max 3 (web, mobile, admin).`);
  }

  // Check for specific expected routes
  const expectedRoutes = [
    'properties/[id]/page.tsx',
    'm/properties/[id]/page.tsx', 
    'admin/properties/[id]/page.tsx'
  ];

  const missingRoutes = expectedRoutes.filter(route => 
    !propertyPages.some(page => page.path.includes(route))
  );

  if (missingRoutes.length > 0) {
    issues.push(`❌ Missing expected routes: ${missingRoutes.join(', ')}`);
  }

  // Check for unexpected routes
  const unexpectedRoutes = propertyPages.filter(page => 
    !expectedRoutes.some(route => page.path.includes(route))
  );

  if (unexpectedRoutes.length > 0) {
    issues.push(`⚠️  Unexpected routes found: ${unexpectedRoutes.map(p => p.path).join(', ')}`);
  }

  if (issues.length === 0) {
    console.log('\n✅ Property page structure looks good!');
  } else {
    console.log('\n🚨 Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }

  return issues.length === 0;
}

// Run the check
if (require.main === module) {
  checkPropertyPages();
}

module.exports = { checkPropertyPages }; 
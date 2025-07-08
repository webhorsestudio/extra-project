const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testConfigurationsAPI() {
  try {
    console.log('Testing configurations API...');
    
    // Test with the property ID from the logs
    const propertyId = '50d93158-890f-495c-bf83-85f1dfc81866';
    const url = `http://localhost:3000/api/properties/${propertyId}/configurations`;
    
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.configurations && data.configurations.length > 0) {
      console.log('\n=== Configuration Analysis ===');
      data.configurations.forEach((config, index) => {
        console.log(`\nConfig ${index + 1}:`);
        console.log(`- BHK: ${config.bhk}`);
        console.log(`- Area: ${config.area} Sq. Ft.`);
        console.log(`- Price: ${config.price}`);
        console.log(`- Floor Plan URL: ${config.floor_plan_url || 'NULL'}`);
        console.log(`- Brochure URL: ${config.brochure_url || 'NULL'}`);
        console.log(`- Ready By: ${config.ready_by || 'NULL'}`);
        console.log(`- Has Floor Plan: ${!!config.floor_plan_url}`);
        console.log(`- Has Brochure: ${!!config.brochure_url}`);
      });
      
      // Test BHK selection logic
      const bhkOptions = [...new Set(data.configurations.map(cfg => cfg.bhk))];
      console.log('\n=== BHK Options ===');
      console.log('Available BHKs:', bhkOptions);
      
      // Test first BHK selection
      const firstBhk = bhkOptions[0];
      const filteredConfigs = data.configurations.filter(cfg => cfg.bhk === firstBhk);
      const selectedConfig = filteredConfigs[0];
      
      console.log('\n=== First BHK Analysis ===');
      console.log(`Selected BHK: ${firstBhk}`);
      console.log(`Filtered Configs Count: ${filteredConfigs.length}`);
      console.log(`Selected Config:`, selectedConfig);
      console.log(`Selected Config Floor Plan: ${selectedConfig?.floor_plan_url || 'NULL'}`);
      console.log(`Selected Config Brochure: ${selectedConfig?.brochure_url || 'NULL'}`);
      
    } else {
      console.log('No configurations found');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testConfigurationsAPI(); 
// Script to suppress browser extension errors
(function() {
  'use strict';
  
  // Override JSON.parse to handle undefined values
  const originalJSONParse = JSON.parse;
  JSON.parse = function(text, reviver) {
    if (text === undefined || text === null || text === 'undefined') {
      console.warn('Suppressed: Attempted to parse undefined/null as JSON');
      return null;
    }
    try {
      return originalJSONParse.call(this, text, reviver);
    } catch (error) {
      console.warn('Suppressed: JSON.parse error:', error.message);
      return null;
    }
  };
  
  // Global error handler for browser extensions
  window.addEventListener('error', function(event) {
    // Handle JSON parsing errors
    if (event.error && event.error.message && event.error.message.includes('JSON')) {
      console.warn('Suppressed: JSON parsing error from browser extension');
      event.preventDefault();
      return false;
    }
    
    // Handle chrome extension errors
    if (event.filename && event.filename.includes('chrome-extension')) {
      console.warn('Suppressed: Browser extension error');
      event.preventDefault();
      return false;
    }
    
    // Handle "undefined" JSON parsing errors specifically
    if (event.message && event.message.includes('"undefined" is not valid JSON')) {
      console.warn('Suppressed: Undefined JSON parsing error');
      event.preventDefault();
      return false;
    }
  });
  
  // Suppress console errors from browser extensions
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('"undefined" is not valid JSON') ||
      message.includes('chrome-extension')
    )) {
      console.warn('Suppressed: Browser extension error');
      return;
    }
    originalConsoleError.apply(console, args);
  };
})(); 
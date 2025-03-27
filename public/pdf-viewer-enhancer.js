
// PDF Viewer Enhancer Script
// This script is a minimal enhancement for the PDF.js viewer

(function() {
  console.log("PDF Viewer Enhancer loaded");
  
  // This script now relies more on the built-in PDF.js viewer capabilities
  // We're using URL parameters to configure the viewer instead of direct JS manipulation

  // This function can be used for additional customization if needed in the future
  function observeViewerChanges() {
    // Set up a mutation observer to detect when the PDF.js viewer is fully loaded
    // This allows for potential future enhancements without modifying the core component
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && document.querySelector('.pdfViewer')) {
          console.log("PDF.js viewer fully initialized");
          observer.disconnect();
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Initialize observer
  observeViewerChanges();
})();

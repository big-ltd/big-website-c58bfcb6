
// PDF Viewer Enhancer Script
// This script enhances the PDF.js viewer with custom controls

(function() {
  console.log("PDF Viewer Enhancer loaded");
  
  // Add styles to hide the download button
  function addCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Hide download button */
      #download {
        display: none !important;
      }
      
      /* Custom fullscreen styles */
      body.custom-fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        z-index: 9999;
        background: white;
      }
      
      body.custom-fullscreen #viewerContainer {
        position: absolute;
        top: 32px;
        left: 0;
        right: 0;
        bottom: 0;
      }
      
      /* Make sure thumbnails are visible */
      #sidebarContainer {
        display: block !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Toggle custom fullscreen mode
  let isInFullscreen = false;
  function toggleCustomFullscreen() {
    isInFullscreen = !isInFullscreen;
    document.body.classList.toggle('custom-fullscreen', isInFullscreen);
    
    // Inform the parent window about fullscreen state change
    window.parent.postMessage({ 
      type: 'fullscreenChange', 
      isFullscreen: isInFullscreen 
    }, '*');
    
    // Force resize to ensure proper layout
    window.dispatchEvent(new Event('resize'));
  }
  
  // Observe when the viewer is fully loaded
  function observeViewerChanges() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && document.querySelector('.pdfViewer')) {
          console.log("PDF.js viewer fully initialized");
          
          // Setup is complete, add event listeners
          setupEventListeners();
          
          // Add custom styles to hide download button
          addCustomStyles();
          
          observer.disconnect();
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Setup message listener for parent window communication
  function setupEventListeners() {
    // Listen for messages from the parent window
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'toggleFullscreen') {
        toggleCustomFullscreen();
      }
    });
    
    // Add keyboard support for ESC key to exit fullscreen
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && isInFullscreen) {
        toggleCustomFullscreen();
      }
    });
  }
  
  // Initialize
  observeViewerChanges();
})();


// PDF Viewer Enhancer Script
// This script is injected into the PDF viewer iframe to enhance performance and add custom navigation

(function() {
  // Listen for messages from the parent window
  window.addEventListener('message', function(event) {
    // Make sure the message is from a trusted source
    if (event.origin === window.location.origin || event.origin === '') {
      // Handle navigation commands
      if (event.data && event.data.type === 'nextPage') {
        goToNextPage();
      } else if (event.data && event.data.type === 'previousPage') {
        goToPreviousPage();
      }
    }
  });

  // Functions to navigate the PDF
  function goToNextPage() {
    // Get the PDF viewer instance (works with PDF.js)
    const pdfViewer = getPDFViewerInstance();
    if (pdfViewer) {
      const currentPage = pdfViewer.page || pdfViewer.currentPageNumber;
      const pageCount = pdfViewer.pagesCount || pdfViewer.pagesCount;
      
      if (currentPage < pageCount) {
        pdfViewer.page = currentPage + 1;
        // For alternate PDF.js versions
        if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage + 1;
        }
      }
    } else {
      // Fallback: try to use keyboard event to trigger built-in navigation
      simulateKeyEvent('ArrowDown');
    }
  }

  function goToPreviousPage() {
    // Get the PDF viewer instance
    const pdfViewer = getPDFViewerInstance();
    if (pdfViewer) {
      const currentPage = pdfViewer.page || pdfViewer.currentPageNumber;
      
      if (currentPage > 1) {
        pdfViewer.page = currentPage - 1;
        // For alternate PDF.js versions
        if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage - 1;
        }
      }
    } else {
      // Fallback: try to use keyboard event
      simulateKeyEvent('ArrowUp');
    }
  }

  // Helper to get PDF.js viewer instance
  function getPDFViewerInstance() {
    // Try different possible PDF.js viewer instances
    if (window.PDFViewerApplication && window.PDFViewerApplication.pdfViewer) {
      return window.PDFViewerApplication.pdfViewer;
    } else if (window.viewer) {
      return window.viewer;
    } else if (window.pdfViewer) {
      return window.pdfViewer;
    }
    
    // No viewer found
    return null;
  }

  // Simulate keyboard event as fallback navigation method
  function simulateKeyEvent(key) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key === 'ArrowDown' ? 'ArrowDown' : 'ArrowUp',
      keyCode: key === 'ArrowDown' ? 40 : 38,
      which: key === 'ArrowDown' ? 40 : 38,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  // Optimize PDF rendering when possible
  if (window.PDFViewerApplication) {
    window.PDFViewerApplication.initializedPromise.then(() => {
      // Reduce the rendering resolution for better performance
      if (window.PDFViewerApplication.pdfViewer) {
        // Only render visible pages
        window.PDFViewerApplication.pdfViewer.scrollMode = 1; // vertical scroll
        window.PDFViewerApplication.pdfViewer.spreadMode = 0; // no spreads
        
        // Reduce quality slightly for better performance
        if (window.PDFViewerApplication.pdfViewer.defaultRenderingQueue) {
          window.PDFViewerApplication.pdfViewer.defaultRenderingQueue.highestPriorityPage = true;
        }
      }
    });
  }
})();


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
        // Set the page number directly
        if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage + 1;
        } else if (typeof pdfViewer.page !== 'undefined') {
          pdfViewer.page = currentPage + 1;
        }
        
        // Scroll to ensure the page is visible
        scrollToPage(currentPage + 1);
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
        // Set the page number directly
        if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage - 1;
        } else if (typeof pdfViewer.page !== 'undefined') {
          pdfViewer.page = currentPage - 1;
        }
        
        // Scroll to ensure the page is visible
        scrollToPage(currentPage - 1);
      }
    } else {
      // Fallback: try to use keyboard event
      simulateKeyEvent('ArrowUp');
    }
  }

  // Helper function to scroll to a specific page
  function scrollToPage(pageNumber) {
    try {
      // Try different methods to ensure the page is visible
      const pdfViewer = getPDFViewerInstance();
      
      // Method 1: Use scrollIntoView if available
      if (pdfViewer && pdfViewer.container) {
        const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          return;
        }
      }
      
      // Method 2: Try PDF.js specific methods
      if (window.PDFViewerApplication) {
        if (window.PDFViewerApplication.pdfViewer && window.PDFViewerApplication.pdfViewer.scrollPageIntoView) {
          window.PDFViewerApplication.pdfViewer.scrollPageIntoView({ pageNumber });
          return;
        }
      }
      
      // Method 3: Find page container and scroll to it
      const pageContainers = document.querySelectorAll('.page');
      if (pageContainers && pageContainers.length >= pageNumber) {
        pageContainers[pageNumber - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } catch (error) {
      console.error('Error scrolling to page:', error);
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
    // Wait for PDF.js to initialize
    window.PDFViewerApplication.initializedPromise.then(() => {
      if (window.PDFViewerApplication.pdfViewer) {
        // Set vertical scroll mode for better navigation
        window.PDFViewerApplication.pdfViewer.scrollMode = 1; // vertical scroll
        
        // Disable spread mode (show single pages)
        window.PDFViewerApplication.pdfViewer.spreadMode = 0; // no spreads
        
        // Prioritize visible pages for better performance
        if (window.PDFViewerApplication.pdfViewer.defaultRenderingQueue) {
          window.PDFViewerApplication.pdfViewer.defaultRenderingQueue.highestPriorityPage = true;
        }
        
        // Enable continuous scrolling to show all pages
        if (typeof window.PDFViewerApplication.pdfViewer.setScrollMode === 'function') {
          window.PDFViewerApplication.pdfViewer.setScrollMode(1); // continuous scrolling
        }
      }
    });
  }
})();

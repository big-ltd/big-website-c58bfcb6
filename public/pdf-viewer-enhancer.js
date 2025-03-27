// PDF Viewer Enhancer Script
// This script is injected into the PDF viewer iframe to enhance performance and add custom navigation

(function() {
  console.log("PDF Viewer Enhancer loaded");
  
  // Attempt to configure PDF.js for better performance and continuous scrolling
  function configurePdfViewer() {
    if (window.PDFViewerApplication && window.PDFViewerApplication.initialized) {
      console.log("Configuring PDF.js viewer");
      
      // If PDF.js is detected
      if (window.PDFViewerApplication.pdfViewer) {
        const pdfViewer = window.PDFViewerApplication.pdfViewer;
        
        // Configure for continuous scrolling (show all pages)
        pdfViewer.scrollMode = 1; // vertical scroll mode
        pdfViewer.spreadMode = 0; // no spreads (single page)
        
        // Enable continuous scrolling to show all pages
        if (typeof pdfViewer.setScrollMode === 'function') {
          pdfViewer.setScrollMode(1);
        }
        
        // Force rendering all pages
        if (window.PDFViewerApplication.pdfDocument) {
          const pageCount = window.PDFViewerApplication.pdfDocument.numPages;
          for (let i = 1; i <= pageCount; i++) {
            pdfViewer.getPageView(i - 1)?.draw();
          }
        }
        
        // Improve rendering priority
        if (pdfViewer.renderingQueue) {
          pdfViewer.renderingQueue.highestPriorityPage = true;
        }
      }
    } else {
      // If not initialized, wait and try again
      setTimeout(configurePdfViewer, 500);
    }
  }
  
  // Run configuration as soon as possible
  configurePdfViewer();
  
  // Also try once the document is fully loaded
  document.addEventListener('DOMContentLoaded', configurePdfViewer);
  
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
    console.log("Navigate to next page");
    // Get the PDF viewer instance (works with PDF.js)
    const pdfViewer = getPDFViewerInstance();
    if (pdfViewer) {
      const currentPage = pdfViewer.currentPageNumber || pdfViewer.page || 1;
      const pageCount = pdfViewer.pagesCount || 
                      (window.PDFViewerApplication?.pdfDocument?.numPages) || 
                      document.querySelectorAll('.page').length;
      
      if (currentPage < pageCount) {
        // Set the page number using various methods
        if (window.PDFViewerApplication && window.PDFViewerApplication.page) {
          window.PDFViewerApplication.page = currentPage + 1;
        } else if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage + 1;
        } else if (typeof pdfViewer.page !== 'undefined') {
          pdfViewer.page = currentPage + 1;
        }
        
        // Always scroll to the page to ensure it's visible
        scrollToPage(currentPage + 1);
      }
    } else {
      // Fallback using keyboard simulation
      simulateKeyEvent('ArrowDown');
    }
  }

  function goToPreviousPage() {
    console.log("Navigate to previous page");
    // Get the PDF viewer instance
    const pdfViewer = getPDFViewerInstance();
    if (pdfViewer) {
      const currentPage = pdfViewer.currentPageNumber || pdfViewer.page || 1;
      
      if (currentPage > 1) {
        // Set the page number using various methods
        if (window.PDFViewerApplication && window.PDFViewerApplication.page) {
          window.PDFViewerApplication.page = currentPage - 1;
        } else if (typeof pdfViewer.currentPageNumber !== 'undefined') {
          pdfViewer.currentPageNumber = currentPage - 1;
        } else if (typeof pdfViewer.page !== 'undefined') {
          pdfViewer.page = currentPage - 1;
        }
        
        // Always scroll to the page to ensure it's visible
        scrollToPage(currentPage - 1);
      }
    } else {
      // Fallback using keyboard simulation
      simulateKeyEvent('ArrowUp');
    }
  }

  // Helper function to scroll to a specific page
  function scrollToPage(pageNumber) {
    console.log("Scrolling to page", pageNumber);
    try {
      // Try different methods to ensure the page is visible
      
      // Method 1: Use PDF.js specific methods
      if (window.PDFViewerApplication && 
          window.PDFViewerApplication.pdfViewer && 
          window.PDFViewerApplication.pdfViewer.scrollPageIntoView) {
        window.PDFViewerApplication.pdfViewer.scrollPageIntoView({
          pageNumber: pageNumber,
          destArray: null,
          allowNegativeOffset: false,
          ignoreDestinationZoom: true
        });
        return;
      }
      
      // Method 2: Use data attributes to find page element
      const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
      
      // Method 3: Find page container by class
      const pageContainers = document.querySelectorAll('.page');
      if (pageContainers && pageContainers.length >= pageNumber) {
        pageContainers[pageNumber - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
      
      // Method 4: Find page container by ID
      const pageById = document.getElementById(`pageContainer${pageNumber}`);
      if (pageById) {
        pageById.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        return;
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
    } else if (window.PDFViewerApplication) {
      return window.PDFViewerApplication;
    } else if (window.viewer) {
      return window.viewer;
    } else if (window.pdfViewer) {
      return window.pdfViewer;
    }
    
    // No viewer found
    console.warn("No PDF viewer instance found");
    return null;
  }

  // Simulate keyboard event as fallback navigation method
  function simulateKeyEvent(key) {
    console.log("Simulating key event:", key);
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

  // Initialize PDF viewer configuration
  if (window.PDFViewerApplication) {
    // If the application is already available
    if (window.PDFViewerApplication.initialized) {
      configurePdfViewer();
    } 
    // Otherwise wait for initialization
    else if (window.PDFViewerApplication.initializedPromise) {
      window.PDFViewerApplication.initializedPromise.then(configurePdfViewer);
    }
  } else {
    // If PDFViewerApplication is not available yet, periodically check
    const checkInterval = setInterval(() => {
      if (window.PDFViewerApplication) {
        clearInterval(checkInterval);
        configurePdfViewer();
      }
    }, 500);
    
    // Stop checking after 10 seconds to avoid memory leaks
    setTimeout(() => clearInterval(checkInterval), 10000);
  }
  
  // Add event listener to detect when PDF.js is fully loaded
  document.addEventListener('webviewerloaded', configurePdfViewer);
  window.addEventListener('pdfjs-loaded', configurePdfViewer);
  
  // Force the changes after a delay as a last resort
  setTimeout(configurePdfViewer, 1000);
  setTimeout(configurePdfViewer, 2000);
})();

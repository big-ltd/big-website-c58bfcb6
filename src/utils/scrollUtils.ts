
/**
 * Scrolls to a specific section on the page with section-specific offsets
 * @param id The ID of the section to scroll to
 */
export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    // Default offset for most sections
    let headerOffset = 80;
    
    // Custom offsets for specific sections
    if (id === 'about') {
      headerOffset = 100;
    } else if (id === 'games') {
      headerOffset = 140;
    }
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

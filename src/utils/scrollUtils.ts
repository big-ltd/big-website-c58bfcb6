
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
      headerOffset = 60; // Adjusted for games section negative padding
    } else if (id === 'careers') {
      headerOffset = 184; // Adjusted for careers section 6.5rem top padding (104px) + navbar (80px)
    }
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

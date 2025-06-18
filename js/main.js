document.addEventListener('DOMContentLoaded', function () {
    const caseStudiesSection = document.querySelector('#case-studies');
    if (!caseStudiesSection) return;

    const slidesContainer = caseStudiesSection.querySelector('.carousel-slides');
    const allSlides = Array.from(caseStudiesSection.querySelectorAll('.carousel-slide')); // All slides in DOM
    const nextButton = caseStudiesSection.querySelector('.carousel-control.next');
    const prevButton = caseStudiesSection.querySelector('.carousel-control.prev');
    const dotsContainer = caseStudiesSection.querySelector('.carousel-dots');
    const filterChips = Array.from(caseStudiesSection.querySelectorAll('.filter-chip'));

    if (!slidesContainer || !allSlides.length || !nextButton || !prevButton || !dotsContainer || !filterChips.length) {
        console.warn('Carousel or filter elements not found. Ensure HTML structure is correct.');
        return;
    }

    let visibleSlides = []; // Array of currently visible slides
    let currentIndex = 0;   // Index within the visibleSlides array
    let autoPlayInterval;
    const autoPlayDelay = 5000;

    function updateVisibleSlides() {
        visibleSlides = allSlides.filter(slide => !slide.classList.contains('hidden-by-filter'));
    }

    function generateDots() {
        dotsContainer.innerHTML = ''; // Clear existing dots
        visibleSlides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === currentIndex) dot.classList.add('active'); // Initial active dot
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
        // Update dot styling after generation
        updateDotsActiveState();
    }

    function updateDotsActiveState() {
        const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateCarouselTransform() {
        if (visibleSlides.length > 0 && currentIndex >= 0 && currentIndex < visibleSlides.length) {
            // Find the actual DOM index of the current visible slide
            const actualDomIndexOfCurrentVisibleSlide = allSlides.indexOf(visibleSlides[currentIndex]);
            slidesContainer.style.transform = `translateX(-${actualDomIndexOfCurrentVisibleSlide * 100}%)`;
        } else if (visibleSlides.length === 0) {
            slidesContainer.style.transform = 'translateX(0%)'; // Or show a "no results" state
        }
        updateDotsActiveState();
    }

    function goToSlide(index) {
        if (visibleSlides.length === 0) {
            currentIndex = 0; // Or -1 to indicate no slide
            updateCarouselTransform();
            return;
        }
        currentIndex = (index + visibleSlides.length) % visibleSlides.length;
        updateCarouselTransform();
    }

    function nextSlide() {
        if (visibleSlides.length > 0) {
            goToSlide(currentIndex + 1);
        }
    }

    function prevSlide() {
        if (visibleSlides.length > 0) {
            goToSlide(currentIndex - 1);
        }
    }

    function applyFilter(filterValue) {
        allSlides.forEach(slide => {
            const industry = slide.getAttribute('data-industry');
            if (filterValue === 'All' || industry === filterValue) {
                slide.classList.remove('hidden-by-filter');
            } else {
                slide.classList.add('hidden-by-filter');
            }
        });
        updateVisibleSlides();
        currentIndex = 0; // Reset to the first slide of the new filtered set
        generateDots();   // Regenerate dots for the new set of visible slides
        goToSlide(0);     // Go to the first visible slide
        resetAutoPlay();

        // Handle "no results" message - basic version
        const noResultsMessage = caseStudiesSection.querySelector('.no-results-message');
        if (visibleSlides.length === 0) {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'block';
            } else {
                const msg = document.createElement('p');
                msg.textContent = 'No hay casos de éxito que coincidan con este filtro.';
                msg.className = 'no-results-message';
                msg.style.textAlign = 'center';
                msg.style.padding = '20px';
                slidesContainer.parentNode.insertBefore(msg, dotsContainer); // Insert before dots
            }
            dotsContainer.style.display = 'none'; // Hide dots if no results
        } else {
            if (noResultsMessage) noResultsMessage.style.display = 'none';
            dotsContainer.style.display = ''; // Show dots
        }
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const filterValue = this.getAttribute('data-filter');
            applyFilter(filterValue);
        });
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    function startAutoPlay() {
        if (visibleSlides.length > 1) { // Only autoplay if there's more than one slide to cycle
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        if (visibleSlides.length > 1) {
            startAutoPlay();
        }
    }

    const carouselContainer = caseStudiesSection.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', resetAutoPlay); // Use reset to ensure it starts if applicable
    }

    // Initial setup
    applyFilter('All'); // Apply 'All' filter to initialize visibleSlides and dots
});

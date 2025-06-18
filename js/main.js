document.addEventListener('DOMContentLoaded', function () {
    const caseStudiesSection = document.querySelector('#case-studies');
    if (!caseStudiesSection) return; // Only run if the section exists

    const slidesContainer = caseStudiesSection.querySelector('.carousel-slides');
    const slides = Array.from(caseStudiesSection.querySelectorAll('.carousel-slide'));
    const nextButton = caseStudiesSection.querySelector('.carousel-control.next');
    const prevButton = caseStudiesSection.querySelector('.carousel-control.prev');
    const dotsContainer = caseStudiesSection.querySelector('.carousel-dots');

    if (!slidesContainer || !slides.length || !nextButton || !prevButton || !dotsContainer) {
        console.warn('Carousel elements not found. Ensure HTML structure is correct.');
        return;
    }

    let currentIndex = 0;
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds per slide for auto-play

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    function updateCarousel() {
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length; // Loop
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Event Listeners for controls
    nextButton.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    // Autoplay functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // Pause autoplay on hover
    const carouselContainer = caseStudiesSection.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // Initialize
    updateCarousel(); // Set initial position
    startAutoPlay(); // Start autoplay

    // --- Start of New Filter Logic (within DOMContentLoaded) ---
    const filterChips = caseStudiesSection.querySelectorAll('.filter-chip');

    if (slides && slides.length > 0 && filterChips && filterChips.length > 0) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', function() {
                // Update active state for chips
                filterChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');
                let visibleSlidesCount = 0;

                slides.forEach(slide => {
                    const industry = slide.getAttribute('data-industry');
                    if (filterValue === 'All' || industry === filterValue) {
                        slide.style.display = ''; // Or 'flex', 'block' depending on original display
                        visibleSlidesCount++;
                    } else {
                        slide.style.display = 'none';
                    }
                });

                // Reset carousel to the first visible slide
                // This is a simplified reset. More complex logic might be needed for
                // maintaining current index if it's still valid, or truly rebuilding the carousel.
                currentIndex = 0; // Reset to the first slide conceptually

                // Find the actual first *visible* slide's index in the original 'slides' array
                let firstVisibleIndex = -1;
                for(let i=0; i < slides.length; i++) {
                    if(slides[i].style.display !== 'none') {
                        firstVisibleIndex = i;
                        break;
                    }
                }

                if (firstVisibleIndex !== -1) {
                    // Temporarily adjust slidesContainer width if only some slides are visible
                    // This is tricky with translateX(-currentIndex * 100%) if slides are display:none
                    // A robust solution might involve rebuilding a temporary array of visible slides for the carousel logic
                    // For now, we'll just try to go to the first visible one.
                    // The current carousel logic might behave unexpectedly if slides are simply display:none'd
                    // as it relies on a continuous flex container.
                    // A better approach for hiding might be adding a class and adjusting CSS.

                    slides.forEach(slide => {
                        const industry = slide.getAttribute('data-industry');
                        if (filterValue === 'All' || industry === filterValue) {
                            slide.classList.remove('hidden-by-filter');
                        } else {
                            slide.classList.add('hidden-by-filter');
                        }
                    });

                    // Recalculate current index based on visible slides
                    // This part needs to be robust. The current `goToSlide` operates on the original `slides` array.
                    // If we hide slides, `currentIndex` might point to a hidden slide.
                    // This is a placeholder for more advanced logic:
                    // For now, we'll just call updateCarousel which will show the slide at currentIndex,
                    // assuming it's not hidden. This will be improved if needed.

                    // Attempt to reset to the first slide of the *filtered set*.
                    // This is complex because the carousel logic (translateX) assumes all slides are present in sequence.
                    // The simplest adaptation is to ensure the carousel shows the first *overall* slide
                    // if it matches the filter, or the first that *does* match.

                    // Find the first slide that is NOT hidden by filter
                    let newCurrentIndex = 0;
                    for (let i = 0; i < slides.length; i++) {
                        if (!slides[i].classList.contains('hidden-by-filter')) {
                            newCurrentIndex = i;
                            break;
                        }
                    }
                    // If all are hidden (e.g. bad filter), it will just stay at 0.
                    // This is a simplification. A "no results" message would be better.

                    goToSlide(newCurrentIndex); // Go to the new index
                } else {
                    // Handle case where no slides match the filter (e.g., show a message)
                    slidesContainer.style.transform = 'translateX(0%)'; // Reset transform
                    // Potentially hide all dots or show a "no results" message
                    console.log("No slides match this filter.");
                }

                resetAutoPlay(); // Restart autoplay with the new set of slides (conceptually)
            });
        });
    } else {
        if (!(slides && slides.length > 0)) {
            console.warn('Carousel slides not found for filter logic.');
        }
        if (!(filterChips && filterChips.length > 0)) {
            console.warn('Filter chips not found for filter logic.');
        }
    }
    // --- End of New Filter Logic ---
});

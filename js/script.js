document.addEventListener('DOMContentLoaded', () => {
    // Initialize cat interactions if the cat container exists
    if (document.querySelector('.cat-container')) {
        window.initCatInteractions();
    }

    // Book-related code
    const bookContainer = document.querySelector('.book-container');
    if (bookContainer) {
        const bookSpreads = document.querySelectorAll('.book-spread');
        const bookCover = document.querySelector('.book-cover');
        const prevButton = document.querySelector('.book-nav.prev');
        const nextButton = document.querySelector('.book-nav.next');
        
        let currentSpreadIndex = 0;
        let isAnimating = false;

        function updateNavigationButtons() {
            prevButton.disabled = currentSpreadIndex === 0;
            nextButton.disabled = currentSpreadIndex === bookSpreads.length;
        }

        function turnToPage(index, immediate = false) {
            if (isAnimating || index < 0 || index > bookSpreads.length) return;
            isAnimating = true;

            const duration = immediate ? 0 : 600;
            currentSpreadIndex = index;

            // Handle cover and spreads with corrected animations
            if (index === 0) {
                // Close the book
                bookCover.style.transform = 'rotateY(0)';
                bookSpreads.forEach((spread, i) => {
                    spread.style.transition = `all ${duration}ms cubic-bezier(0.645, 0.045, 0.355, 1) ${i * 100}ms`;
                    spread.classList.remove('active', 'prev', 'next');
                    spread.style.opacity = '0';
                    spread.style.transform = 'rotateY(90deg)';
                });
            } else {
                // Open the book
                bookCover.style.transform = 'rotateY(-180deg)';
                
                bookSpreads.forEach((spread) => {
                    const spreadIndex = parseInt(spread.dataset.page);
                    const delay = Math.abs(spreadIndex - index) * 100;
                    spread.style.transition = `all ${duration}ms cubic-bezier(0.645, 0.045, 0.355, 1) ${delay}ms`;
                    
                    const leftPage = spread.querySelector('.left-page');
                    const rightPage = spread.querySelector('.right-page');
                    
                    if (spreadIndex === index) {
                        // Current spread
                        spread.classList.add('active');
                        spread.classList.remove('prev', 'next');
                        spread.style.opacity = '1';
                        spread.style.transform = 'rotateY(0)';
                        
                        leftPage.classList.remove('turned');
                        rightPage.classList.remove('turned');
                    } else if (spreadIndex < index) {
                        // Previous spreads
                        spread.classList.add('prev');
                        spread.classList.remove('active', 'next');
                        spread.style.opacity = '1';
                        spread.style.transform = 'rotateY(-180deg)';
                        
                        leftPage.classList.add('turned');
                        rightPage.classList.add('turned');
                    } else {
                        // Next spreads
                        spread.classList.add('next');
                        spread.classList.remove('active', 'prev');
                        spread.style.opacity = '0';
                        spread.style.transform = 'rotateY(90deg)';
                        
                        leftPage.classList.remove('turned');
                        rightPage.classList.remove('turned');
                    }
                });
            }

            updateNavigationButtons();

            setTimeout(() => {
                isAnimating = false;
            }, duration + (bookSpreads.length * 100));
        }

        prevButton.addEventListener('click', () => {
            if (!isAnimating) {
                turnToPage(currentSpreadIndex - 1);
            }
        });

        // Update next button handler for smoother animation
        nextButton.addEventListener('click', () => {
            if (!isAnimating) {
                if (currentSpreadIndex === 0) {
                    bookCover.style.transform = 'rotateY(-180deg)';
                    setTimeout(() => {
                        turnToPage(1);
                    }, 600);
                } else {
                    turnToPage(currentSpreadIndex + 1);
                }
            }
        });

        // Modified scroll behavior for smoother transitions
        let lastScrollPosition = window.scrollY;
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            scrollTimeout = setTimeout(() => {
                const currentScroll = window.scrollY;
                const windowHeight = window.innerHeight;
                const scrollDirection = currentScroll > lastScrollPosition ? 1 : -1;

                // Calculate which spread should be visible based on scroll position
                const scrollPercentage = (currentScroll + windowHeight * 0.3) / document.documentElement.scrollHeight;
                const targetIndex = Math.floor(scrollPercentage * (bookSpreads.length + 1));

                if (targetIndex !== currentSpreadIndex) {
                    turnToPage(Math.min(targetIndex, bookSpreads.length));
                }

                lastScrollPosition = currentScroll;
            }, 50);
        });

        // Initialize
        updateNavigationButtons();
        turnToPage(0, true);

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!isAnimating) {
                if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    turnToPage(currentSpreadIndex - 1);
                } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                    if (currentSpreadIndex === 0) {
                        bookCover.style.transform = 'rotateY(180deg)';
                        setTimeout(() => {
                            turnToPage(1);
                        }, 600);
                    } else {
                        turnToPage(currentSpreadIndex + 1);
                    }
                }
            }
        });
    }
});
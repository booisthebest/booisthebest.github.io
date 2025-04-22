class NatureElements {
    constructor() {
        this.initialized = false;
        this.flowerTypes = ['cherry-blossom', 'daisy', 'wildflower', 'poppy'];
        this.flowerColors = {
            'cherry-blossom': '#ffb7c5',
            'daisy': '#ffffff',
            'wildflower': '#9370DB', // Updated to a richer violet
            'poppy': '#ff4d4d'
        };
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        this.container = document.querySelector('.nature-elements');
        if (!this.container) return;

        this.createFlowers();
        this.setupFallingPetals();
        this.setupScrollObserver();
        
        this.initialized = true;
    }

    createFlowers() {
        const templates = document.getElementById('flower-templates');
        if (!templates) return;

        // Increased to 60 flowers
        for (let i = 1; i <= 60; i++) {
            const flowerType = this.flowerTypes[i % this.flowerTypes.length];
            const flower = templates.content.querySelector(`.${flowerType}`).cloneNode(true);
            const wrapper = document.createElement('div');
            wrapper.className = `flower flower-${i} ${flowerType}`;
            
            // Distribute flowers in a more natural pattern
            const xPos = Math.random() * 90 + 5; // 5-95% of viewport width
            const yPos = Math.random() * 85 + 5; // 5-90% of viewport height
            wrapper.style.left = `${xPos}vw`;
            wrapper.style.top = `${yPos}vh`;
            
            // Add slight random rotation
            const rotation = Math.random() * 360;
            wrapper.style.transform = `rotate(${rotation}deg)`;
            
            wrapper.appendChild(flower);
            this.container.appendChild(wrapper);
        }
    }

    setupFallingPetals() {
        const petalTemplate = document.getElementById('petal-template');
        if (!petalTemplate) return;

        this.petalsPool = [];
        
        // Increased to 40 petals
        for (let i = 0; i < 40; i++) {
            const petal = petalTemplate.content.cloneNode(true).querySelector('.falling-petal');
            petal.classList.add(`falling-petal-${i % 5 + 1}`);
            
            // Use flower colors for petals
            const flowerType = this.flowerTypes[i % this.flowerTypes.length];
            petal.style.setProperty('--petal-color', this.flowerColors[flowerType]);
            
            this.container.appendChild(petal);
            this.petalsPool.push(petal);
        }

        this.animatePetals();
        setInterval(() => this.animatePetals(), 5000);
    }

    animatePetals() {
        this.petalsPool.forEach((petal, index) => {
            setTimeout(() => {
                this.resetPetal(petal);
            }, index * 150);
        });
    }

    resetPetal(petal) {
        const xPos = Math.random() * 100;
        petal.style.left = `${xPos}vw`;
        petal.style.top = '-10px';
        
        const scale = 0.5 + Math.random() * 0.5;
        const rotation = Math.random() * 360;
        petal.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const flowers = this.container.querySelectorAll('.flower');
                    flowers.forEach((flower, index) => {
                        setTimeout(() => {
                            flower.classList.add('visible');
                        }, index * 50); // Faster appearance for more flowers
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: [0.1, 0.2, 0.3],
            rootMargin: '20px'
        });

        const main = document.querySelector('main');
        if (main) {
            observer.observe(main);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.natureElements = new NatureElements();
});
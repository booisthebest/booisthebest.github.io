// Cat animation and interaction module
const initCatInteractions = () => {
    const eyes = document.querySelectorAll('.eye-movement');
    const upperBody = document.querySelector('.upper-body');
    const tail = document.querySelector('.tail');
    const frontLegs = document.querySelectorAll('.front-leg');
    const backLegs = document.querySelectorAll('.back-leg');
    
    const maxEyeMove = 6;
    const maxBodyRotation = 12;
    const maxTailRotation = 60;
    const maxLegAdjust = 5;
    
    // State management for smooth animation
    let currentRotationX = 0;
    let currentRotationZ = 0;
    let targetRotationX = 0;
    let targetRotationZ = 0;
    let currentTailX = 0;
    let currentTailZ = 0;
    let targetTailX = 0;
    let targetTailZ = 0;
    let eyePositions = Array.from(eyes).map(() => ({ x: 0, y: 0 }));
    let targetEyePositions = Array.from(eyes).map(() => ({ x: 0, y: 0 }));
    let animationFrameId = null;

    // Define possible responses with weights
    const responses = [
        { text: "Mew!", weight: 34 },
        { text: "Mew...", weight: 20 },
        { text: "Miaou!", weight: 8 },
        { text: "Kss", weight: 5 },
        { text: "Leave me alone!", weight: 1 },
        { text: "Again!", weight: 9 },
        { text: "❤️", weight: 7 },
        { text: "Purr", weight: 17 }
    ];

    function bounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    function lerp(start, end, factor) {
        return start + (end - start) * bounce(Math.min(factor, 1));
    }

    function weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) return item.text;
        }
        return items[0].text;
    }

    function createMiaouText() {
        const catContainer = document.querySelector('.cat-container');
        const catRect = catContainer.getBoundingClientRect();
        const miaou = document.createElement('div');
        miaou.className = 'miaou-text';
        miaou.textContent = weightedRandom(responses);

        // Random position relative to the cat container's dimensions
        const randomX = (Math.random() * 0.8 - 0.4) * catRect.width; // -40% to +40% of width
        const randomY = (Math.random() * 0.4 - 0.2) * catRect.height; // -20% to +20% of height
        const randomRot = Math.random() * 60 - 30; // -30 to +30 degrees
        const randomScale = 0.8 + Math.random() * 0.8; // 0.8 to 1.6
        const randomSize = 20 + Math.random() * 16; // 20px to 36px

        // Update positioning to be relative to the cat container
        miaou.style.position = 'absolute';
        miaou.style.left = '50%';
        miaou.style.top = '50%';
        
        // Apply random styles
        miaou.style.setProperty('--tx', `calc(-50% + ${randomX}px)`);
        miaou.style.setProperty('--ty', `${randomY}px`);
        miaou.style.setProperty('--rot', `${randomRot}deg`);
        miaou.style.setProperty('--scale', randomScale);
        miaou.style.setProperty('--size', `${randomSize}px`);

        catContainer.appendChild(miaou);
        
        requestAnimationFrame(() => {
            miaou.classList.add('animate');
        });
        
        miaou.addEventListener('animationend', () => {
            miaou.remove();
        });
    }

    function updatePositions(mouseX, mouseY) {
        const bodyRect = upperBody.getBoundingClientRect();
        const bodyCenterX = bodyRect.left + bodyRect.width / 2;
        const bodyCenterY = bodyRect.top + bodyRect.height / 2;

        const deltaX = (mouseX - bodyCenterX) / (window.innerWidth / 2) * 1.2;
        const deltaY = (mouseY - bodyCenterY) / (window.innerHeight / 2) * 1.2;
        
        targetRotationX = -deltaY * maxBodyRotation;
        targetRotationZ = deltaX * maxBodyRotation;
        targetTailX = -deltaY * maxTailRotation * 0.5;
        targetTailZ = -deltaX * maxTailRotation;

        frontLegs.forEach((leg, index) => {
            const isLeft = index === 0;
            const legAdjust = isLeft ? -maxLegAdjust : maxLegAdjust;
            leg.style.transform = `rotate${deltaX > 0 ? 'Y' : 'X'}(${deltaX * legAdjust}deg)`;
        });

        backLegs.forEach((leg, index) => {
            const isLeft = index === 0;
            const legAdjust = isLeft ? -maxLegAdjust : maxLegAdjust;
            leg.style.transform = `rotate${deltaX > 0 ? 'Y' : 'X'}(${deltaX * legAdjust * 0.5}deg)`;
        });

        eyes.forEach((eye, index) => {
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distance = Math.min(
                Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 100,
                1
            );

            targetEyePositions[index] = {
                x: Math.cos(angle) * maxEyeMove * distance * 1.2,
                y: Math.sin(angle) * maxEyeMove * distance * 1.2
            };
        });
    }

    function animate() {
        currentRotationX = lerp(currentRotationX, targetRotationX, 0.15);
        currentRotationZ = lerp(currentRotationZ, targetRotationZ, 0.15);
        
        upperBody.style.transform = 
            `rotateX(${currentRotationX}deg) 
             rotateZ(${currentRotationZ}deg)`;

        currentTailX = lerp(currentTailX, targetTailX, 0.1);
        currentTailZ = lerp(currentTailZ, targetTailZ, 0.1);
        
        const swayAmount = Math.sin(Date.now() / 800) * 15;
        
        tail.style.transform = 
            `rotateX(${currentTailX}deg) 
             rotateZ(${currentTailZ + swayAmount}deg)`;

        eyes.forEach((eye, index) => {
            eyePositions[index].x = lerp(eyePositions[index].x, targetEyePositions[index].x, 0.2);
            eyePositions[index].y = lerp(eyePositions[index].y, targetEyePositions[index].y, 0.2);
            
            eye.style.transform = `translate(${eyePositions[index].x}px, ${eyePositions[index].y}px)`;
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animate();
    }

    // Initialize click handler
    const catContainer = document.querySelector('.cat-container');
    if (catContainer) {
        catContainer.addEventListener('click', createMiaouText);
    }

    // Initialize mouse movement handler
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updatePositions(e.clientX, e.clientY);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Start the animation
    startAnimation();
};

// Export the initialization function
window.initCatInteractions = initCatInteractions;
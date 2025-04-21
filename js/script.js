document.addEventListener('DOMContentLoaded', () => {
    const eyes = document.querySelectorAll('.eye-movement');
    const upperBody = document.querySelector('.upper-body');
    const tail = document.querySelector('.tail');
    const frontLegs = document.querySelectorAll('.front-leg');
    const backLegs = document.querySelectorAll('.back-leg');
    
    const maxEyeMove = 6; // Increased eye movement range
    const maxBodyRotation = 12; // More dramatic body rotation
    const maxTailRotation = 60; // More extreme tail movement
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

    function updatePositions(mouseX, mouseY) {
        const bodyRect = upperBody.getBoundingClientRect();
        const bodyCenterX = bodyRect.left + bodyRect.width / 2;
        const bodyCenterY = bodyRect.top + bodyRect.height / 2;

        // Calculate normalized mouse position (-1 to 1) with overshoot
        const deltaX = (mouseX - bodyCenterX) / (window.innerWidth / 2) * 1.2;
        const deltaY = (mouseY - bodyCenterY) / (window.innerHeight / 2) * 1.2;
        
        // Update head rotation targets with more dramatic movement
        targetRotationX = -deltaY * maxBodyRotation;
        targetRotationZ = deltaX * maxBodyRotation;

        // Update tail rotation targets with exaggerated movement
        targetTailX = -deltaY * maxTailRotation * 0.5;
        targetTailZ = -deltaX * maxTailRotation;

        // Update leg positions based on body movement
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

        // Calculate target eye positions with overshooting
        eyes.forEach((eye, index) => {
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distance = Math.min(
                Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 150, // Reduced distance for more movement
                1
            );

            targetEyePositions[index] = {
                x: Math.cos(angle) * maxEyeMove * distance * 1.2, // 20% overshoot
                y: Math.sin(angle) * maxEyeMove * distance * 1.2
            };
        });
    }

    function animate() {
        // Smooth body movement with bouncy effect
        currentRotationX = lerp(currentRotationX, targetRotationX, 0.15);
        currentRotationZ = lerp(currentRotationZ, targetRotationZ, 0.15);
        
        upperBody.style.transform = 
            `rotateX(${currentRotationX}deg) 
             rotateZ(${currentRotationZ}deg)`;

        // Smooth tail movement with bouncy effect
        currentTailX = lerp(currentTailX, targetTailX, 0.1);
        currentTailZ = lerp(currentTailZ, targetTailZ, 0.1);
        
        const swayAmount = Math.sin(Date.now() / 800) * 15; // More dramatic swaying
        
        tail.style.transform = 
            `rotateX(${currentTailX}deg) 
             rotateZ(${currentTailZ + swayAmount}deg)`;

        // Smooth eye movement with bounce
        eyes.forEach((eye, index) => {
            eyePositions[index].x = lerp(eyePositions[index].x, targetEyePositions[index].x, 0.2);
            eyePositions[index].y = lerp(eyePositions[index].y, targetEyePositions[index].y, 0.2);
            
            eye.style.transform = `translate(${eyePositions[index].x}px, ${eyePositions[index].y}px)`;
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // Clean up previous animation frame if it exists
    function startAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animate();
    }

    // Initialize animation
    startAnimation();

    // Throttled mouse move handler
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
});
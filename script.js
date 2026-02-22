document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. HERO COVER LOGIC (Dragging & Scatter)
    // =========================================
    const bgItems = document.querySelectorAll('.bg-layer img');

    bgItems.forEach(img => {
        let isDragging = false;
        let startX, startY;
        let currentX = 0;
        let currentY = 0;

        img.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); 
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            
            img.style.transition = 'none'; 
            img.style.zIndex = 8; 
            img.setPointerCapture(e.pointerId);
        });

        img.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            img.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        img.addEventListener('pointerup', (e) => {
            isDragging = false;
            img.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            img.style.zIndex = 1;
            img.releasePointerCapture(e.pointerId);
        });
    });

    // Global scatter only triggers on the cover background (prevents misclicks on gallery)
    document.querySelector('.cover').addEventListener('click', (e) => {
        if (e.target.classList.contains('cover') || e.target.classList.contains('bg-layer')) {
            bgItems.forEach((img) => {
                const randomX = Math.floor(Math.random() * 400) - 200;
                const randomY = Math.floor(Math.random() * 400) - 200;
                img.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 40 - 20}deg)`;
            });
        }
    });

    // =========================================
    // 2. VERTICAL GALLERY LOGIC (Red String)
    // =========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const svg = document.querySelector('.red-string-path');
    let pathData = "M";

    const positions = [
        { top: 200,  left: 15 }, 
        { top: 700,  left: 60 }, 
        { top: 1200, left: 10 }, 
        { top: 1700, left: 55 }, 
        { top: 2200, left: 20 }, 
        { top: 2700, left: 65 }
    ];

    galleryItems.forEach((item, i) => {
        const pos = positions[i];
        
        // Populate content dynamically
        item.innerHTML = `
            <img src="${item.dataset.src}" alt="${item.dataset.title}">
            <div class="item-info">
                <span>${item.dataset.date}</span>
                <h3>${item.dataset.title}</h3>
            </div>
        `;

        item.style.top = pos.top + "px";
        item.style.left = pos.left + "%";
        item.style.animation = `fadeIn 1s forwards ${i * 0.4}s`;

        // String Math mapping
        const centerX = (window.innerWidth * (pos.left / 100)) + 190;
        const centerY = pos.top + 200; 

        if (i === 0) {
            pathData += `${centerX},${centerY}`;
        } else {
            const prevPos = positions[i-1];
            const prevX = (window.innerWidth * (prevPos.left / 100)) + 190;
            const prevY = prevPos.top + 200;

            const midX = (prevX + centerX) / 2;
            const midY = (prevY + centerY) / 2;
            
            pathData += ` Q ${midX + 50},${midY} ${centerX},${centerY}`;
        }
    });

    // Append path to SVG
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'string');
    svg.appendChild(path);

    // Limit SVG height to just the vertical section
    const verticalSection = document.querySelector('.gallery-section');
    svg.style.height = verticalSection.scrollHeight + "px";


    // =========================================
    // 3. HORIZONTAL SCROLL BLUEPRINT LOGIC
    // =========================================
    const horizontalContainer = document.querySelector('.horizontal-scroll-container');
    const horizontalTrack = document.querySelector('.horizontal-track');
    window.addEventListener('load', () => {
       
        window.addEventListener('scroll', () => {
            if (!horizontalContainer || !horizontalTrack) return;

            const rect = horizontalContainer.getBoundingClientRect();
            
            if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
                
                const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
                const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
                
                horizontalTrack.style.transform = `translateX(-${scrollProgress * maxTranslate}px)`;
                
            } else if (rect.top > 0) {
                horizontalTrack.style.transform = `translateX(0px)`;
            } else if (rect.bottom < window.innerHeight) {
                const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
                horizontalTrack.style.transform = `translateX(-${maxTranslate}px)`;
            }
        });
    });
});

// Album images
window.addEventListener('load', () => {
    const track = document.getElementById('dynamic-track');
    const imageCount = parseInt(track.dataset.count);

    // Optional: Define titles for each image. 
    // If an index isn't found, it will default to "Diary Entry"
    const titles = [
        "#1","#2","#3","#4","#5","#6","#7","#8","#9","#10","#11","#12","#13","#14","#15"
    ];

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    for (let i = 1; i <= imageCount; i++) {
        const item = document.createElement('div');
        item.className = 'horizontal-item';

        // Generate some realistic metadata based on the loop
        const title = titles[i-1] || `Diary Entry #${i}`;
        const month = months[(i + 3) % 12]; // Just cycles through months for aesthetic

        item.innerHTML = `
            <div class="photo-frame">
                <img src="album/${i}.jpeg" alt="${title}" loading="lazy">
                <div class="item-info">
                    
                    <h3>${title}</h3>
                </div>
            </div>
        `;
        
        track.appendChild(item);
    }

    // IMPORTANT: After injecting images, we need to refresh the scroll logic 
    // because the track width has changed.
    initHorizontalScroll(); 
});

function initHorizontalScroll() {
    const horizontalContainer = document.querySelector('.horizontal-scroll-container');
    const horizontalTrack = document.querySelector('.horizontal-track');

    window.addEventListener('scroll', () => {
        const rect = horizontalContainer.getBoundingClientRect();
        
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
            const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
            horizontalTrack.style.transform = `translateX(-${scrollProgress * maxTranslate}px)`;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.gallery-item');
    const svg = document.querySelector('.red-string-path');
    const path = document.querySelector('#scroll-path');
    
    let pathData = "M";
    const positions = [
        { top: 200,  left: 15 }, 
        { top: 700,  left: 60 }, 
        { top: 1200, left: 10 }, 
        { top: 1700, left: 55 }, 
        { top: 2200, left: 20 }, 
        { top: 2700, left: 65 }
    ];

    // 1. GENERATE THE LOOSE PATH WITH KNOTS
    positions.forEach((pos, i) => {
        const centerX = (window.innerWidth * (pos.left / 100)) + 190;
        const centerY = pos.top + 200;

        if (i === 0) {
            pathData += `${centerX},${centerY}`;
        } else {
            const prevPos = positions[i-1];
            const prevX = (window.innerWidth * (prevPos.left / 100)) + 190;
            const prevY = prevPos.top + 200;

            // "LOOSE" LOGIC: We move the Control Point (Q) further down
            // to create a "sagging" effect rather than a sharp diagonal.
            const midX = (prevX + centerX) / 2;
            const midY = (prevY + centerY) / 2 + 100; // Increased sag

            pathData += ` Q ${midX},${midY} ${centerX},${centerY}`;
        }

        // ADD A KNOT (Circle) at each photo point
        const knot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        knot.setAttribute('cx', centerX);
        knot.setAttribute('cy', centerY);
        knot.setAttribute('r', '4'); // Small knot size
        knot.setAttribute('class', 'knot');
        svg.appendChild(knot);
    });

    // Apply the path data
    path.setAttribute('d', pathData);

    // 2. SCROLL ANIMATION LOGIC
    const pathLength = path.getTotalLength();
    
    // Initial state: Path is hidden
    path.style.strokeDasharray = pathLength + ' ' + pathLength;
    path.style.strokeDashoffset = pathLength;

    window.addEventListener('scroll', () => {
        const scrollSection = document.querySelector('.gallery-section');
        const sectionRect = scrollSection.getBoundingClientRect();
        
        // We get the absolute distance from the top of the document
        const sectionTop = window.pageYOffset + sectionRect.top;
        const sectionHeight = scrollSection.scrollHeight;
        
        // The calculation now accounts for the scroll passing the About section
        // 0 starts when the top of the Gallery Section enters the viewport
        let scrollPercentage = (window.scrollY - sectionTop + (window.innerHeight / 1.5)) / sectionHeight;
        
        scrollPercentage = Math.max(0, Math.min(1, scrollPercentage));

        const drawLength = pathLength * scrollPercentage;
        path.style.strokeDashoffset = pathLength - drawLength;
    });
});
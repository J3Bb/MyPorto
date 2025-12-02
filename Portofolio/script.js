/* ============================================================
   SMOOTH SCROLL
============================================================ */
window.addEventListener("load", () => {
    window.dispatchEvent(new Event("scroll"));
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        const id = link.getAttribute("href").substring(1);
        const target = document.getElementById(id);
        if (!target) return;

        const yOffset = 72;
        const y = target.getBoundingClientRect().top + window.pageYOffset - yOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
    });
});

/* ============================================================
   NAVBAR ACTIVE ON SCROLL
============================================================ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

function onScrollNavHighlight() {
    const scrollPos = window.scrollY + 90;

    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.id;

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(a => a.classList.remove("active"));
            const active = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (active) active.classList.add("active");
        }
    });
}

window.addEventListener("scroll", onScrollNavHighlight);
onScrollNavHighlight();

/* ============================================================
   FADE-IN ON SCROLL
============================================================ */
const revealElems = document.querySelectorAll(".fade-in, .project-card, .skill-card, .timeline-item");

function revealOnScroll() {
    const triggerHeight = window.innerHeight * 0.85;

    revealElems.forEach(el => {
        if (el.getBoundingClientRect().top < triggerHeight) {
            el.classList.add("show");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* ============================================================
   PREMIUM SLIDER MODAL
============================================================ */
let slideIndex = 0;
let slideImages = [];

function openModal(images, title, desc) {
    slideImages = images;
    slideIndex = 0;

    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalDesc").innerText = desc;

    renderSlides();
    renderDots();
    updateSlider();

    document.getElementById("projectModal").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("projectModal").classList.remove("open");
    document.body.style.overflow = "";
}
window.closeModal = closeModal;

/* ---------- Render Slides ---------- */
function renderSlides() {
    const container = document.getElementById("slidesContainer");
    container.innerHTML = "";

    slideImages.forEach(src => {
        const slide = document.createElement("div");
        slide.className = "slide";
        slide.innerHTML = `
            <div class="zoom-container">
                <img class="zoom-img" src="${src}">
            </div>
        `;
        container.appendChild(slide);
    });
}

/* ---------- Render Dots ---------- */
function renderDots() {
    const dots = document.getElementById("sliderDots");
    dots.innerHTML = "";

    slideImages.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.onclick = () => {
            slideIndex = i;
            updateSlider();
        };
        dots.appendChild(dot);
    });
}

/* ---------- Update Slider ---------- */
function updateSlider() {
    document.querySelectorAll(".slide").forEach((slide, i) =>
        slide.classList.toggle("active", i === slideIndex)
    );

    document.querySelectorAll("#sliderDots div").forEach((dot, i) =>
        dot.classList.toggle("active", i === slideIndex)
    );

    setTimeout(enableZoom, 20);
}

/* ---------- Prev & Next ---------- */
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnPrev").onclick = () => {
        slideIndex = (slideIndex - 1 + slideImages.length) % slideImages.length;
        updateSlider();
    };

    document.getElementById("btnNext").onclick = () => {
        slideIndex = (slideIndex + 1) % slideImages.length;
        updateSlider();
    };
});

/* ---------- Swipe Support ---------- */
let touchStartX = 0;

document.addEventListener("touchstart", e => {
    if (!e.target.closest(".modal-slider")) return;
    touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
    if (!e.target.closest(".modal-slider")) return;

    const endX = e.changedTouches[0].clientX;

    if (endX < touchStartX - 40) document.getElementById("btnNext").click();
    if (endX > touchStartX + 40) document.getElementById("btnPrev").click();
});

/* ============================================================
   PREMIUM ZOOM ENGINE
============================================================ */
let scale = 1;
let isDragging = false;
let dragStartX, dragStartY;
let translateX = 0;
let translateY = 0;

function enableZoom() {
    document.querySelectorAll(".zoom-img").forEach(img => {
        const container = img.parentElement;

        // Reset
        scale = 1;
        translateX = 0;
        translateY = 0;
        img.style.transform = "translate(0px, 0px) scale(1)";

        /* ---- Double Click Zoom ---- */
        img.ondblclick = () => {
            if (scale === 1) {
                scale = 2.2;
            } else {
                scale = 1;
                translateX = 0;
                translateY = 0;
            }
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        /* ---- Wheel Zoom ---- */
        container.onwheel = e => {
            e.preventDefault();
            scale += e.deltaY * -0.002;
            scale = Math.min(4, Math.max(1, scale));
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        /* ---- Drag to Move ---- */
        container.onmousedown = e => {
            if (scale === 1) return;
            isDragging = true;
            dragStartX = e.clientX - translateX;
            dragStartY = e.clientY - translateY;
        };

        window.onmouseup = () => (isDragging = false);

        window.onmousemove = e => {
            if (!isDragging) return;
            translateX = e.clientX - dragStartX;
            translateY = e.clientY - dragStartY;
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        /* ---- Pinch Zoom (Mobile) ---- */
        let initialDistance = 0;

        container.ontouchstart = e => {
            if (e.touches.length === 2) {
                initialDistance = getTouchDistance(e.touches);
            }
        };

        container.ontouchmove = e => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const newDistance = getTouchDistance(e.touches);
                const zoomFactor = newDistance / initialDistance;
                scale = Math.min(4, Math.max(1, scale * zoomFactor));
                initialDistance = newDistance;

                img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        };
    });
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ============================================================
   CONTACT CARD GLOW
============================================================ */
document.querySelectorAll(".contact-card").forEach(card => {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
});

// ===== Marquee Auto-smooth (clone dan atur durasi otomatis) =====
(function setupTechMarquee() {
  const sliders = document.querySelectorAll('.tech-slider');

  sliders.forEach(slider => {
    const track = slider.querySelector('.tech-track');
    if (!track) return;

    // Jika belum diduplikasi, clone children sekali untuk seamless loop
    if (!track.dataset.cloned) {
      const childrenHTML = track.innerHTML;
      track.innerHTML += childrenHTML; // duplicate content
      track.dataset.cloned = "true";
    }

    // Hitung durasi animasi berdasarkan lebar element agar speed konstan
    function adjustMarquee() {
      // lebar total track (setelah duplicate)
      const totalWidth = track.scrollWidth; // full duplicated width
      const containerWidth = slider.clientWidth;

      // Speed dasar: px per second (atur di sini jika mau lebih cepat/lambat)
      const pxPerSecond = 120; // 120px per detik -> ubah sesuai selera

      // durasi supaya movement terasa stabil: totalWidth / 2 (karena translate -50%)
      // hitungan: jarak yang perlu ditempuh adalah totalWidth / 2
      const distance = totalWidth / 2;
      let duration = distance / pxPerSecond;

      // minimal dan maksimal durasi untuk keamanan
      if (duration < 8) duration = 8;
      if (duration > 80) duration = 80;

      // set ke CSS variable untuk animasi
      track.style.setProperty('--marquee-duration', duration + 's');

      // ensure no subpixel jitter: set transform translateX(0) dulu
      track.style.transform = 'translateX(0)';
    }

    // adjust on load + resize + font load
    window.addEventListener('load', adjustMarquee);
    window.addEventListener('resize', () => {
      // debounce kecil
      clearTimeout(track._resizeTimeout);
      track._resizeTimeout = setTimeout(adjustMarquee, 120);
    });

    // call once immediately
    adjustMarquee();
  });
})();

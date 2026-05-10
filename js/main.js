// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.index
        ? parseInt(entry.target.dataset.index) * 100
        : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Nav scroll effect ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 20
    ? 'rgba(10,10,10,0.95)'
    : 'rgba(10,10,10,0.85)';
}, { passive: true });

// ── Mobile menu ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// ── Copy email ──
const copyBtn = document.getElementById('copyEmail');
const toast = document.getElementById('toast');

copyBtn.addEventListener('click', () => {
  const email = copyBtn.dataset.email;
  navigator.clipboard.writeText(email).then(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  });
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? '#f0f0f0'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── Stagger project cards ──
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

// ── Project image sliders ──
document.querySelectorAll('[data-slider]').forEach(slider => {
  const track = slider.querySelector('.slider-track');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsContainer = slider.querySelector('.slider-dots');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');

  let current = 0;
  let loadedSlides = [];

  // Check which slides have successfully loaded images
  function checkImages() {
    const checks = slides.map(slide => new Promise(resolve => {
      const img = slide.querySelector('img');
      if (!img) return resolve(false);
      if (img.complete && img.naturalWidth > 0) return resolve(true);
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    }));

    Promise.all(checks).then(results => {
      // Keep only slides whose images loaded
      loadedSlides = slides.filter((_, i) => results[i]);

      // Remove slides that failed
      slides.forEach((slide, i) => {
        if (!results[i]) slide.remove();
      });

      if (loadedSlides.length === 0) return; // show fallback

      slider.classList.add('has-images');
      buildDots();
      goTo(0);
    });
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    loadedSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsContainer.appendChild(dot);
    });
    // Hide controls if only one image
    if (loadedSlides.length <= 1) {
      slider.querySelector('.slider-controls').style.display = 'none';
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, loadedSlides.length - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === loadedSlides.length - 1;
  }

  prevBtn?.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
  nextBtn?.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });

  // Touch/swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  checkImages();
});

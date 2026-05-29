// =============================================
//  BE GROVE SOLUTIONS CO., LTD - Main JS
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Language Switcher ---
  const langBtns = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('bgs-lang') || 'th';

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('bgs-lang', lang);
    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Toggle element visibility
    document.querySelectorAll('[data-th]').forEach(el => {
      el.textContent = lang === 'th' ? el.dataset.th : el.dataset.en;
    });
    // Support HTML-rich text blocks (th-text / en-text spans)
    document.querySelectorAll('.th-text').forEach(el => {
      el.style.display = lang === 'th' ? '' : 'none';
    });
    document.querySelectorAll('.en-text').forEach(el => {
      el.style.display = lang === 'en' ? '' : 'none';
    });
    document.querySelectorAll('[data-lang]').forEach(el => {
      const elLang = el.dataset.lang;
      el.style.display = elLang === lang ? '' : 'none';
    });
    document.documentElement.lang = lang === 'th' ? 'th' : 'en';
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Init language on page load
  setLang(currentLang);

  // --- Navbar Scroll Effect ---
  const navbar = document.querySelector('.navbar');
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Mobile Hamburger Menu ---
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu?.classList.contains('open')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  // Close mobile menu on link click
  document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // --- Active Nav Link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-menu .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html') ||
        (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Scroll Reveal Animation ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .product-card, .product-full-card, .why-feature, .team-card, .service-full-card, .step, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  document.addEventListener('animationend', () => {}, false);

  // Inject reveal CSS
  const style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  // --- Product Filter Tabs ---
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.product-full-card').forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Contact Form ---
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ส่งแล้ว / Sent!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.innerHTML = origText;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });

  // --- Smooth stagger animation ---
  document.querySelectorAll('.services-grid .service-card, .products-grid .product-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });

});

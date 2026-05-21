// ===== Navigation =====
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  highlightCurrentPage();
  initScrollAnimations();
});

function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });
  }
}

function highlightCurrentPage() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('#nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '/' && href === '/') || (path !== '/' && href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });
}

// ===== Contact Form Handler =====
// Posts the quote request into the ProjectWorks CRM (app.structureworkstn.com)
// via the submitWebLead Cloud Function. Leads appear in Admin > Leads.
const LEAD_ENDPOINT = 'https://us-central1-projectworks-8b692.cloudfunctions.net/submitWebLead';

function getFormMessage(form) {
  let msg = form.querySelector('.form-message');
  if (!msg) {
    msg = document.createElement('p');
    msg.className = 'form-message';
    form.appendChild(msg);
  }
  return msg;
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  const msg = getFormMessage(form);
  msg.textContent = '';
  msg.style.color = '';

  const data = Object.fromEntries(new FormData(form).entries());
  data.financing = !!(form.querySelector('[name="financing"]') || {}).checked;
  data.page = window.location.href;

  // Client-side guard (the server validates too).
  if (!data.name || (!data.email && !data.phone)) {
    msg.textContent = 'Please enter your name and an email or phone number.';
    msg.style.color = '#dc2626';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || 'Request failed');

    // Fire ad-pixel conversion (no-ops until pixel IDs are set in analytics.js).
    if (typeof window.swTrack === 'function') {
      window.swTrack('Lead', { source: data.source || 'website_contact_form', page: data.page });
    }

    btn.textContent = 'Quote Request Sent!';
    btn.style.background = '#16a34a';
    btn.style.borderColor = '#16a34a';
    msg.textContent = "Thanks! We'll be in touch within 24 hours.";
    msg.style.color = '#16a34a';
    form.reset();
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 4000);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    msg.textContent = 'Sorry, something went wrong. Please call (865) 630-4073 or email info@structureworkstn.com.';
    msg.style.color = '#dc2626';
  }
}

// ===== Smooth Scroll for Anchor Links =====
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// ===== Scroll Animations =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.service-card, .testimonial-card, .stat-card, .social-card, .contact-item, .value-block, .team-card, .blog-card, .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  if (!document.getElementById('animate-style')) {
    const style = document.createElement('style');
    style.id = 'animate-style';
    style.textContent = '.animate-in { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

  document.querySelectorAll('.services-grid, .testimonials-grid, .stats-row, .social-grid, .team-grid, .blog-grid, .features-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}

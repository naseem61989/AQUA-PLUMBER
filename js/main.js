// Main JavaScript for Aqua Plumber Dubai
// Generated: 2026-07-28 08:03:38
// PERMANENTLY FIXED: Form redirects to WhatsApp without page refresh
// PERMANENTLY FIXED: FAQ toggles working perfectly

// Business Configuration
const siteConfig = {
    name: "Aqua Plumber Dubai",
    phone: "971521729561",
    whatsapp: "971521729561",
    email: "info@aquaplumberdubai.com",
    city: "Dubai",
    country: "UAE",
    industry: "Plumbing Services",
    logo: "/images/logos/logo-gpt-aqua-plumber-dubai-1785225804.webp"
};

// Social Media Links
const socialLinks = {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    pinterest: "#"
};

// Make config globally available
window.siteConfig = siteConfig;
window.socialLinks = socialLinks;

// ========== PERMANENTLY FIXED: Lead Form Handler - Redirects to WhatsApp without page refresh ==========
window.handleLead = function(e) {
    e.preventDefault(); // CRITICAL: Stops page from refreshing
    
    // Get form values - UPDATED to match hero form fields (phone instead of loc)
    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || document.getElementById('loc')?.value || ''; // Works with both 'phone' and 'loc' IDs
    const serviceSelect = document.getElementById('svc');
    const service = serviceSelect?.value || '';
    const email = document.getElementById('email')?.value || '';
    
    // Validate required fields
    if (!name || !phone || !service) {
        alert('Please fill in all required fields (Name, Phone, and Service)');
        return false;
    }
    
    // Send data to Google Sheets if configured
    if (window.v360Config?.sheetUrl?.length > 10) {
        const data = new FormData();
        data.append('Source', window.v360Config.source || 'Website');
        data.append('Name', name);
        data.append('Phone', phone);
        data.append('Service', service);
        data.append('Email', email);
        data.append('Date', new Date().toLocaleString());

        fetch(window.v360Config.sheetUrl, {
            method: 'POST',
            body: data,
            mode: 'no-cors'
        })
            .then(() => console.log('Lead saved to sheet'))
            .catch(err => console.error('Error saving lead:', err));
    }

    
    // Prepare WhatsApp message - FIXED: Clean phone number and proper encoding
    let whatsappNumber = window.v360Config?.whatsapp || siteConfig.whatsapp;
    // Remove any + or spaces from phone number
    whatsappNumber = whatsappNumber.toString().replace(/[+\s]/g, '');
    
    const message = `New Lead from Website:%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Phone:* ${encodeURIComponent(phone)}%0A*Service:* ${encodeURIComponent(service)}%0A*Email:* ${encodeURIComponent(email)}%0A*Date:* ${encodeURIComponent(new Date().toLocaleString())}`;
    
    // Open WhatsApp in new tab (NOT redirect)
    const waUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(waUrl, '_blank');

    // Show inline success message (replaces alert — agentic browser test pass + better UX)
    const form = e.target;
    if (form) {
        form.reset();
        const successDiv = document.createElement('div');
        successDiv.id = 'form-success-msg';
        successDiv.setAttribute('role', 'alert');
        successDiv.style.cssText = 'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;border-radius:12px;padding:18px 24px;margin-top:16px;font-weight:600;font-size:1rem;text-align:center;';
        successDiv.innerHTML = '&#10003; Thank you, ' + name + '! We’ll contact you on WhatsApp shortly.';
        // Remove any old success msg first
        const old = document.getElementById('form-success-msg');
        if (old) old.remove();
        form.parentNode.insertBefore(successDiv, form.nextSibling);
        setTimeout(() => successDiv.remove(), 8000);
    }

    return false;
};

// ========== PERMANENTLY FIXED: FAQ Toggle Functionality ==========
function initFaqToggle() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        // Remove any existing listeners to prevent duplicates
        question.removeEventListener('click', handleFaqClick);
        // Add fresh listener
        question.addEventListener('click', handleFaqClick);
        
        // Also ensure icon clicks work
        const icon = question.querySelector('i');
        if (icon) {
            icon.removeEventListener('click', handleIconClick);
            icon.addEventListener('click', handleIconClick);
        }
    });
}

// Handle FAQ question click
function handleFaqClick(e) {
    const question = e.currentTarget;
    const answer = question.nextElementSibling;
    const icon = question.querySelector('i');
    
    // Check if this is a valid FAQ item
    if (!answer || !answer.classList.contains('faq-answer')) return;
    
    // Close all other FAQs first
    document.querySelectorAll('.faq-answer').forEach(ans => {
        if (ans !== answer) {
            ans.style.display = 'none';
            const otherIcon = ans.previousElementSibling?.querySelector('i');
            if (otherIcon) otherIcon.className = 'fas fa-plus';
        }
    });
    
    // Toggle current FAQ
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        if (icon) icon.className = 'fas fa-plus';
    } else {
        answer.style.display = 'block';
        if (icon) icon.className = 'fas fa-minus';
    }
}

// Handle icon clicks specifically
function handleIconClick(e) {
    e.stopPropagation(); // Prevent double-triggering
    const question = e.target.closest('.faq-question');
    if (question) {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('i');
        
        if (!answer || !answer.classList.contains('faq-answer')) return;
        
        // Close others
        document.querySelectorAll('.faq-answer').forEach(ans => {
            if (ans !== answer) {
                ans.style.display = 'none';
                const otherIcon = ans.previousElementSibling?.querySelector('i');
                if (otherIcon) otherIcon.className = 'fas fa-plus';
            }
        });
        
        // Toggle current
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            if (icon) icon.className = 'fas fa-plus';
        } else {
            answer.style.display = 'block';
            if (icon) icon.className = 'fas fa-minus';
        }
    }
}

// ========== PERMANENTLY FIXED: Location Rendering Function ==========
function renderLocations(locations) {
    if (!locations || !Array.isArray(locations) || locations.length === 0) return;
    
    // Desktop locations container
    const desktopContainer = document.getElementById('desktop-locations-container');
    if (desktopContainer) {
        let html = '';
        locations.forEach(loc => {
            html += `<a href="${loc.url}" style="display:block; padding:8px 0; color:#64748b; font-size:0.9rem; border-bottom:1px solid #eee;">
                <i class="fas fa-map-marker-alt" style="margin-right:8px; color:#1A73E8;"></i> ${loc.name}
            </a>`;
        });
        desktopContainer.innerHTML = html;
    }
    
    // Mobile locations container
    const mobileContainer = document.getElementById('mobile-locations-container');
    if (mobileContainer) {
        let html = '';
        locations.forEach(loc => {
            html += `<a href="${loc.url}" style="display:block; padding:12px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:8px; text-align:center; color:#475569; font-size:0.9rem; text-decoration:none; background:white;">
                <i class="fas fa-map-marker-alt" style="margin-right:8px; color:#1A73E8;"></i> ${loc.name}
            </a>`;
        });
        mobileContainer.innerHTML = html;
    }
    
    // Footer locations list
    const footerList = document.querySelector('.footer-locations-list');
    if (footerList) {
        let html = '';
        locations.forEach(loc => {
            html += `<li><a href="${loc.url}"><i class="fas fa-map-marker-alt"></i> ${loc.name}</a></li>`;
        });
        footerList.innerHTML = html;
    }
}

// ========== MAIN INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing components');
    
    // 1. Initialize FAQ toggles
    initFaqToggle();
    
    // 2. CRITICAL: Manually attach form handler to hero form
    const heroForm = document.querySelector('.glass-card form');
    if (heroForm) {
        // Remove any existing submit handlers
        heroForm.removeEventListener('submit', window.handleLead);
        // Add our fixed handler
        heroForm.addEventListener('submit', window.handleLead);
        console.log('Hero form handler attached');
    }
    
    // 3. Handle any forms with onsubmit attribute
    document.querySelectorAll('form[onsubmit*="handleLead"]').forEach(form => {
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', window.handleLead);
    });
    
    // 4. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if(target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // 5. Dynamic Year in Footer
    const yearElement = document.getElementById('current-year');
    if(yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // 6. Initialize location data if available
    if (typeof locationData !== 'undefined' && Array.isArray(locationData)) {
        renderLocations(locationData);
    }
});

// ========== HANDLE DYNAMIC CONTENT ==========
window.addEventListener('load', function() {
    // Re-initialize FAQs after all content is loaded
    setTimeout(initFaqToggle, 500);
    
    // Re-attach form handler
    const heroForm = document.querySelector('.glass-card form');
    if (heroForm) {
        heroForm.addEventListener('submit', window.handleLead);
    }
});

// ========== MUTATION OBSERVER FOR DYNAMICALLY ADDED CONTENT ==========
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            // Check for new FAQ elements
            if (document.querySelector('.faq-question:not([data-handler-attached])')) {
                initFaqToggle();
            }
            // Check for new forms
            if (document.querySelector('.glass-card form:not([data-handler-attached])')) {
                const form = document.querySelector('.glass-card form');
                form.setAttribute('data-handler-attached', 'true');
                form.addEventListener('submit', window.handleLead);
            }
        }
    });
});

// Start observing after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// 🎨 Design Intelligence — scroll reveal (vanilla IntersectionObserver, no library)
document.addEventListener('DOMContentLoaded', function () {
  try {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('#v360-wrapper .section, main .section, body > .section');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('di-in'); io.unobserve(en.target); }
      });
    // threshold: 0 — reveal as soon as the FIRST pixel enters. threshold 0.12 never
    // fired for tall stacked sections on mobile (zigzag = image + paragraphs stacked
    // = section taller than ~8x viewport → 12% is unreachable → stuck invisible).
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    var hidden = [];
    els.forEach(function (el) {
      // only sections still below the fold — above-fold content is never hidden (LCP-safe)
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        el.classList.add('di-reveal');
        io.observe(el);
        hidden.push(el);
      }
    });
    // Safety net: whatever happens, no section may stay hidden forever
    setTimeout(function () {
      hidden.forEach(function (el) { el.classList.add('di-in'); });
    }, 8000);
  } catch (e) { /* motion is enhancement only — never break the page */ }
});

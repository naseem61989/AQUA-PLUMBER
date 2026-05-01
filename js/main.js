// Main JavaScript for Best Plumber Dubai Water Pump Services
// Generated: 2026-03-11 21:57:04
// PERMANENTLY FIXED: Form redirects to WhatsApp without page refresh
// PERMANENTLY FIXED: FAQ toggles working perfectly

// Business Configuration
const siteConfig = {
    name: "Best Plumber Dubai Water Pump Services",
    phone: "+923107228764",
    whatsapp: "+923107228764",
    email: "engnr825@gmail.com",
    city: "Dubai",
    country: "UAE",
    industry: "Plumbing and Water Pump Repair",
    logo: "https://res.cloudinary.com/dyor4wsy0/image/upload/v1773251809/static_website/logos/logo_Aqua-plumber-dubai-water-pump-services.png"
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
    
    // Show success message
    alert(`Thank you, ${name}! WhatsApp will open in a new tab.`);
    
    // Reset form
    if (e.target && typeof e.target.reset === 'function') {
        e.target.reset();
    }
    
    return false; // Additional prevention
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
    if (!locations || !Array.isArray(locations)) return;
    
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

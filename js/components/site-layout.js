/* ==========================================================================
   Phi Atlas Advisory - Shared Site Header & FREC Footer Components
   Single source of truth for navigation, brand mark, and compliance footer.
   Uses the exact CSS classes and tokens defined in /css/base.css.
   ========================================================================== */

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname.replace(/\/index\.html$/, '/');

    const isOverview = path === '/' || path === '';
    const isStrategy = path.startsWith('/strategy') || path.startsWith('/tools');
    const isListings = path.startsWith('/listings');
    const isResources = path.startsWith('/resources');
    const isConnect = path.startsWith('/connect');

    this.innerHTML = `
      <header>
        <nav class="header-nav">
          <a href="/" class="brand-identity" aria-label="Phi Atlas Advisory Home">
            <svg class="brand-mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="50" y1="7" x2="50" y2="93" stroke="var(--logo-primary)" stroke-width="5.0" stroke-linecap="round"/>
              <path d="M 43.5 18.6 A 32 32 0 0 0 43.5 81.4" stroke="var(--logo-primary)" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M 56.5 18.6 A 32 32 0 0 1 56.5 81.4" stroke="var(--logo-primary)" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M 43.5 31.6 A 30 19 0 0 0 43.5 68.4" stroke="var(--color-gold)" stroke-width="2.6" stroke-linecap="round"/>
              <path d="M 56.5 31.6 A 30 19 0 0 1 56.5 68.4" stroke="var(--color-gold)" stroke-width="2.6" stroke-linecap="round"/>
              <line x1="20" y1="50" x2="80" y2="50" stroke="var(--color-ochre)" stroke-width="2.4" stroke-dasharray="3.2 2.4"/>
              <circle cx="20" cy="50" r="3.0" fill="var(--logo-primary)"/>
              <circle cx="80" cy="50" r="3.0" fill="var(--logo-primary)"/>
              <circle cx="50" cy="50" r="4.6" fill="var(--color-gold)"/>
            </svg>
            <div class="brand-text">
              <span class="brand-title">Phi Atlas</span>
              <span class="brand-subtitle">Advisory</span>
            </div>
          </a>

          <ul class="nav-links">
            <li><a href="/" class="nav-link${isOverview ? ' active' : ''}">Overview</a></li>
            <li><a href="/strategy" class="nav-link${isStrategy ? ' active' : ''}">Strategy</a></li>
            <li><a href="/listings" class="nav-link${isListings ? ' active' : ''}">Listings</a></li>
            <li><a href="/resources" class="nav-link${isResources ? ' active' : ''}">Resources</a></li>
            <li><a href="/connect" class="nav-link${isConnect ? ' active' : ''}">Connect</a></li>
          </ul>

          <div class="broker-header-lockup">
            <span class="broker-header-label">Brokered By</span>
            <img src="/broker-logo.png" alt="Brokers LLC" class="broker-logo-header">
          </div>
        </nav>
      </header>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer-brand-strip">
          <div>
            <p class="footer-brokerage-title">Brokers, LLC</p>
            <p>20200 W. Dixie Hwy, Suite G-07, Aventura, FL 33180</p>
          </div>
          <img src="/broker-logo.png" alt="Brokers LLC Logo" class="footer-broker-logo">
        </div>

        <p class="footer-links">
          Jesus Gomez Polo, Licensed Real Estate Sales Associate &nbsp;|&nbsp;
          <a href="https://phiatlas.com">phiatlas.com</a>
        </p>

        <p class="footer-compliance-text">
          Phi Atlas Advisory is a real estate marketing and advisory entity operated by Jesus Gomez Polo, a licensed Florida Real Estate Sales Associate affiliated with Brokers, LLC. All brokerage services and transactions are conducted under the supervision of Brokers, LLC in strict compliance with the Florida Real Estate Commission (FREC Rules 61J2-10.025 &amp; 61J2-10.026). Equal Housing Opportunity.
        </p>
      </footer>
    `;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

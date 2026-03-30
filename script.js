/**
 * ============================================================
 * CAMPUS BLOOD DONOR FINDER — script.js
 * SRKR Engineering College, Bimavaram
 * ============================================================
 * Features:
 *  - Dummy JSON donor data (pre-loaded + user-added via localStorage)
 *  - Donor search with loading animation
 *  - Donor registration with full form validation
 *  - Dashboard with stats and blood-group filtering
 *  - Dark mode toggle (saved to localStorage)
 *  - Sticky navbar + active link highlighting
 *  - Animated stat counters
 *  - OTP Verification (frontend simulation) with 30s resend timer
 *  - 90-day Blood Donation Cooldown Logic
 *  - Eligibility status badges and countdown timers
 *  - Toast Notification system
 *  - College Branding (SRKR Engineering College)
 * ============================================================
 */

/* ============================================================
   DUMMY DONOR DATA
   ============================================================ */
const SEED_DONORS = [
  { id: 1,  name: "Ravi Kumar",       bloodGroup: "O+",  phone: "9876543210", dept: "CSE",   year: "3rd Year", available: true,  lastDonationDate: "2025-01-15" },
  { id: 2,  name: "Priya Lakshmi",    bloodGroup: "A+",  phone: "9845012345", dept: "ECE",   year: "2nd Year", available: true,  lastDonationDate: "2024-11-20" },
  { id: 3,  name: "Arjun Reddy",      bloodGroup: "B+",  phone: "9123456789", dept: "MECH",  year: "4th Year", available: false, lastDonationDate: "2025-03-01" }, // Not eligible
  { id: 4,  name: "Sai Charan",       bloodGroup: "AB+", phone: "9012345678", dept: "EEE",   year: "1st Year", available: true,  lastDonationDate: "" },
  { id: 5,  name: "Divya Sri",        bloodGroup: "O-",  phone: "8901234567", dept: "CIVIL", year: "3rd Year", available: true,  lastDonationDate: "2025-02-10" }, // Not eligible
  { id: 6,  name: "Kiran Babu",       bloodGroup: "B-",  phone: "8765432109", dept: "IT",    year: "2nd Year", available: false, lastDonationDate: "" },
  { id: 7,  name: "Anusha Devi",      bloodGroup: "A-",  phone: "7654321098", dept: "CSE",   year: "1st Year", available: true,  lastDonationDate: "2024-12-05" },
  { id: 8,  name: "Mahesh Varma",     bloodGroup: "AB-", phone: "9988776655", dept: "MBA",   year: "2nd Year", available: true,  lastDonationDate: "" },
  { id: 9,  name: "Swathi Nair",      bloodGroup: "A+",  phone: "9876501234", dept: "MCA",   year: "1st Year", available: false, lastDonationDate: "2025-03-15" }, // Not eligible
  { id: 10, name: "Venkat Rao",       bloodGroup: "O+",  phone: "9765432101", dept: "ECE",   year: "4th Year", available: true,  lastDonationDate: "2024-10-10" },
  { id: 11, name: "Lakshmi Prasad",   bloodGroup: "B+",  phone: "8877665544", dept: "CSE",   year: "3rd Year", available: true,  lastDonationDate: "" },
  { id: 12, name: "Deepak Kumar",     bloodGroup: "A+",  phone: "7766554433", dept: "MECH",  year: "2nd Year", available: true,  lastDonationDate: "2025-01-20" },
  { id: 13, name: "Ramya Krishnan",   bloodGroup: "O-",  phone: "6655443322", dept: "EEE",   year: "4th Year", available: false, lastDonationDate: "" },
  { id: 14, name: "Harsha Vardhan",   bloodGroup: "AB+", phone: "9898989898", dept: "CIVIL", year: "3rd Year", available: true,  lastDonationDate: "" },
  { id: 15, name: "Pooja Reddy",      bloodGroup: "B-",  phone: "9191919191", dept: "IT",    year: "1st Year", available: true,  lastDonationDate: "" },
];

/* ============================================================
   LOCAL STORAGE HELPERS
   ============================================================ */

/**
 * Returns all donors (seed + user-registered).
 * Seed donors are always included; registered ones are from localStorage.
 */
function getAllDonors() {
  const stored = localStorage.getItem("bloodbridge_donors");
  const userDonors = stored ? JSON.parse(stored) : [];
  return [...SEED_DONORS, ...userDonors];
}

/**
 * Saves a new donor to localStorage.
 * @param {Object} donor
 */
function saveDonorToStorage(donor) {
  const stored = localStorage.getItem("bloodbridge_donors");
  const userDonors = stored ? JSON.parse(stored) : [];
  userDonors.push(donor);
  localStorage.setItem("bloodbridge_donors", JSON.stringify(userDonors));
}

/* ============================================================
   DARK MODE
   ============================================================ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const html        = document.documentElement;

// Load saved preference
(function initTheme() {
  const saved = localStorage.getItem("bloodbridge_theme") || "light";
  html.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
})();

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  const next    = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("bloodbridge_theme", next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

/* ============================================================
   HAMBURGER / MOBILE MENU
   ============================================================ */
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

// Close menu on link click
navLinks.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

/* ============================================================
   STICKY NAVBAR + ACTIVE LINK HIGHLIGHTING
   ============================================================ */
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");
const sections  = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
  // Navbar shadow
  navbar.classList.toggle("scrolled", window.scrollY > 20);

  // Back-to-top button visibility
  backToTop.classList.toggle("visible", window.scrollY > 400);

  // Active nav link
  let current = "";
  sections.forEach(sec => {
    const sectionTop = sec.offsetTop - 100;
    if (window.scrollY >= sectionTop) current = sec.getAttribute("id");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) link.classList.add("active");
  });
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
/**
 * Shows a toast notification.
 * @param {string} message 
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - ms
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'circle-check';
  if (type === 'error') icon = 'circle-exclamation';

  toast.innerHTML = `
    <i class="fas fa-${icon} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   ANIMATED STAT COUNTERS
   ============================================================ */
/**
 * Animates a counter from 0 to `target`.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} duration (ms)
 */
function animateCounter(el, target, duration = 1200) {
  if (!el) return;
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ============================================================
   UPDATE ALL STATS (Hero + Dashboard)
   ============================================================ */
function updateAllStats() {
  const donors    = getAllDonors();
  const total     = donors.length;
  const available = donors.filter(d => d.available).length;
  const eligible  = donors.filter(d => checkEligibility(d.lastDonationDate).isEligible).length;

  // Hero stats
  animateCounter(document.getElementById("statTotal"),     total);
  animateCounter(document.getElementById("statAvailable"), available);

  // Dashboard stats
  animateCounter(document.getElementById("dashTotal"),       total);
  animateCounter(document.getElementById("dashAvailable"),   available);
  animateCounter(document.getElementById("dashUnavailable"), total - available);
  animateCounter(document.getElementById("dashEligible"),    eligible);
}

/* ============================================================
   ELIGIBILITY & COOLDOWN LOGIC
   ============================================================ */
/**
 * Checks if a donor is eligible based on the 90-day rule.
 * @param {string} lastDate - YYYY-MM-DD
 * @returns {Object} { isEligible: boolean, daysLeft: number, nextDate: Date }
 */
function checkEligibility(lastDate) {
  if (!lastDate) return { isEligible: true, daysLeft: 0 };

  const last = new Date(lastDate);
  const now  = new Date();
  const diffTime = now - last;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const COOLDOWN_DAYS = 90;
  const isEligible = diffDays >= COOLDOWN_DAYS;
  const daysLeft   = Math.max(0, COOLDOWN_DAYS - diffDays);
  
  const nextDate = new Date(last);
  nextDate.setDate(last.getDate() + COOLDOWN_DAYS);

  return { isEligible, daysLeft, nextDate };
}

/**
 * Updates the eligibility widget in the registration form.
 */
function handleDateChange() {
  const dateVal = document.getElementById('lastDonationDate').value;
  const widget  = document.getElementById('eligibilityWidget');
  const status  = document.getElementById('eligibilityStatus');
  const info    = document.getElementById('countdownInfo');
  const submitBtn = document.getElementById('sendOtpBtn');

  if (!dateVal) {
    widget.style.display = 'none';
    submitBtn.disabled = false;
    return;
  }

  widget.style.display = 'block';
  const { isEligible, daysLeft, nextDate } = checkEligibility(dateVal);

  if (isEligible) {
    status.innerHTML = '<i class="fas fa-circle-check"></i> Eligible to Donate';
    status.className = 'eligibility-status status-eligible-text';
    info.textContent = 'You have completed the 90-day cooldown period.';
    submitBtn.disabled = false;
  } else {
    status.innerHTML = '<i class="fas fa-circle-xmark"></i> Not Eligible Yet';
    status.className = 'eligibility-status status-not-eligible-text';
    info.innerHTML = `Medical cooldown active. You can donate again in <span class="days-left">${daysLeft} days</span> (${nextDate.toLocaleDateString()}).`;
    submitBtn.disabled = true;
    showToast(`You are not eligible to donate for ${daysLeft} more days.`, 'error');
  }
}

/* ============================================================
   OTP VERIFICATION SYSTEM (Frontend Simulation)
   ============================================================ */
let generatedOtp = null;
let resendTimerInterval = null;
let isOtpVerified = false; // [NEW] Flag to track verification status

/* ============================================================
   EMERGENCY FORM & POPUP SYSTEM
   ============================================================ */
let emergencyInterval;
const EMERGENCY_MODAL_ID = "emergencyModal";
const EMERGENCY_FORM_ID = "emergencyFormModal";

/**
 * Shows the initial form to enter emergency details.
 */
function showEmergencyForm() {
    const formModal = document.getElementById(EMERGENCY_FORM_ID);
    if (formModal) formModal.classList.add("show");
}

/**
 * Hides the emergency entry form.
 */
function hideEmergencyForm() {
    const formModal = document.getElementById(EMERGENCY_FORM_ID);
    if (formModal) formModal.classList.remove("show");
}

/**
 * Handles the emergency data form submission.
 * Saves to localStorage and triggers the alert popup.
 */
function submitEmergencyRequest(e) {
    if (e) e.preventDefault();

    const bloodGroup = document.getElementById('emBloodGroup').value;
    const location = document.getElementById('emLocation').value.trim();
    const contact = document.getElementById('emContact').value.trim();

    if (!bloodGroup || !location || contact.length < 10) {
        showToast("Please fill all emergency details correctly.", "error");
        return;
    }

    // Save request to localStorage (demo data)
    const emergencyData = { bloodGroup, location, contact, timestamp: Date.now() };
    localStorage.setItem('bloodbridge_active_emergency', JSON.stringify(emergencyData));

    hideEmergencyForm();
    showEmergencyModal(); // Trigger the actual popup with this new data
}

/**
 * Initializes the emergency popup listeners.
 */
function initEmergencyPopup() {
  const modal = document.getElementById(EMERGENCY_MODAL_ID);
  const formModal = document.getElementById(EMERGENCY_FORM_ID);
  
  if (!modal || !formModal) return;

  // Auto-show alert if one exists in localStorage and hasn't been shown this session
  if (localStorage.getItem('bloodbridge_active_emergency') && !sessionStorage.getItem("bloodbridge_emergency_shown")) {
    setTimeout(showEmergencyModal, 2500);
  }

  // Close listeners for Alert Modal
  document.getElementById("closeEmergencyModal").addEventListener("click", hideEmergencyModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) hideEmergencyModal(); });

  // Close listeners for Entry Form Modal
  const closeFormBtn = document.getElementById("closeEmergencyForm");
  if (closeFormBtn) closeFormBtn.addEventListener("click", hideEmergencyForm);
  formModal.addEventListener("click", (e) => { if (e.target === formModal) hideEmergencyForm(); });
}

/**
 * Displays the alert popup with dynamic data.
 */
function showEmergencyModal() {
  const modal = document.getElementById(EMERGENCY_MODAL_ID);
  if (!modal) return;

  // Load latest data from storage
  const rawData = localStorage.getItem('bloodbridge_active_emergency');
  if (rawData) {
      const data = JSON.parse(rawData);
      
      // Update UI with dynamic data
      const wrapper = document.getElementById('emergencyBloodWrapper');
      if (wrapper) wrapper.innerHTML = `<span class="urgent-bg">${data.bloodGroup}</span>`;
      
      const locDisplay = document.getElementById('emergencyLocationDisplay');
      if (locDisplay) locDisplay.textContent = data.location;
      
      const conDisplay = document.getElementById('emergencyContactDisplay');
      const conLink = document.getElementById('emergencyContactLink');
      if (conDisplay) conDisplay.textContent = data.contact;
      if (conLink) conLink.href = `tel:${data.contact}`;
  }

  modal.classList.add("show");
  sessionStorage.setItem("bloodbridge_emergency_shown", "true");
  startEmergencyTimer();
}

function hideEmergencyModal() {
  const modal = document.getElementById(EMERGENCY_MODAL_ID);
  if (!modal) return;

  modal.classList.remove("show");
  clearInterval(emergencyInterval);
}

function handleICanDonate() {
  hideEmergencyModal();
  const registerSec = document.getElementById("register");
  if (registerSec) {
    registerSec.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      const p = document.getElementById("regPhone");
      if (p) {
          p.focus();
          p.classList.add('pulse-border'); // Visual hint
          setTimeout(() => p.classList.remove('pulse-border'), 2000);
      }
    }, 800);
  }
}

/**
 * Starts a countdown timer for urgency.
 */
function startEmergencyTimer() {
  const timerSpan = document.getElementById("urgentTimer");
  if (!timerSpan) return;

  let timeLeft = (2 * 60 * 60) + (15 * 60) + 30; // 2h 15m 30s
  clearInterval(emergencyInterval);
  
  emergencyInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
        clearInterval(emergencyInterval);
        return;
    }
    const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
    const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerSpan.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

/* ============================================================
   OTP VERIFICATION SYSTEM (Frontend Simulation)
   ============================================================ */
function sendOTP() {
  const phone = document.getElementById('regPhone').value;
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showError("errPhone", "Enter a valid 10-digit mobile number first.");
    showToast("Invalid phone number", "error");
    return;
  }

  // [IMPORTANT] Reset verification state when sending new OTP
  isOtpVerified = false;
  document.getElementById('otpVerifiedBadge').style.display = 'none';

  // Generate 6-digit OTP
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Simulation: Show in console and on-page demo box
  console.log(`[SRKR BloodBridge] Demo OTP for ${phone}: ${generatedOtp}`);
  document.getElementById('otpDemoValue').textContent = generatedOtp;
  document.getElementById('otpPhoneDisplay').textContent = phone;

  // UI Transition
  document.getElementById('step1').style.display = 'none';
  document.getElementById('otpPanel').style.display = 'block';
  
  showToast('OTP sent successfully!', 'success');
  startResendTimer();
}

/**
 * Starts 30s countdown for resend button.
 */
function startResendTimer() {
  const btn = document.getElementById('resendBtn');
  const timerSpan = document.getElementById('resendTimer');
  let timeLeft = 30;
  
  btn.disabled = true;
  clearInterval(resendTimerInterval);

  resendTimerInterval = setInterval(() => {
    timeLeft--;
    timerSpan.textContent = `(${timeLeft}s)`;
    
    if (timeLeft <= 0) {
      clearInterval(resendTimerInterval);
      btn.disabled = false;
      timerSpan.textContent = '';
    }
  }, 1000);
}

function resendOTP() {
  sendOTP();
}

/**
 * Validates the entered OTP.
 */
function verifyOTP() {
  const entered = document.getElementById('otpInput').value;
  const err = document.getElementById('errOtp');
  
  if (entered === generatedOtp) {
    isOtpVerified = true; // Set global flag
    showToast('Phone verified successfully!', 'success');
    document.getElementById('otpInput').disabled = true;
    document.getElementById('verifyOtpBtn').style.display = 'none';
    document.getElementById('resendBtn').style.display = 'none';
    document.querySelectorAll('.otp-actions').forEach(el => el.style.display = 'none');
    document.getElementById('otpVerifiedBadge').style.display = 'inline-flex';
    err.textContent = "";
    
    // Move to step 3 after small delay
    setTimeout(goToStep3, 1200);
  } else {
    isOtpVerified = false;
    err.textContent = 'Invalid OTP. Please try again.';
    document.getElementById('otpInput').classList.add('error');
    showToast('Incorrect OTP', 'error');
  }
}

function goToStep3() {
  document.getElementById('otpPanel').style.display = 'none';
  document.getElementById('step3Panel').style.display = 'block';
  populateReview();
}

function goBackToStep1() {
  document.getElementById('otpPanel').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
}

function goBackToOtp() {
  document.getElementById('step3Panel').style.display = 'none';
  document.getElementById('otpPanel').style.display = 'block';
}

function populateReview() {
  const name = document.getElementById('regName').value;
  const bg   = document.getElementById('regBloodGroup').value;
  const dept = document.getElementById('regDept').value;
  const year = document.getElementById('regYear').value;
  const date = document.getElementById('lastDonationDate').value || 'Never';

  document.getElementById('reviewBox').innerHTML = `
    <div class="review-item"><span class="review-label">Name</span><span class="review-value">${escapeHtml(name)}</span></div>
    <div class="review-item"><span class="review-label">Blood Group</span><span class="review-value">${escapeHtml(bg)}</span></div>
    <div class="review-item"><span class="review-label">Department</span><span class="review-value">${escapeHtml(dept)}</span></div>
    <div class="review-item"><span class="review-label">Year</span><span class="review-value">${escapeHtml(year)}</span></div>
    <div class="review-item"><span class="review-label">Last Donation</span><span class="review-value">${escapeHtml(date)}</span></div>
  `;
}

/* ============================================================
   SEARCH DONORS
   ============================================================ */
let lastSearchResults = []; // cache for available-only filter

function searchDonors() {
  const bloodGroup = document.getElementById("searchBloodGroup").value.trim();
  const location   = document.getElementById("searchLocation").value.trim().toLowerCase();

  // Show loading, hide previous results
  document.getElementById("donorsGrid").innerHTML = "";
  document.getElementById("noResults").style.display     = "none";
  document.getElementById("resultsHeader").style.display = "none";
  document.getElementById("loadingSpinner").classList.add("active");

  // Simulate async search delay (600ms)
  setTimeout(() => {
    document.getElementById("loadingSpinner").classList.remove("active");

    const donors = getAllDonors();
    const results = donors.filter(donor => {
      const bgMatch  = !bloodGroup || donor.bloodGroup === bloodGroup;
      const locMatch = !location   || donor.dept.toLowerCase().includes(location) || donor.name.toLowerCase().includes(location);
      return bgMatch && locMatch;
    });

    lastSearchResults = results;
    renderSearchResults(results, "all");
  }, 600);
}

/**
 * Renders donor cards to the search grid.
 * @param {Array}  donors
 * @param {string} filter — 'all' | 'available'
 */
function renderSearchResults(donors, filter) {
  const grid      = document.getElementById("donorsGrid");
  const noResults = document.getElementById("noResults");
  const header    = document.getElementById("resultsHeader");
  const countEl   = document.getElementById("resultsCount");

  let filtered = donors;
  if (filter === "available") {
    filtered = donors.filter(d => d.available);
  } else if (filter === "eligible") {
    filtered = donors.filter(d => checkEligibility(d.lastDonationDate).isEligible);
  }

  grid.innerHTML = "";

  if (filtered.length === 0) {
    noResults.style.display = "block";
    header.style.display    = "none";
    return;
  }

  noResults.style.display = "none";
  header.style.display    = "flex";
  countEl.textContent     = `${filtered.length} donor${filtered.length !== 1 ? "s" : ""} found`;

  filtered.forEach((donor, idx) => {
    grid.insertAdjacentHTML("beforeend", createDonorCard(donor, idx));
  });
}

/**
 * Filter button handler for search results.
 * @param {string} type — 'all' | 'available'
 */
function filterResults(type) {
  document.querySelectorAll(".results-filter .filter-chip").forEach(c => c.classList.remove("active"));
  document.getElementById(type === "all" ? "filterAll" : "filterAvailable").classList.add("active");
  renderSearchResults(lastSearchResults, type);
}

/**
 * Creates an HTML string for a donor card.
 * @param {Object} donor
 * @param {number} idx   — used for staggered animation delay
 * @returns {string}
 */
function createDonorCard(donor, idx) {
  const initials  = donor.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const available = donor.available;
  const statusCls = available ? "status-available" : "status-unavailable";
  const statusTxt = available ? "Available"         : "Not Available";
  
  const { isEligible, daysLeft } = checkEligibility(donor.lastDonationDate);
  const eligBadge = isEligible 
    ? `<span class="eligibility-badge badge-eligible"><i class="fas fa-check"></i> Eligible</span>`
    : `<span class="eligibility-badge badge-not-eligible"><i class="fas fa-clock"></i> Not Eligible (${daysLeft}d)</span>`;

  return `
    <div class="donor-card" style="animation-delay:${idx * 0.07}s">
      <div class="donor-card-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="donor-avatar">${initials}</div>
          <div>
            <div class="donor-name">${escapeHtml(donor.name)}</div>
            <div class="donor-dept">${escapeHtml(donor.dept)} · ${escapeHtml(donor.year)}</div>
          </div>
        </div>
        <div class="blood-badge-card">${escapeHtml(donor.bloodGroup)}</div>
      </div>

      <div class="donor-card-body">
        <div class="eligibility-row" style="margin-bottom: 12px;">
          ${eligBadge}
        </div>
        <div class="donor-info-row">
          <i class="fas fa-phone"></i>
          <span>${escapeHtml(donor.phone)}</span>
        </div>
        <div class="donor-info-row">
          <i class="fas fa-building-columns"></i>
          <span>${escapeHtml(donor.dept)} Department</span>
        </div>
        <div class="donor-info-row">
          <i class="fas fa-circle-dot"></i>
          <span class="status-badge ${statusCls}">
            <span class="status-dot"></span>${statusTxt}
          </span>
        </div>
      </div>

      <a href="tel:${escapeHtml(donor.phone)}" class="donor-contact-btn">
        <i class="fas fa-phone-volume"></i> Call Donor
      </a>
    </div>`;
}

/* ============================================================
   DONOR REGISTRATION FORM
   ============================================================ */

// Toggle label for availability switch
document.getElementById("regAvailability").addEventListener("change", function () {
  document.getElementById("availLabel").textContent =
    this.checked ? "Available to Donate" : "Not Available Right Now";
});

/**
 * Form submit handler.
 * @param {Event} e
 */
function registerDonor(e) {
  if (e) e.preventDefault();

  // [CRITICAL] Check OTP verification status
  if (!isOtpVerified) {
      showToast("Verification Required! Please verify your phone with OTP first.", "error");
      goToOtpStepManually(); // Utility function to force go back to OTP step if needed
      return;
  }

  // Gather values
  const name       = document.getElementById("regName").value.trim();
  const bloodGroup = document.getElementById("regBloodGroup").value;
  const phone      = document.getElementById("regPhone").value.trim();
  const dept       = document.getElementById("regDept").value;
  const year       = document.getElementById("regYear").value;
  const available  = document.getElementById("regAvailability").checked;
  const lastDonationDate = document.getElementById("lastDonationDate").value;

  // Final Validation
  if (!validateRegistrationForm(name, bloodGroup, phone, dept, year)) {
      showToast("Please fix the errors in Step 1.", "error");
      goBackToStep1();
      return;
  }

  // Animate submit button
  const btn = document.getElementById("submitBtn");
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing…';
  btn.disabled  = true;

  setTimeout(() => {
    // Build donor object
    const newDonor = {
      id: Date.now(),
      name, bloodGroup, phone, dept, year, available, lastDonationDate
    };

    // Persist to localStorage
    saveDonorToStorage(newDonor);

    // Show success message
    document.getElementById("step3Panel").style.display = "none";
    document.getElementById("successMessage").style.display = "block";

    showToast("Registration successful! Thank you for joining.", "success");

    // Refresh stats & dashboard
    updateAllStats();
    renderDashboard(getAllDonors(), "all");
    
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 1500);
}

/**
 * Force navigation back to OTP if submission was attempted without verification.
 */
function goToOtpStepManually() {
    document.getElementById('step3Panel').style.display = 'none';
    document.getElementById('otpPanel').style.display = 'block';
}

/**
 * Validates all registration fields.
 * Returns true if valid, false if any field failed.
 */
function validateRegistrationForm(name, bloodGroup, phone, dept, year) {
  clearErrors();
  let valid = true;

  if (!name || name.length < 2) {
    showError("errName", "Please enter your full name (at least 2 characters).");
    document.getElementById("regName").classList.add("error");
    valid = false;
  }

  if (!bloodGroup) {
    showError("errBloodGroup", "Please select your blood group.");
    document.getElementById("regBloodGroup").classList.add("error");
    valid = false;
  }

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    showError("errPhone", "Enter a valid 10-digit Indian mobile number.");
    document.getElementById("regPhone").classList.add("error");
    valid = false;
  }

  if (!dept) {
    showError("errDept", "Please select your department.");
    document.getElementById("regDept").classList.add("error");
    valid = false;
  }

  if (!year) {
    showError("errYear", "Please select your year.");
    document.getElementById("regYear").classList.add("error");
    valid = false;
  }

  return valid;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ["errName","errBloodGroup","errPhone","errDept","errYear"].forEach(id => showError(id, ""));
  document.querySelectorAll(".form-control.error").forEach(el => el.classList.remove("error"));
}

/** Resets the form back to its initial state after successful registration. */
function resetForm() {
  document.getElementById("registerForm").reset();
  document.getElementById("availLabel").textContent = "Available to Donate";
  
  // Reset Steps
  document.getElementById("step1").style.display = "block";
  document.getElementById("otpPanel").style.display = "none";
  document.getElementById("step3Panel").style.display = "none";
  document.getElementById("successMessage").style.display = "none";
  
  // Reset OTP state
  isOtpVerified = false; // Reset global flag
  document.getElementById('otpInput').disabled = false;
  document.getElementById('otpInput').value = "";
  document.getElementById('verifyOtpBtn').style.display = 'block';
  document.getElementById('resendBtn').style.display = 'block';
  document.querySelectorAll('.otp-actions').forEach(el => el.style.display = 'grid');
  document.getElementById('otpVerifiedBadge').style.display = 'none';
  document.getElementById('eligibilityWidget').style.display = 'none';
  document.getElementById('sendOtpBtn').disabled = false;
  
  clearErrors();
}

/* ============================================================
   DASHBOARD
   ============================================================ */
let currentDashFilter = "all";

/**
 * Renders the dashboard table.
 * @param {Array}  donors
 * @param {string} filter — blood group string or 'all'
 */
function renderDashboard(donors, filter) {
  currentDashFilter = filter;

  // Update active filter chip
  document.querySelectorAll("#bloodGroupFilters .filter-chip").forEach(c => {
    c.classList.remove("active");
    const txt = c.textContent.trim();
    if ((filter === "all" && txt === "All") || txt === filter) {
      c.classList.add("active");
    }
  });

  const filtered = filter === "all" ? donors : donors.filter(d => d.bloodGroup === filter);

  const tbody    = document.getElementById("dashboardBody");
  const noResult = document.getElementById("dashNoResults");
  const table    = document.getElementById("dashboardTable");

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    table.querySelector("thead").style.display = "none";
    noResult.style.display = "block";
    return;
  }

  table.querySelector("thead").style.display = "";
  noResult.style.display = "none";

  filtered.forEach((donor, idx) => {
    const available = donor.available;
    const statusCls = available ? "status-available" : "status-unavailable";
    
    const { isEligible, daysLeft } = checkEligibility(donor.lastDonationDate);
    const eligBadge = isEligible 
      ? `<span class="eligibility-badge badge-eligible">Eligible</span>`
      : `<span class="eligibility-badge badge-not-eligible">Cooldown (${daysLeft}d)</span>`;

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(donor.name)}</strong></td>
        <td><span class="blood-tag">${escapeHtml(donor.bloodGroup)}</span></td>
        <td>${escapeHtml(donor.dept)}</td>
        <td>${escapeHtml(donor.year)}</td>
        <td>${escapeHtml(donor.phone)}</td>
        <td><span class="status-badge ${statusCls}"><span class="status-dot"></span>${available ? "Available" : "Unavailable"}</span></td>
        <td>${eligBadge}</td>
      </tr>`);
  });
}

/**
 * Dashboard filter button handler.
 * @param {string} group — 'all' or a blood group
 */
function filterDashboard(group) {
  renderDashboard(getAllDonors(), group);
}

/* ============================================================
   INTERSECTION OBSERVER — animate sections on scroll
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity  = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".step-card, .stat-card, .stats-card").forEach(el => {
  el.style.opacity   = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity .5s ease, transform .5s ease";
  observer.observe(el);
});

/* ============================================================
   UTILITY
   ============================================================ */
/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/* ============================================================
   INITIALISATION — runs on page load
   ============================================================ */
(function init() {
  const donors = getAllDonors();
  updateAllStats();
  renderDashboard(donors, "all");

  // Allow pressing Enter in search inputs to trigger search
  ["searchBloodGroup", "searchLocation"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") searchDonors(); });
  });

  // Only allow digits in phone field & format
  const regPhone = document.getElementById("regPhone");
  if (regPhone) {
    regPhone.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  // Bind Eligibility check
  const dateInput = document.getElementById('lastDonationDate');
  if (dateInput) {
    dateInput.addEventListener('change', handleDateChange);
  }

  // Initialize Emergency Popup
  initEmergencyPopup();
})();

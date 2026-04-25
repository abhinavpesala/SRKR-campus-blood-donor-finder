// State & Constants
let currentOTP = "";
let donorToSave = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeBtn').innerHTML = '<i class="fas fa-sun"></i>';
    }
    renderDashboard();
    initEmergencyTimer();
});

// Section Navigation
function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    
    // Refresh data when switching sections
    if (id === 'dashboard') renderDashboard();
    if (id === 'search') filterDonors();
    
    window.scrollTo(0, 0);
}

// Theme Toggle
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeBtn').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Data Handling
function getDonors() {
    return JSON.parse(localStorage.getItem('donors')) || [];
}

function saveDonor(donor) {
    const donors = getDonors();
    donors.push(donor);
    localStorage.setItem('donors', JSON.stringify(donors));
}

// 90-Day Eligibility Check
function checkEligibility(lastDate) {
    if (!lastDate) return { ok: true };
    const diff = new Date() - new Date(lastDate);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return { ok: days >= 90, daysLeft: 90 - days };
}

// Registration Logic
function sendOTP() {
    const phone = document.getElementById('phone').value;
    if (phone.length !== 10) return alert("Enter valid 10-digit phone!");
    
    // Eligibility check
    const lastDate = document.getElementById('lastDate').value;
    const check = checkEligibility(lastDate);
    if (!check.ok) return alert(`Not eligible! Wait ${check.daysLeft} more days.`);

    currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('otpPrompt').innerText = `DEMO OTP: ${currentOTP}`;
    document.getElementById('otpArea').style.display = 'block';
    document.getElementById('otpBtn').style.display = 'none';
}

function verifyOTP() {
    const input = document.getElementById('otpInput').value;
    if (input !== currentOTP) return alert("Invalid OTP!");

    // Create donor object
    const donor = {
        name: document.getElementById('name').value,
        blood: document.getElementById('blood').value,
        phone: document.getElementById('phone').value,
        dept: document.getElementById('dept').value,
        year: document.getElementById('year').value,
        lastDate: document.getElementById('lastDate').value,
        regDate: new Date().toISOString()
    };

    if (!donor.name || !donor.blood || !donor.dept) return alert("Fill all fields!");

    saveDonor(donor);
    alert("Registration Successful!");
    resetForm();
    showSection('dashboard');
    renderDashboard();
}

function resetForm() {
    document.getElementById('regForm').reset();
    document.getElementById('otpArea').style.display = 'none';
    document.getElementById('otpBtn').style.display = 'block';
}

// Search & Rendering
function filterDonors() {
    const blood = document.getElementById('searchBlood').value;
    const dept = document.getElementById('searchDept').value.toLowerCase();
    const all = getDonors();
    
    const matched = all.filter(d => 
        (!blood || d.blood === blood) && 
        (!dept || d.dept.toLowerCase().includes(dept) || d.name.toLowerCase().includes(dept))
    );
    
    renderResults(matched);
}

function renderResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = results.length ? "" : "<p>No donors found.</p>";
    results.forEach(d => {
        const elig = checkEligibility(d.lastDate);
        container.innerHTML += `
            <div class="donor-card">
                <div class="card-head">
                    <strong>${d.name}</strong>
                    <span class="blood-badge">${d.blood}</span>
                </div>
                <p><i class="fas fa-building"></i> ${d.dept} (${d.year})</p>
                <p><i class="fas fa-phone"></i> ${d.phone}</p>
                <span class="status">${elig.ok ? "✅ Available" : "⏳ Cooldown (" + elig.daysLeft + "d)"}</span>
                <a href="tel:${d.phone}" class="btn-s" style="display:block; text-align:center; margin-top:10px; text-decoration:none;">Call Now</a>
            </div>
        `;
    });
}

function renderDashboard() {
    const donors = getDonors();
    const tbody = document.getElementById('dashBody');
    tbody.innerHTML = donors.length ? "" : "<tr><td colspan='6' style='text-align:center'>No donors registered yet.</td></tr>";
    donors.forEach(d => {
        const elig = checkEligibility(d.lastDate);
        tbody.innerHTML += `
            <tr>
                <td>${d.name}</td>
                <td><span class="blood-badge">${d.blood}</span></td>
                <td>${d.dept}</td>
                <td>${d.year}</td>
                <td>${d.phone}</td>
                <td>${elig.ok ? "Available" : "Cooldown"}</td>
            </tr>
        `;
    });
}

// Emergency Logic
function openEmergency() {
    document.getElementById('emergencyModal').classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function broadcastAlert() {
    const blood = document.getElementById('eBlood').value;
    const loc = document.getElementById('eLoc').value;
    const phone = document.getElementById('eCall').value;

    if (!blood || !loc || !phone) return alert("Fill all emergency details!");

    document.getElementById('alertMsg').innerText = `URGENT: ${blood} Blood Required!`;
    document.getElementById('alertLoc').innerText = loc;
    document.getElementById('alertCon').innerText = phone;
    
    closeModal('emergencyModal');
    document.getElementById('alertModal').classList.add('show');
    startTimer();
}

function startTimer() {
    let time = 7200; // 2 hours
    const timerEl = document.getElementById('alertTimer');
    const interval = setInterval(() => {
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = time % 60;
        timerEl.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        if (time-- <= 0) clearInterval(interval);
    }, 1000);
}

function initEmergencyTimer() {
    // Optional: could auto-show alert if stored in localStorage
}

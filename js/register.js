/* ═══════════════════════════════════════════════════════
   MURIOUS 20.0 — Registration Page Script
   Firebase + QR Payment Integration (Multi-Event)
   ═══════════════════════════════════════════════════════ */

// ── Firebase Config ──
const firebaseConfig = {
  apiKey: "AIzaSyDFt5T1GCewg1Ai5PF6l3YG8y26dIEZ7Ug",
  authDomain: "techfest-registration-eace0.firebaseapp.com",
  projectId: "techfest-registration-eace0",
  storageBucket: "techfest-registration-eace0.firebasestorage.app",
  messagingSenderId: "1094190297812",
  appId: "1:1094190297812:web:007376a2e08b4ff7fb4141",
  measurementId: "G-36RTV9Y354",
};

let db = null;

// ── Initialize Firebase ──
function initFirebase() {
  try {
    if (typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("✦ Firebase initialized");
    }
  } catch (e) {
    console.warn("Firebase init error:", e);
  }
}


// ── Generate Stars ──
function generateStars() {
  const container = document.getElementById("starfield");
  if (!container) return;

  const count = Math.floor((window.innerWidth * window.innerHeight) / 1500);

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star" + (Math.random() > 0.92 ? " large" : "");

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.setProperty("--duration", 2 + Math.random() * 5 + "s");
    star.style.setProperty("--delay", Math.random() * 5 + "s");

    container.appendChild(star);
  }
}


// ── Generate Particles ──
function generateParticles() {
  const body = document.body;

  for (let i = 0; i < 15; i++) {
    const p = document.createElement("div");

    p.className = "particle";

    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = "-10px";

    p.style.setProperty("--speed", 8 + Math.random() * 16 + "s");
    p.style.setProperty("--delay", Math.random() * 10 + "s");

    p.style.width = 2 + Math.random() * 4 + "px";
    p.style.height = p.style.width;

    body.appendChild(p);
  }
}


// ── DOM Elements ──
const regForm = document.getElementById("registerForm");
const eventGrid = document.getElementById("eventGrid");
const eventCheckboxes = document.querySelectorAll('input[name="events"]');

const feeDisplay = document.getElementById("feeDisplay");
const feeAmount = document.getElementById("feeAmount");
const feeCount = document.getElementById("feeCount");

const regLoading = document.getElementById("regLoading");
const registerBtn = document.getElementById("registerBtn");

const participationType = document.getElementById("participationType");
const teamSection = document.getElementById("teamSection");

// Payment step elements
const regFormCard = document.getElementById("regFormCard");
const paymentCard = document.getElementById("paymentCard");
const successCard = document.getElementById("successCard");
const transactionForm = document.getElementById("transactionForm");
const paymentAmountDisplay = document.getElementById("paymentAmountDisplay");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const backToFormBtn = document.getElementById("backToFormBtn");
const registerAnotherBtn = document.getElementById("registerAnotherBtn");
const paymentLoading = document.getElementById("paymentLoading");
const copyUpiBtn = document.getElementById("copyUpiBtn");
const successDetails = document.getElementById("successDetails");

// Store form data between steps
let pendingRegistration = null;


// ── Show / Hide Team Members ──
if (participationType) {
  participationType.addEventListener("change", function () {

    if (this.value === "team") {
      teamSection.style.display = "block";
    } else {
      teamSection.style.display = "none";
    }

    updateFeeDisplay();
  });
}


// ── Allow Multiple Events ──
eventCheckboxes.forEach((cb) => {
  cb.addEventListener("change", function () {
    updateFeeDisplay();
  });
});


// ── Get Team Members ──
function getTeamMembers() {

  const members = [];

  for (let i = 1; i <= 4; i++) {

    const name = document.getElementById(`member${i}Name`);
    const roll = document.getElementById(`member${i}Roll`);
    const phone = document.getElementById(`member${i}Phone`);

    if (name && name.value.trim()) {

      members.push({
        name: name.value.trim(),
        roll: roll ? roll.value.trim() : "",
        phone: phone ? phone.value.trim() : ""
      });

    }
  }

  return members;
}


// ── Get selected events ──
function getSelectedEvents() {

  const selected = [];

  eventCheckboxes.forEach((cb) => {

    if (cb.checked) {

      selected.push({
        name: cb.value,
        fee: parseInt(cb.getAttribute("data-fee")),
      });

    }

  });

  return selected;
}


// ── Calculate and display total fee ──
function updateFeeDisplay() {

  const selected = getSelectedEvents();

  let totalFee = 0;

  const teamMembers = getTeamMembers();

  const teamSize =
    participationType && participationType.value === "team"
      ? 1 + teamMembers.length
      : 1;

  selected.forEach((e) => {

    if (e.name === "HACKATHON") {
      totalFee += 80 * teamSize;
    } else {
      totalFee += e.fee;
    }

  });

  const count = selected.length;

  if (count > 0) {

    feeAmount.textContent = "₹" + totalFee;

    feeCount.textContent =
      count + (count === 1 ? " event selected" : " events selected");

    feeDisplay.style.display = "flex";

  } else {

    feeDisplay.style.display = "none";

  }

  return { totalFee, count, events: selected };
}


// ── Clear invalid on input ──
document.querySelectorAll(".form-group input").forEach((inp) => {

  inp.addEventListener("input", () => {

    inp.classList.remove("invalid");

    updateFeeDisplay();

  });

});


// ── Helper Functions ──
function showLoading(overlay, show) {
  if (overlay) overlay.classList.toggle("active", show);
}

function showToast(type, title, message) {
  // Remove existing toasts
  const existing = document.querySelectorAll('.reg-message');
  existing.forEach(el => el.remove());

  const toast = document.createElement('div');
  toast.className = `reg-message reg-message--${type}`;
  toast.innerHTML = `
    <span class="reg-msg-icon">${type === 'success' ? '✓' : '✗'}</span>
    <div>
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  // Auto dismiss
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

function showErrorMsg(msg) {
  showToast('error', 'Error', msg);
}

function showSuccessMsg(msg) {
  showToast('success', 'Success', msg || 'Registration complete!');
}


// ── Step Navigation ──
function showStep(step) {
  // Hide all cards
  regFormCard.style.display = 'none';
  paymentCard.style.display = 'none';
  successCard.style.display = 'none';

  // Update step indicators
  document.querySelectorAll('.step-dot').forEach(dot => {
    const dotStep = parseInt(dot.getAttribute('data-step'));
    dot.classList.remove('active', 'completed');
    if (dotStep < step) dot.classList.add('completed');
    if (dotStep === step) dot.classList.add('active');
  });

  // Show the right card
  if (step === 1) {
    regFormCard.style.display = 'block';
  } else if (step === 2) {
    paymentCard.style.display = 'block';
  } else if (step === 3) {
    successCard.style.display = 'block';
  }

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ── Copy UPI ID ──
if (copyUpiBtn) {
  copyUpiBtn.addEventListener('click', function () {
    navigator.clipboard.writeText('vardaandwivedi8@oksbi').then(() => {
      showToast('success', 'Copied!', 'UPI ID copied to clipboard');
    }).catch(() => {
      // Fallback
      const temp = document.createElement('textarea');
      temp.value = 'vardaandwivedi8@oksbi';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast('success', 'Copied!', 'UPI ID copied to clipboard');
    });
  });
}


// ── Form Submission (Step 1 → Step 2) ──
if (regForm) {

  regForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const college = document.getElementById("regCollege").value.trim();

    const participation = participationType ? participationType.value : "single";

    const teamMembers = getTeamMembers();

    const { totalFee, count, events: selectedEvents } = updateFeeDisplay();

    /* MAIN FORM VALIDATION */
    let valid = true;

    const nameField = document.getElementById("regName");
    const emailField = document.getElementById("regEmail");
    const phoneField = document.getElementById("regPhone");
    const collegeField = document.getElementById("regCollege");

    /* reset previous errors */
    [nameField, emailField, phoneField, collegeField].forEach(f => {
      f.classList.remove("invalid");
    });

    /* check empty */
    if (!name) {
      nameField.classList.add("invalid");
      valid = false;
    }

    if (!email) {
      emailField.classList.add("invalid");
      valid = false;
    }

    if (!phone) {
      phoneField.classList.add("invalid");
      valid = false;
    }

    if (!college) {
      collegeField.classList.add("invalid");
      valid = false;
    }

    /* email format */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      emailField.classList.add("invalid");
      showErrorMsg("Please enter a valid email.");
      return;
    }

    /* phone format */
    if (phone && !/^\d{10}$/.test(phone)) {
      phoneField.classList.add("invalid");
      showErrorMsg("Phone number must be 10 digits.");
      return;
    }

    if (!valid) {
      showErrorMsg("Please fill all required fields.");
      return;
    }


    /* ── TEAM MEMBER VALIDATION ── */

    for (let i = 1; i <= 4; i++) {

      const nameField = document.getElementById(`member${i}Name`);
      const rollField = document.getElementById(`member${i}Roll`);
      const phoneField = document.getElementById(`member${i}Phone`);

      const nameVal = nameField ? nameField.value.trim() : "";
      const rollVal = rollField ? rollField.value.trim() : "";
      const phoneVal = phoneField ? phoneField.value.trim() : "";

      if (nameVal || rollVal || phoneVal) {

        if (!nameVal || !rollVal || !phoneVal) {

          showErrorMsg(`Please complete all fields for Member ${i} or leave them empty.`);

          if (nameField) nameField.classList.add("invalid");
          if (rollField) rollField.classList.add("invalid");
          if (phoneField) phoneField.classList.add("invalid");

          return;
        }

        if (!/^\d{10}$/.test(phoneVal)) {

          phoneField.classList.add("invalid");

          showErrorMsg(`Member ${i} phone must be a 10 digit number.`);

          return;
        }

      }

    }


    if (count === 0) {
      showErrorMsg("Please select at least one event.");
      return;
    }

    // Store pending registration data
    const eventNames = selectedEvents.map((e) => e.name).join(", ");

    pendingRegistration = {
      name,
      email,
      phone,
      college,
      participationType: participation,
      teamMembers,
      events: selectedEvents.map(ev => ({ name: ev.name, fee: ev.fee })),
      totalPaid: totalFee,
      eventsInOrder: eventNames,
    };

    // Update payment amount display
    if (paymentAmountDisplay) {
      paymentAmountDisplay.textContent = "₹" + totalFee;
    }

    // Move step indicators to payment card
    const stepIndicators = document.querySelector('.step-indicators');
    if (stepIndicators) {
      paymentCard.insertBefore(stepIndicators, paymentCard.firstChild);
    }

    // Navigate to payment step
    showStep(2);

  });

}


// ── Transaction Form Submission (Step 2 → Step 3) ──
if (transactionForm) {

  transactionForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const transactionId = document.getElementById("transactionId").value.trim();

    if (!transactionId) {
      document.getElementById("transactionId").classList.add("invalid");
      showErrorMsg("Please enter your transaction ID.");
      return;
    }

    if (transactionId.length < 4) {
      document.getElementById("transactionId").classList.add("invalid");
      showErrorMsg("Please enter a valid transaction ID.");
      return;
    }

    showLoading(paymentLoading, true);

    try {
      // Save to Firebase
      if (db && pendingRegistration) {
        await db.collection("registrations").add({
          ...pendingRegistration,
          transactionId: transactionId,
          paymentMethod: "UPI",
          paymentStatus: "pending_verification",
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      showLoading(paymentLoading, false);

      // Show success details
      if (successDetails && pendingRegistration) {
        successDetails.innerHTML = `
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">${pendingRegistration.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Events</span>
            <span class="detail-value">${pendingRegistration.eventsInOrder}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">₹${pendingRegistration.totalPaid}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction ID</span>
            <span class="detail-value">${transactionId}</span>
          </div>
        `;
      }

      // Move step indicators to success card
      const stepIndicators = document.querySelector('.step-indicators');
      if (stepIndicators) {
        successCard.insertBefore(stepIndicators, successCard.firstChild);
      }

      showStep(3);
      showSuccessMsg("Registration saved successfully!");

    } catch (err) {
      console.error("Firestore save error:", err);
      showLoading(paymentLoading, false);
      showErrorMsg("Failed to save registration. Please try again.");
    }

  });

}


// ── Back to Form Button ──
if (backToFormBtn) {
  backToFormBtn.addEventListener('click', function () {
    // Move step indicators back
    const stepIndicators = document.querySelector('.step-indicators');
    if (stepIndicators) {
      regFormCard.insertBefore(stepIndicators, regFormCard.querySelector('.reg-loading-overlay').nextSibling);
    }
    showStep(1);
  });
}


// ── Register Another Button ──
if (registerAnotherBtn) {
  registerAnotherBtn.addEventListener('click', function () {
    // Reset form
    regForm.reset();
    eventCheckboxes.forEach((cb) => (cb.checked = false));
    feeDisplay.style.display = "none";
    teamSection.style.display = "none";
    document.getElementById("transactionId").value = "";
    pendingRegistration = null;

    // Move step indicators back
    const stepIndicators = document.querySelector('.step-indicators');
    if (stepIndicators) {
      regFormCard.insertBefore(stepIndicators, regFormCard.querySelector('.reg-loading-overlay').nextSibling);
    }

    showStep(1);
  });
}


// ── Init ──
document.addEventListener("DOMContentLoaded", () => {

  initFirebase();
  generateStars();
  generateParticles();

});
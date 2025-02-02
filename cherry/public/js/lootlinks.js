const lootlinks = [
  "https://lootdest.org/s?4iIaIFkH",
  "https://loot-link.com/s?tiWbwiUA",
  "https://lootdest.org/s?tLoCu36G",
  "https://lootdest.org/s?Rn9ScbR2",
  "https://lootdest.org/s?ADzl8Jk3",
  "https://loot-link.com/s?M2oo5P4j",
  "https://lootdest.org/s?a7Mm0Xjs"
];

let currentStep = 1;
let completedLinks = new Set();

function checkLootlinks() {
  // Update the link count display
  document.getElementById('linkCount').textContent = completedLinks.size;
}

function startVerification(step) {
  if (step < 1 || step > 3) {
    alert('Invalid step number');
    return;
  }

  // Set verification started flag
  document.cookie = 'verification_started=true; path=/';
  localStorage.setItem('verificationStartTime', Date.now().toString());
  
  // Get a random link that hasn't been used yet
  const availableLinks = lootlinks.filter(link => !completedLinks.has(link));
  if (availableLinks.length === 0) {
    alert('No more links available');
    return;
  }
  
  const randomLink = availableLinks[Math.floor(Math.random() * availableLinks.length)];
  completedLinks.add(randomLink);
  
  // Update UI
  document.getElementById('linkCount').textContent = completedLinks.size;
  
  // Open the link
  window.open(randomLink, '_blank');
  
  // Store current progress
  localStorage.setItem('verifyProgress', completedLinks.size.toString());
}

function isVerificationComplete() {
  return completedLinks.size >= 3;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load saved progress
  const savedProgress = localStorage.getItem('verifyProgress');
  if (savedProgress) {
    currentStep = parseInt(savedProgress) + 1;
  }
  
  // Update UI
  const stepBtn = document.querySelector('button[onclick^="startVerification"]');
  if (stepBtn) {
    stepBtn.textContent = `Start Step ${currentStep}`;
  }
  
  checkLootlinks();
});

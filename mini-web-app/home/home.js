import { initializeWebSocket } from '/mini-web-app/websocket.js'; 

// === Initialize user data ===
let userId = null;
let username = null;
let userBalance = 0; // Initialize user balance
const videoWatchStatus = { video1: false, video2: false, video3: false };

// === Access to telegram user info ===
// Wait for the DOM to load before manipulating elements
// Ensures everything runs after the page is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready();

  const user = tg.initDataUnsafe.user;
  userId = user?.id;
  username = user?.username;

  console.log('User ID:', userId, 'Username:', username);

  const welcomeEl = document.getElementById('welcome-message');
  if (welcomeEl && username) {
    welcomeEl.innerText = `Welcome ${username}!`;
  }

  // === Wallet balance element ====
  const walletBalanceElement = document.querySelector('.balance .BTTC');

  // Function to update the user's balance
  async function updateWalletBalance(amount) {
    userBalance += amount;
    if (walletBalanceElement) {
      walletBalanceElement.textContent = `${userBalance} BTTC`;
    }

    // === Send the updated balance (/wallet-update) to Express server ====
    try {
      const res = await fetch('/wallet-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      });
      const data = await res.json();
      console.log('Wallet updated on server:', data);
    } catch (err) {
      console.error('Failed to update wallet on server', err);
    }
  }
}); 

  // === Video reward logic ===
  const videoButtons = document.querySelectorAll('.video button');

  // Video urls
  const videoUrls = [
    'youtube://1fO37crxJMY?si=BEO-UyO4bPJEA4sA',
    'youtube://euOlwdnO8KA?si=HEZQ1vwdD5Tx-jcc',
    'youtube://azxTB53RkRY'
  ];

// Video keys matching backend
const videoKeys = ['video1', 'video2', 'video3'];
const REWARD_AMOUNT = 1000;
const COOLDOWN_HOURS = 24; // hours
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Initialize countdown intervals (to clear later if needed)
const countdownIntervals = {};

// === Video button action ===
// On page load, check if the user has already watched the videos
videoButtons.forEach((button, index) => {
  const videoKey = videoKeys[index];
  const status  = videoWatchStatus[videoKey]; // { watched: true, lastWatchedAt: timestamp }

  // Button logic on load
  if (status?.watched && status?.lastWatchedAt) {
    const timeElapsed = Date.now() - status.lastWatchedAt;
    if (timeElapsed < COOLDOWN_MS) {
      const timeLeft = COOLDOWN_MS - timeElapsed;
      disableButtonWithCountdown(button, videoKey, timeLeft);
    } else {
      // Cooldown expired, reset
      resetVideoStatus(videoKey, button);
    }
  }

  // Disabled button if already watched
  if (videoWatchStatus[videoKey]) {
    updateButton(button, true);
  } 

  button.addEventListener('click', () => {
    // Prevent dobule clicks
    if (button.disabled) return;

    // Show confirmation popup before opening YouTube
    showConfirmPopup('📺 Watch the full video for at least 60 seconds to earn +1000 BTTC. Continue?', () => {
      
      // If user confirms, proceed with the action
      // Start timer
      const rewardTimer = setTimeout(() => {
        const now = Date.now();
        // Only reward if not already watched
        if (!videoWatchStatus[videoKey]?.watched) {
          updateWalletBalance(REWARD_AMOUNT); // Update wallet balance
        showPopup('🎉 +${REWARD_AMOUNT} BTTC rewarded for watching!'); 
        /*updateButton(button, true); // Update button to "Done" */

        // Mark as watched + timestamp
        videoWatchStatus[videoKey] = {
          watched: true,
          lastWatchedAt: now
        };

        // Save updated status to server
        saveUserData(videoWatchStatus);

        // Disable with 24h countdown
        disableButtonWithCountdown(button, videoKey, COOLDOWN_MS);
        }
      }, 60000); // 60 seconds timer

      // Open YouTube App
      window.location.href = videoUrls[index];

      // On return, disbable button visually
      document.addEventListener('focus', () => {
        /*updateButton(button, true);*/
        // Optional: Ensure they still get reward if focus happens early
        clearTimeout(rewardTimer); 
      }, { once: true });
    });
  });
});

// === Function to disable the button and start countdown ===
// This function is called when the user has watched the video
function disableButtonWithCountdown(button, videoKey, timeLeftMs) {
  button.disabled = true;
  updateButtonCountdown(button, timeLeftMs); // Start countdown

  countdownIntervals[videoKey] = setInterval(() => {
    timeLeftMs -= 1000; // Decrease by 1 second
    if (timeLeftMs <= 0) {
      clearInterval(countdownIntervals[videoKey]);
      resetVideoStatus(videoKey, button); // Reset status and button
    } else {
      updateButtonCountdown(button, timeLeftMs); // Update countdown
    }
  }, 1000); // Update every second
} 

// Format countdown and set text
function updateButtonCountdown(button, timeLeftMs) {
  const hours = String(Math.floor(timeLeftMs / (1000 * 60 * 60))).padStart(2, '0');
  const mins = String(Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
  const secs = String(Math.floor((timeLeftMs % (1000 * 60)) / 1000)).padStart(2, '0');
  button.textContent = `Next in ${hours}:${mins}:${secs}`;
  button.style.backgroundColor = '#640D0F';
  button.style.color = '#FEE9E9';
}

// Re-enable button + clear status
function resetVideoStatus(videoKey, button) {
  videoWatchStatus[videoKey] = { watched: false, lastWatchedAt: null };
  button.disabled = false;
  button.textContent = 'Watch & Earn';
  button.style.backgroundColor = '';
  button.style.color = '';

  saveUserData(videoWatchStatus);
}

// === Save updated watch status to server ===
async function saveUserData(videoWatchStatus) {
  try {
    await fetch('/save-user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, videoWatchStatus })
    });
    console.log('User watch status saved to server');
  } catch (err) {
    console.error('Failed to save user data', err);
  }
}


async function fetchActiveVideos() {
  try {
    const res = await fetch('https://vast-caverns-06591-d6f9772903a1.herokuapp.com/api/videos/get-active-videos');
    const data = await res.json();
    activeVideos = {};
    data.forEach(video => {
      activeVideos[video.videoId] = { url: video.url, expiresAt: new Date(video.expiresAt) };
    });
    console.log('Active videos:', activeVideos);
  } catch (err) {
    console.error('Failed to fetch active videos', err);
  }
}



/* function updateButton(button, watched) {
  if (watched) {
    button.textContent = 'Done';
    button.style.backgroundColor = '#640D0F';
    button.style.color = '#FEE9E9';
    button.disabled = true;
  }
} */

// Simple toast popup
function showPopup(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.left = '50%';
  popup.style.transform = 'translateX(-50%)';
  popup.style.background = '#333';
  popup.style.color = '#fff';
  popup.style.padding = '12px 20px';
  popup.style.borderRadius = '8px';
  popup.style.zIndex = 1000;
  popup.style.opacity = 0;
  popup.style.transition = 'opacity 0.3s';

  document.body.appendChild(popup);

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = 1;
  });

  // Remove after 3s
  setTimeout(() => {
    popup.style.opacity = 0;
    setTimeout(() => document.body.removeChild(popup), 300);
  }, 3000);
}

// Confirm popup (pre-action)
function showConfirmPopup(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  const box = document.createElement('div');
  box.style.background = '#fff';
  box.style.padding = '20px';
  box.style.borderRadius = '10px';
  box.style.maxWidth = '80%';
  box.style.textAlign = 'center';

  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.marginBottom = '15px';

  const btnWrap = document.createElement('div');

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.marginRight = '10px';
  cancelBtn.style.padding = '8px 14px';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.border = 'none';
  cancelBtn.style.background = '#ddd';
  cancelBtn.onclick = () => document.body.removeChild(overlay);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Watch Now';
  confirmBtn.style.padding = '8px 14px';
  confirmBtn.style.borderRadius = '6px';
  confirmBtn.style.border = 'none';
  confirmBtn.style.background = '#640D0F';
  confirmBtn.style.color = '#fff';
  confirmBtn.onclick = () => {
    document.body.removeChild(overlay);
    onConfirm();
  };

  btnWrap.appendChild(cancelBtn);
  btnWrap.appendChild(confirmBtn);
  box.appendChild(msg);
  box.appendChild(btnWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}



// === Load user data from server
fetch('/get-user-data')
.then(res => res.json())
.then(data => {
  Object.assign(videoWatchStatus, data.videoWatchStatus);
  userBalance = data.walletBalance;
  if (walletBalanceElement) {
    walletBalanceElement.textContent = `${userBalance} BTTC`;
  }
    
// === Check if the user has watched the videos and update the buttons accordingly ===
// Update buttons for watched videos
Object.keys(videoWatchStatus).forEach((video, idx) => {
  if (videoWatchStatus[video]) {
      updateButton(videoButtons[idx], true);
    }
  });
})
.catch(console.error);

  // Handle server push wallet updates
  socket.onmessage = (event) => {
    try {
      const userData = JSON.parse(event.data);
      const amount = userData.amount;
      userBalance = amount;
      if (walletBalanceElement) {
        walletBalanceElement.textContent = `${userBalance} BTTC`;
      }
    } catch (error) {
      console.error(error);
    }
  };

/*
  // === NAVIGATION ===z
  const walletButton = document.querySelector('.wallet'); // Get the wallet button
  const taskButton = document.querySelector('.task'); // Get the task button

  // Add an event listener to the home and taks buttons
  if (walletButton) {
    walletButton.addEventListener('click', () => navigateTo('/mini-web-app/wallet/wallet.html'));
  }
  if (taskButton) {
    taskButton.addEventListener('click', () => navigateTo('/mini-web-app/task/task.html'));
  }

  // Navigation transition
  function navigateTo(url) {
    document.body.style.opacity = 0;
    setTimeout(() => { window.location.href = url; }, 300);
  }
*/

// NAVIGATION
// Go to wallet page
const walletButton = document.querySelector('.wallet');

// Add an event listener to the home button
walletButton.addEventListener('click', () => {
  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the wallet page after the transition
  setTimeout(() => {
    window.location.href = '/mini-web-app/wallet/wallet.html';
  }, 300); // Match the transition duration
});


// Go to task page
const taskButton = document.querySelector('.task');

// Add an event listener to the task button
taskButton.addEventListener('click', () => {
  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the task page after the transition
  setTimeout(() => {
    window.location.href = '/mini-web-app/wallet/task.html';
  }, 300); // Match the transition duration
});


  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  


/*
// Function to open the video popup
function openVideoPopup(videoUrl) {
  const popup = window.open(videoUrl, 'video_popup', 'width=800,height=600');
  popup.focus();

  // Detext when the user has watched the video
  popup.onclose = function() {
    // Update the user's wallet balance with the reward
    updateWalletBalance(1000);
  };
} 
*/
const socket = new WebSocket('wss://vast-caverns-06591-d6f9772903a1.herokuapp.com');

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
  

  // === Video reward logic ===
  const videoButtons = document.querySelectorAll('.video button');

  // Video urls
  const videoUrls = [
    'https://youtu.be/1fO37crxJMY?si=BEO-UyO4bPJEA4sA',
    'https://youtu.be/euOlwdnO8KA?si=HEZQ1vwdD5Tx-jcc',
    'https://youtu.be/azxTB53RkRY'
  ];

  // Video button action
  videoButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      // Open the YouTube video in the YouTube app
      window.open(videoUrls[index], '_blank');

      // Timer
      const timeout = setTimeout(() => {
        updateWalletBalance(1000);
      }, 60000); // 60 seconds

      document.addEventListener('focus', () => {
        updateButton(button, true);
        // Optional: don't clear timeout so they still get reward
        /*clearTimeout(timeout); */
      }, { once: true });
    });
  });

  // Function to update the button text and color
  function updateButton(button, watched) {
    if (watched) {
        button.textContent = 'Done';
      button.style.backgroundColor = '#640D0F';
      button.style.color = '#FEE9E9';
      button.disabled = true;
    }
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


  // === NAVIGATION ===
  const walletButton = document.querySelector('.wallet'); // Get the wallet button
  const taskButton = document.querySelector('.task'); // Get the task button

  // Add an event listener to the home and taks buttons
  if (walletButton) {
    walletButton.addEventListener('click', () => navigateTo('../wallet/wallet.html'));
  }
  if (taskButton) {
    taskButton.addEventListener('click', () => navigateTo('../task/task.html'));
  }

  // Navigation transition
  function navigateTo(url) {
    document.body.style.opacity = 0;
    setTimeout(() => { window.location.href = url; }, 300);
  }

  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the home page after the transition
  setTimeout(() => {
    window.location.href = '../wallet/wallet.html';
  }, 300); // Match the transition duration
});



// Function to open the video popup
/*function openVideoPopup(videoUrl) {
  const popup = window.open(videoUrl, 'video_popup', 'width=800,height=600');
  popup.focus();

  // Detext when the user has watched the video
  popup.onclose = function() {
    // Update the user's wallet balance with the reward
    updateWalletBalance(1000);
  };
} */
const socket = new WebSocket('ws://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com');

// Get the video buttons and wallet balance element
const videoButtons = document.querySelectorAll('.video button');
const walletBalanceElement = document.querySelector('.balance .BTTC');

// Initialize an object to store the video watch status
const videoWatchStatus = {
  video1: false,
  video2: false,
  video3: false,
};

// Initialize the user's balance
let userBalance = 0;

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


// Function to update the user's balance
function updateUserBalance(amount) {
  userBalance += amount;
  walletBalanceElement.textContent = `${userBalance} BTTC`;

  // Send the updated balance to the server
  sendUserBalanceUpdate();
}

// Function to send the user's balance update to the server
function updateWalletBalance(amount) {
  userBalance += amount;
  walletBalanceElement.textContent = `${userBalance} BTTC`;

  // Send the updated balance to the server
  const userId = 'USER_ID_HERE'; // Replace with the actual user ID
  socket.send(JSON.stringify({ userId, amount }));
}

// Add event listeners to the video buttons
videoButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const videoUrls = [
      'https://youtu.be/1fO37crxJMY?si=BEO-UyO4bPJEA4sA',
      'https://youtu.be/euOlwdnO8KA?si=HEZQ1vwdD5Tx-jcc',
      'https://youtu.be/azxTB53RkRY'
    ];

    // Open the YouTube video in the YouTube app
    window.open(videoUrls[index], '_blank');

    // Set a timer to check if the user has returned to your web app
    let videoWatchTimeout = setTimeout(() => {
      // Update the wallet balance
      updateWalletBalance(1000);

      // Update the button text and disable the button
      updateButton(button, true);
    }, 600000); // 60 seconds
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

// Check if the user has watched the videos and update the buttons accordingly
Object.keys(videoWatchStatus).forEach((video) => {
  if (videoWatchStatus[video]) {
    const button = document.querySelector(`#${video} button`);
    updateButton(button, true);
  }
});

// Fetch the user's data from the server when the page loads
fetch('/get-user-data')
  .then((response) => response.json())
  .then((data) => {
    videoWatchStatus.video1 = data.videoWatchStatus.video1;
    videoWatchStatus.video2 = data.videoWatchStatus.video2;
    videoWatchStatus.video3 = data.videoWatchStatus.video3;
    userBalance = data.walletBalance;
    walletBalanceElement.textContent = `${userBalance} BTTC`;

    // Update the button text and color based on the user's video watch status
    Object.keys(videoWatchStatus).forEach((video) => {
      if (videoWatchStatus[video]) {
        const button = document.querySelector(`#${video} button`);
        updateButton(button, true);
      }
    });
  })
  .catch((error) => console.error(error));

  // Handle incoming messages from the server
  socket.onmessage = (event) => {
    try {
      const userData = JSON.parse(event.data);
    const amount = userData.amount;

    // Update teh user's balance
    userBalance = amount;

    // Update the wallet balance element
    
    walletBalanceElement.textContent = `${userBalance} BTTC`;
    } catch (error) {
      console.error(error);
    }
};


// Add event listeners to the video links
/* const videoLinks = document.querySelectorAll('.video a');

videoLinks.forEach((link, index) => {
  link.addEventListener('click', () => {
    // Update the wallet balance
    updateWalletBalance(1000);

    // Update the button text and disable the button
    updateButton(link.querySelector('button'), true);
  });
}); */
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

// Function to update the button text and color
function updateButton(button, watched) {
  if (watched) {
    button.textContent = 'Done';
    button.style.backgroundColor = 'green';
    button.disabled = true;
  }
}

// Function to update the wallet balance
function updateWalletBalance(amount) {
  const currentBalance = parseFloat(walletBalanceElement.textContent.replace('BTTC', ''));
  
  // Update this line to correctly format the new balance
  walletBalanceElement.textContent = `${(currentBalance + amount).toFixed(2)} BTTC`;
}

// Add event listeners to the video buttons
videoButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    // Update the video watch status
    videoWatchStatus[`video${index + 1}`] = true;

    // Update the button text and color
    updateButton(button, true);

    // Update the wallet balance
    updateWalletBalance(1000);

    // Send the updated video watch status and wallet balance to the server
    fetch('/update-user-data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoWatchStatus,
        walletBalance: parseFloat(walletBalanceElement.textContent.replace('BTTC', ''))
      })
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  });
});

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
    walletBalanceElement.textContent = `${data.walletBalance} BTTC`;

    // Update the button text and color based on the user's video watch status
    Object.keys(videoWatchStatus).forEach((video) => {
      if (videoWatchStatus[video]) {
        const button = document.querySelector(`#${video} button`);
        updateButton(button, true);
      }
    });
  })
  .catch((error) => console.error(error));

  socket.onmessage = (event) => {
    const userData = JSON.parse(event.data);
    const amount = userData.amount;

    // Update the wallet balance element
    document.querySelector('.balance .BTTC').textContent = `${amount} BTTC`;
};

// Send user data to the server when the user's amount changes
function updateWalletBalance(amount) {
  const userId = 'USER_ID_HERE'; // Replace with the actual user ID
  socket.send(JSON.stringify({ userId, amount }));
}
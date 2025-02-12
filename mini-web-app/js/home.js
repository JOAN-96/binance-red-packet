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
  });
});

// Check if the user has watched the videos and update the buttons accordingly
Object.keys(videoWatchStatus).forEach((video) => {
  if (videoWatchStatus[video]) {
    const button = document.querySelector(`#${video} button`);
    updateButton(button, true);
  }
});

// NAVIGATION

// Get the home button
const homeButton = document.querySelector('.home');

// Add an event listener to the home button
homeButton.addEventListener('click', () => {
  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the home page after the transition
  setTimeout(() => {
    window.location.href = '../home/home.html';
  }, 300); // Match the transition duration
});


// Get the wallet button
const walletButton = document.querySelector('.wallet');

// Add an event listener to the task button
walletButton.addEventListener('click', () => {
  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the home page after the transition
  setTimeout(() => {
    window.location.href = '../wallet/wallet.html';
  }, 300); // Match the transition duration
});
// Check if the device is a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (!isMobile) {
  // If not a mobile device, display an error message
  document.body.innerHTML = '<h1>Error: This web app is only accessible on mobile devices.</h1>';
}

// Get all video buttons
const videoButtons = document.querySelectorAll('.video button');

// Add event listener to each video button
videoButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    // Get the video URL from the button's parent element
    const videoUrl = e.target.parentNode.getAttribute('href');

    // Create a new iframe element to play the video
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.width = '100%';
    iframe.height = '300';
    iframe.frameBorder = '0';
    iframe.allowFullScreen = true;

    // Replace the button with the iframe
    e.target.parentNode.innerHTML = ''; // Clear the parent element's content
    e.target.parentNode.appendChild(iframe); // Append the iframe

    // Update the button text to "Done" after the video has finished playing
    iframe.addEventListener('load', () => { // Use contentWindow instead of iframe
      iframe.contentWindow.addEventListener('ended', () => { // Add event listener for the video end
        const doneButton = document.createElement('button');
      doneButton.textContent = 'Done';
      doneButton.style.backgroundColor = 'green'; // Change the button color
      doneButton.style.color = 'white'; // Change the button text color
      iframe.parentNode.appendChild(doneButton);})
    });

    // Update the wallet balance
    const walletBalance = document.querySelector('.wallet-balance .balance');
    const currentBalance = parseInt(walletBalance.textContent.split(' ')[0]);
    const newBalance = currentBalance + 1000; // Reward amount
    walletBalance.textContent = `${newBalance} BTTC`;
  });
});
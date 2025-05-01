import { initializeWebSocket } from './websocket.js';

let userBalance = 0;

// Call WebSocket initialization and handle messages
initializeWebSocket((userData) => {
  const amount = userData.amount;
  userBalance = amount;
  const walletBalanceElement = document.querySelector('.wallet-balance');
  if (walletBalanceElement) {
    walletBalanceElement.textContent = `${userBalance} BTTC`;
  }
});



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


// Get the task button
const taskButton = document.querySelector('.task');

// Add an event listener to the task button
taskButton.addEventListener('click', () => {
  // Add the fade-out effect to the body
  document.body.style.opacity = 0;

  // Navigate to the home page after the transition
  setTimeout(() => {
    window.location.href = '../task/task.html';
  }, 300); // Match the transition duration
});



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
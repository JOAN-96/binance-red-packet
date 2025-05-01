// WebSocket Module for managing connections and pushing updates
const socket = new WebSocket('wss://vast-caverns-06591-d6f9772903a1.herokuapp.com');

// Function to handle WebSocket connection and messages
export const initializeWebSocket = (onMessageCallback) => {
  // When connected
  socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server');
  });

  // When a message is received
  socket.addEventListener('message', (event) => {
    try {
      const userData = JSON.parse(event.data);
      onMessageCallback(userData);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  // Handle errors
  socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err);
  });

  // Handle closing of the WebSocket connection
  socket.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });
};

// Function to send messages
export const sendMessage = (message) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket is not open. Unable to send message.');
  }
};

// Close WebSocket connection
export const closeConnection = () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
};
 
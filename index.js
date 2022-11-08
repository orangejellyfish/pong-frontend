const overlay = document.getElementById('overlay');
const buttonUp = document.getElementById('button-up');
const buttonDown = document.getElementById('button-down');
const socket = new Socket();

let gameInProgress = false;

// Receive messages from the server.
//
// TODO: know when a game starts and remove the overlay.
socket.onMessage((data) => {
});

// TODO: determine which paddle we should be controlling.
buttonUp.addEventListener('click', (e) => {
  e.preventDefault();

  if (gameInProgress) {
    socket.send({ event: 1, paddle: 1 });
  }
});

buttonDown.addEventListener('click', (e) => {
  e.preventDefault();

  if (gameInProgress) {
    socket.send({ event: -1, paddle: 1 });
  }
});

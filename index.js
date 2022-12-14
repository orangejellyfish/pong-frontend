const overlay = document.getElementById('overlay');
const controls = document.getElementById('controls');
const buttonUp = document.getElementById('button-up');
const buttonDown = document.getElementById('button-down');
const socket = new Socket();

let gameInProgress = false;
let assignedPaddle;

// Receive messages from the server.
//
// TODO: know when a game starts and remove the overlay.
socket.onMessage((data) => {
  if (data.event === 'GAME_END') {
    overlay.style.display = 'block';
    if(data.winner){
      alert(`The Winner is ${data.winner}`);
    }
    gameInProgress = false;
    return;
  }

  if (data.paddle !== undefined) {
    assignedPaddle = data.paddle;
    controls.classList.add(assignedPaddle === 0 ? 'left' : 'right');
  }

  if (!gameInProgress) {
    overlay.style.display = 'none';
    gameInProgress = true;
  }
});

// TODO: determine which paddle we should be controlling.
buttonUp.addEventListener('click', (e) => {
  e.preventDefault();

  if (gameInProgress) {
    socket.send({ event: 1, paddle: assignedPaddle });
  }
});

buttonDown.addEventListener('click', (e) => {
  e.preventDefault();

  if (gameInProgress) {
    socket.send({ event: -1, paddle: assignedPaddle });
  }
});

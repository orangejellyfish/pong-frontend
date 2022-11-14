const socket = new Socket({
  display: true,
});
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// Sounds.
const soundBounceLeft = new Audio('./sound-bounce-left.mp3');
const soundBounceRight = new Audio('./sound-bounce-right.mp3');

// Drawing constants.
const grid = 15;

const paddleHeight = grid * 5;
const paddleWidth = grid;

const ballWidth = grid;
const ballHeight = grid;

// Initial game state. Mirrors that of the server.
const state = {
  scores: [0, 0],
  paddles: [
    {
      x: grid * 2,
      y: canvas.height / 2 - paddleHeight / 2,
    },
    {
      x: canvas.width - grid * 3,
      y: canvas.height / 2 - paddleHeight / 2,
    },
  ],
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
  },
  players: [0,0],
};

// Receive game state from server.
socket.onMessage((data) => {
  state.paddles[0].y = data.state.paddles[0].y;
  state.paddles[1].y = data.state.paddles[1].y;
  state.ball.x = data.state.ball.x;
  state.ball.y = data.state.ball.y;
  state.scores = data.state.scores;
  state.players = data.state.players;

  // If a bounce off a paddle has happened we play the relevant sound.
  if (data.bounce === 0) {
    soundBounceLeft.play(); 
  } else if (data.bounce === 1) {
    soundBounceRight.play();
  }
});

// Convenience references into game state.
const { ball, paddles: [leftPaddle, rightPaddle] } = state;

// Drawing helpers.
function drawPaddles() {
  context.fillStyle = 'red';
  context.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  context.fillStyle = 'blue';
  context.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
}

function drawBall() {
  context.fillStyle = 'white';
  context.fillRect(ball.x, ball.y, ballWidth, ballHeight);
}

function drawWalls() {
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
}

function drawHalfwayLine() {
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

function drawScores() {
  context.font = '32px Courier New';
  context.fillText(state.scores[0], canvas.width / 2 - grid - context.measureText(state.scores[0]).width, grid * 4);
  context.fillText(state.scores[1], canvas.width / 2 + grid, grid * 4);
}

function drawPlayers() {
  context.font = '20px Courier New';
  context.fillStyle = 'red';
  context.fillText(`${state.players[0]} playing`,0, canvas.height - grid - context.measureText(`${state.players[0]} playing`).actualBoundingBoxDescent);
  context.fillStyle = 'blue';
  context.fillText(`${state.players[1]} playing`,canvas.width - context.measureText(`${state.players[1]} playing`).width, canvas.height - grid - context.measureText(`${state.players[1]} playing`).actualBoundingBoxDescent);
}

// Draw loop.
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  drawPaddles(); 
  drawBall();
  drawWalls();
  drawHalfwayLine();
  drawScores();
  drawPlayers();
}

// Start the game.
requestAnimationFrame(loop);

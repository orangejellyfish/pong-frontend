const socket = new Socket({
  display: true,
});
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

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
};

let previousState = JSON.parse(JSON.stringify(state));
let rendering;

// Receive game state from server.
socket.onMessage((data) => {
  previousState = JSON.parse(JSON.stringify(state));

  state.paddles[0].y = data.state.paddles[0].y;
  state.paddles[1].y = data.state.paddles[1].y;
  state.ball.x = data.state.ball.x;
  state.ball.y = data.state.ball.y;
  state.scores = data.state.scores;
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

function draw() {
  drawPaddles(); 
  drawBall();
  drawWalls();
  drawHalfwayLine();
  drawScores();
}

// Draw loop.
function loop() {
  // requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  const targetBallX = Math.ceil(ball.x);
  const targetBallY = Math.ceil(ball.y);
  let currentBallX = Math.ceil(previousState.ball.x);
  let currentBallY = Math.ceil(previousState.ball.y);

  if (currentBallX !== targetBallX && currentBallY !== targetBallY) {
    currentBallX = currentBallX + 0.1;    
    currentBallY = currentBallY + 0.1;    
  }

  draw();
  requestAnimationFrame(loop);
  rendering = false;
}

// Start the game.
requestAnimationFrame(loop);

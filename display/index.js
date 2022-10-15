const socket = new Socket({
  display: true,
});

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const elemPaddleLeft = document.getElementById('paddle-left');
const elemPaddleRight = document.getElementById('paddle-right');
const elemBall = document.getElementById('ball');
const elemScoreLeft = document.getElementById('score-left');
const elemScoreRight = document.getElementById('score-right');

let gameInProgress = false;
let tickSpeed = 0;
let currentPerfTime = 0;

// Sounds.
const soundBounceLeft = new Audio('./sound-bounce-left.m4a');
const soundBounceRight = new Audio('./sound-bounce-right.m4a');
const soundBounceScore = new Audio('./sound-score.m4a');
const leftWinner = new Audio('./sound-left-winner.m4a');
const rightWinner = new Audio('./sound-right-winner.m4a');
const drawWinner = new Audio('./sound-draw-winner.m4a');


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
    x: 0,
    y: 0,
  },
  players: [0,0],
};

function start() {
  elemPaddleRight.style.display = 'block';
  elemPaddleLeft.style.display = 'block';
  elemBall.style.display = 'block';
  gameInProgress = true;
  loop();
}

// Receive game state from server.
socket.onMessage((data) => {
  // Game is in play and a state event has happened.
  if(data.state){
    state.paddles[0].y = data.state.paddles[0].y;
    state.paddles[1].y = data.state.paddles[1].y;
    state.ball.x = data.state.ball.x;
    state.ball.y = data.state.ball.y;
    state.scores = data.state.scores;
    state.players = data.state.players;

    if(!gameInProgress){
      start();
    }
  }

  // If a bounce off a paddle has happened we play the relevant sound.
  if (data.bounce === 0) {
    soundBounceLeft.play(); 
  } else if (data.bounce === 1) {
    soundBounceRight.play();
  }

  if(data.score){
    soundBounceScore.play();
    elemBall.classList.add('resetting');
  } else {
    elemBall.classList.remove('resetting');
  }

  // Game Event has happened
  if(data.event){
    switch(data.event){
      case 'GAME_START':
        start();
      break;

      case 'GAME_END':
        gameInProgress = false;
        elemPaddleRight.style.display = 'none';
        elemPaddleLeft.style.display = 'none';
        elemBall.style.display = 'none';
        if(data.winner === 'Left Paddle'){
          leftWinner.play();
        }
        else if(data.winner === 'Right Paddle'){
          rightWinner.play();
        }
        else if(data.winner === 'Draw'){
          drawWinner.play();
        }
      break;
    }
  }

  // Calculate how quickly we are receiving messages.
  currentTickTime = ((performance.now() - currentPerfTime));
  tickSpeed =  Math.ceil(currentTickTime / 10) * 10
  currentPerfTime = performance.now();
});

// Convenience references into game state.
const { ball, paddles: [leftPaddle, rightPaddle] } = state;

// Drawing helpers.
function drawPaddles() {
  elemPaddleLeft.style.transform = `translate(${leftPaddle.x}px, ${leftPaddle.y}px)`;
  elemPaddleRight.style.transform = `translate(${rightPaddle.x}px, ${rightPaddle.y}px)`;
}

function drawBall() {
  elemBall.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
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
  context.font = '32px Courier New';
  context.fillStyle = 'red';
  context.fillText(`${state.players[0]} players`,0, canvas.height - grid - context.measureText(`${state.players[0]} players`).actualBoundingBoxDescent);
  context.fillStyle = 'blue';
  context.fillText(`${state.players[1]} players`,canvas.width - context.measureText(`${state.players[1]} players`).width, canvas.height - grid - context.measureText(`${state.players[1]} players`).actualBoundingBoxDescent);
}

function drawTickSpeed(){
  context.font = '20px Courier New';
  context.fillStyle = 'black';
  context.fillText(`MRR: ${tickSpeed}ms`, 0, grid * 1);
}

function drawMessage(message){
  context.font = '60px Courier New';
  context.fillStyle = 'white';
  context.fillText(message, canvas.width - context.measureText(message).width, canvas.height / 2 - context.measureText(message).actualBoundingBoxDescent);
}

// Draw loop.
function loop() {
  context.clearRect(0,0,canvas.width,canvas.height);

  if(gameInProgress){
    requestAnimationFrame(loop);

    drawPaddles(); 
    drawBall();
    drawWalls();
    drawHalfwayLine();
    drawScores();
    drawPlayers();
    drawTickSpeed();
  }else{
    drawMessage('Waiting for players');
  }
}

// Start the game.
requestAnimationFrame(loop);

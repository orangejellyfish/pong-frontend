const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;

const paddleHeight = grid * 5;
const paddleWidth = grid;
const maxPaddleY = canvas.height - grid - paddleHeight;

const ballWidth = grid;
const ballHeight = grid;

let paddleSpeed = 6;
let ballSpeed = 3;

// Game state.
const state = {
  scores: [0, 0],
  paddles: [
    // Left paddle. Start unmoving in the vertical centre of the canvas.
    {
      x: grid * 2,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0,
    },
    // Right paddle. Start unmoving in the vertical centre of the canvas.
    {
      x: canvas.width - grid * 3,
      y: canvas.height / 2 - paddleHeight / 2,
      dy: 0
    },
  ],
  // Start the ball in the middle of the canvas moving towards the top right.
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: -ballSpeed
  },
};

// Augment state with constant values for ease of referencing in calculations.
// This happens here because we expect the state object to be sent down to the
// client and the remote version does not need to include constant values.
state.paddles[0].width = paddleWidth;
state.paddles[1].width = paddleWidth;
state.paddles[0].height = paddleHeight;
state.paddles[1].height = paddleHeight;
state.ball.width = ballWidth;
state.ball.height = ballHeight;
state.ball.resetting = false;

// Convenience references into game state.
const { ball, paddles: [leftPaddle, rightPaddle] } = state;

// Check for collision between two objects using axis-aligned bounding box.
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

function movePaddles() {
  // Move paddles by their velocity.
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // Prevent paddles from going through walls.
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  } else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  } else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

}

function drawPaddles() {
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
}

function moveBall() {
  // Move ball by its velocity.
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Prevent ball from going through walls by changing its velocity to simulate
  // a bounce.
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  } else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // Reset ball if it goes past paddle (but only if we haven't already done so).
  if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // Award points.
    if (ball.x < 0) {
      state.scores[1] += 1;
    } else {
      state.scores[0] += 1;
    }

    // Give some time for the player to recover before launching the ball again.
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 1000);
  }

  // Check to see if ball collides with paddle. If so, change x velocity.
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // Move ball next to the paddle otherwise the collision will happen again
    // in the next frame.
    ball.x = leftPaddle.x + leftPaddle.width;
  } else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // Move ball next to the paddle otherwise the collision will happen again
    // in the next frame.
    ball.x = rightPaddle.x - ball.width;
  }
}

function drawBall() {
  context.fillRect(ball.x, ball.y, ball.width, ball.height);
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

// Game loop.
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  movePaddles();
  drawPaddles(); 

  moveBall();
  drawBall();

  drawWalls();
  drawHalfwayLine();
  drawScores();
}

// Listen to keyboard events to move the paddles.
document.addEventListener('keydown', function(e) {
  // Up/down arrow keys.
  if (e.which === 38) {
    rightPaddle.dy = -paddleSpeed;
  } else if (e.which === 40) {
    rightPaddle.dy = paddleSpeed;
  }

  // "W"/"A" keys.
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  } else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
});

// Listen to keyboard events to stop the paddles if key is released.
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
});

// Start the game.
requestAnimationFrame(loop);

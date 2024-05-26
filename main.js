document.querySelector("#start-button").addEventListener("click", function (e) {
  document.querySelector("#start-screen").style.display = "none";
  document.querySelector("#canvas-container").style.display = "flex";
  document.querySelector("#game-info").style.display = "flex";
});

let handpose;
let video;
let fruits = [];
let score = 0;
let maxScore = 5;
let timerSeconds = 60;
let timerInterval;
let timerElement;
let retryButton;
let gameEnded = false;

function setup() {
  const options = {
    flipHorizontal: true,
  };

  let canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");
  background(255);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose = ml5.handpose(video, options, modelReady);
  handpose.on("predict", gotHands);
  timerElement = select("#timer");
  startTimer();
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  for (let i = fruits.length - 1; i >= 0; i--) {
    let currentFruit = fruits[i];
    currentFruit.update();
    currentFruit.display();
    if (currentFruit.y > height) {
      fruits.splice(i, 1);
    }
  }

  if (!gameEnded) {
    timerElement.html(`Timer: ${timerSeconds}`);
  }

  let scoreElement = select("#score");
  scoreElement.html("");

  for (let i = 0; i < maxScore; i++) {
    let scoreCircle = createSpan().addClass("apple");
    if (i < score) {
      scoreCircle.addClass("filled");
    }
    scoreElement.child(scoreCircle);
  }

  if (!gameEnded && timerInterval) {
    if (frameCount % 20 === 0) {
      if (random(1) > 0.5) {
        fruits.push(new Appel());
      } else {
        fruits.push(new Peer());
      }
    }
  }
}

function modelReady() {
  console.log("Model ready!");
}

function gotHands(predictions) {
  if (!gameEnded && predictions.length > 0) {
    let hand = predictions[0].landmarks;
    let indexTip = hand[8];
    let mirroredX = width - indexTip[0];
    let y = indexTip[1];
    fill(0, 255, 0);
    ellipse(mirroredX, y, 10, 10);
    for (let i = fruits.length - 1; i >= 0; i--) {
      let currentFruit = fruits[i];
      let d = dist(mirroredX, y, currentFruit.x, currentFruit.y);
      if (d < 20) {
        if (currentFruit instanceof Appel) {
          score++;
        } else if (currentFruit instanceof Peer && score > 0) {
          score--;
        }
        fruits.splice(i, 1);
        break;
      }
    }
    if (score >= maxScore) {
      document.querySelector("#win-screen").style.display = "flex";
      fruits = [];
      gameEnded = true;
      clearInterval(timerInterval);
    }
  }
}

function startTimer() {
  let timer = timerSeconds;
  timerInterval = setInterval(() => {
    timer--;
    timerSeconds = timer;
    if (timer <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameEnded = true;
  fruits = [];
  retryButton = createButton("Probeer Opnieuw");
  retryButton.class("btn");
  retryButton.mousePressed(restartGame);
  textSize(24);
  fill(0);
  text(`Je score is: ${score}`, width / 2 - 50, height / 2 - 40);
}

function restartGame() {
  gameEnded = false;
  score = 0;
  clearInterval(timerInterval);
  retryButton.remove();
  startTimer();
}

class Appel {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.speed = random(2, 5);
  }
  update() {
    this.y += this.speed;
  }

  display() {
    fill(200, 0, 0);
    noStroke();
    ellipse(this.x + 2, this.y + 4, 20, 20);
    fill(255, 0, 0);
    ellipse(this.x, this.y, 20, 20);
    fill(0, 100, 0);
    rect(this.x - 2, this.y - 10, 4, 10, 2);
    fill(255, 200, 0);
    ellipse(this.x + 5, this.y - 5, 5, 5);
    ellipse(this.x - 3, this.y + 3, 4, 4);
  }
}

class Peer {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.speed = random(2, 5);
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(0, 200, 0);
    noStroke();
    ellipse(this.x + 2, this.y + 4, 20, 20);
    fill(0, 255, 0);
    ellipse(this.x, this.y, 20, 20);
    fill(100, 50, 0);
    rect(this.x - 2, this.y - 10, 4, 10, 2);
    fill(0, 150, 0);
    triangle(
      this.x + 2,
      this.y - 12,
      this.x - 4,
      this.y - 20,
      this.x + 8,
      this.y - 20
    );
  }
}

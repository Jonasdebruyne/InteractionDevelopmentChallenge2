document.querySelector("#start-button").addEventListener("click", function (e) {
  document.querySelector("#start-screen").style.display = "none";
  console.log("cee");
});

let handpose;
let video;
let fruits = [];
let score = 0;
let timerSeconds = 30; // 30 seconden timer
let timerInterval;
let timerElement;
let retryButton;
let gameEnded = false; // Variable to track if game ended

// Voeg een setup() functie toe om p5.js te initialiseren
function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("canvas-container"); // Toewijzen van het canvas aan de 'canvas-container' div
  background(255);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video capture element

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", gotHands);

  // Start de timer
  timerElement = select("#timer");
  startTimer();
}

// Voeg een draw() functie toe voor voortdurende weergave
function draw() {
  background(220);

  // Draw video feed on canvas
  image(video, 0, 0, width, height);

  // Draw falling fruit
  for (let i = fruits.length - 1; i >= 0; i--) {
    let currentFruit = fruits[i];
    currentFruit.update();
    currentFruit.display();
    if (currentFruit.y > height) {
      // If fruit reaches bottom of canvas, remove it
      fruits.splice(i, 1);
    }
  }

  // Update timer display
  if (!gameEnded) {
    timerElement.html(`Timer: ${timerSeconds}`);
  }

  // Update score display
  let scoreElement = select("#score");
  scoreElement.html(`Score: ${score}`);

  // Add new fruit at random intervals, but only if the game is still ongoing
  if (!gameEnded && timerInterval) {
    if (frameCount % 20 === 0) {
      // Add new fruit every 1/3 second (20 frames)
      // Randomly add either an apple or a pear
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
    let indexTip = hand[8]; // Tip of index finger

    // Check if the index finger tip is close to any fruit
    for (let i = fruits.length - 1; i >= 0; i--) {
      let currentFruit = fruits[i];
      let d = dist(indexTip[0], indexTip[1], currentFruit.x, currentFruit.y);
      if (d < 60) {
        // Assuming a distance threshold of 30 pixels
        // Increase or decrease score based on the fruit type
        if (currentFruit instanceof Appel) {
          score++;
        } else if (currentFruit instanceof Peer) {
          score--;
        }
        // Remove the fruit
        fruits.splice(i, 1);

        // Break the loop since we found the closest fruit
        break;
      }
    }
  }
}

function startTimer() {
  let timer = timerSeconds;
  timerInterval = setInterval(() => {
    timer--;
    timerSeconds = timer; // Update timerSeconds value
    if (timer <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameEnded = true; // Mark the game as ended

  // Verwijder alle vruchten
  fruits = [];

  // Toon de retry knop
  retryButton = createButton("Probeer Opnieuw");
  retryButton.position(width / 2 - 50, height / 2);
  retryButton.mousePressed(restartGame);

  // Toon de score
  textSize(24);
  fill(0);
  text(`Je score is: ${score}`, width / 2 - 50, height / 2 - 40);
}

function restartGame() {
  gameEnded = false; // Reset the game status

  // Reset de score
  score = 0;

  // Reset de timer
  clearInterval(timerInterval);

  // Verwijder de retry knop
  retryButton.remove();

  // Start een nieuwe timer
  startTimer();
}

class Appel {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.speed = random(2, 5); // Randomize falling speed
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(255, 0, 0); // Rode kleur voor appels
    ellipse(this.x, this.y, 20, 20); // Ga ervan uit dat appels cirkels zijn
  }
}

class Peer {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.speed = random(2, 5); // Randomize falling speed
  }

  update() {
    this.y += this.speed;
  }

  display() {
    fill(0, 255, 0); // Groene kleur voor peren
    ellipse(this.x, this.y, 20, 20); // Ga ervan uit dat peren cirkels zijn
  }
}

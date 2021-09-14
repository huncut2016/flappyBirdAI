let bird;
let pipes = [];
let birds = [];
let maxPipes = 6;
let pipesDistance = 600;
let holeSize = 380;
let score = 0;
let birdpopulation = 50;
let deadBirds = 0;
let mutationRate = .1;
let pipeVelocity = -6;
let generationCount = 1;
let gravity = 1.2;
let birdRad = 70;
let myFont;
let populationAccuracy = [];
let h = window.innerHeight;
let w = window.innerWidth / 2;

let birdImage;
function preload() {
    birdImage = loadImage('./leviatanBird.png');
    myFont = loadFont('./font.ttf');
}

let playingCanvas;
let plotCanvas;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight, WEBGL);
    
    playingCanvas = createGraphics(w, h, WEBGL);
    plotCanvas = createGraphics(w, h, WEBGL);
    plotCanvas.translate(-w/2,h/2,0);
    playingCanvas.translate(-w/2,-h/2,0);
    
    tf.setBackend("cpu");
    
    for(let i = 0; i < birdpopulation; i++) {
        birds.push (new Bird({
            x: birdRad,
            y: birdRad * 1.2,
            gravity: createVector(0, gravity),
            begin: Date.now(),
            r: birdRad
        }));
    }
    birds.forEach(bird => bird.createBrain(5, 1, 1));
    begin();
}

function begin (regenerates = false) {
    score = 0;
    deadBirds  = 0;

    if (regenerates) {
        generationCount ++;
        let bestBird = birds[0];
    
        for (let i = 1; i < birds.length; i++) {
            if(birds[i].valuate() > bestBird.valuate()) {
                bestBird = birds[i];
            }
        }

        populationAccuracy.push(bestBird.valuate());
        //populationAccuracy = SavitzkyGolay(populationAccuracy, 1, { windowSize: 5, derivative: 0 });

        let bestBirdModel = bestBird.copyModel();

        for (let i = 0; i < birds.length; i++) {
            birds[i].pos.y = birdRad * 1.2;
            birds[i].reset();
            birds[i].begin =  Date.now();
            if (birds[i] != bestBird) {
                birds[i].setModel(bestBirdModel);
                birds[i].mutate(mutationRate);
            }
        }
    }

    pipes = []
    for (let i = 1; i <= maxPipes; i++) {
        let bottom, top, topSize = random(100, h * 0.6);

        top = new Pipe({
            pos1: createVector(i*pipesDistance + 200, 0),
            pos2: createVector(100, topSize),
            vel: createVector(pipeVelocity, 0)
        })

        bottom = new Pipe({ 
            pos1: createVector(i*pipesDistance + 200, topSize + holeSize),
            pos2: createVector(100, h - topSize),
            vel: createVector(pipeVelocity, 0)
        })

        pipes.push([top, bottom]);
    }
}
  
function draw() {
    translate(-width/2,-height/2,0);
    //background(50);
    drawPlayingCanvas();
    drawplotCanvas();
    image(plotCanvas, w, 0);
    image(playingCanvas, 0, 0);
}

function drawplotCanvas () {
    //populationAccuracy
    plotCanvas.background(50);

    let maxPointCoordinate = Math.max(...populationAccuracy);

    plotCanvas.stroke(255, 0, 0);
    plotCanvas.strokeWeight(4);
    plotCanvas.noFill();
    plotCanvas.beginShape();
    for (let i = 0; i < populationAccuracy.length; i++) {
        let mapedHeight = map(populationAccuracy[i], 0, maxPointCoordinate, 0, h);
        let mapedWidth = w / populationAccuracy.length * (i);
        plotCanvas.vertex(mapedWidth,-mapedHeight);
    }
    plotCanvas.endShape();
}

function drawPlayingCanvas() {
    //playingCanvas.translate(-w/2,-h/2,0);
    
    playingCanvas.background(50);
    playingCanvas.textSize(32);
    playingCanvas.fill(255, 0, 0);
    playingCanvas.textFont(myFont);
    playingCanvas.textSize(50);
    playingCanvas.text(`IQ: ${200-generationCount*10 + score} -- score: ${score}`, 10, 60);
    
    if(deadBirds === birdpopulation) begin(true);
    
    for (let i = 0; i < pipes.length; i++) {
        let topSize = random(50, h * 0.6);
        
        if (pipes[i][0].dead()) {
            pipes[i][0].pos2.y =  topSize;
            pipes[i][0].pos1.x += maxPipes * pipesDistance;
            
            pipes[i][1].pos2.y = h - topSize;
            pipes[i][1].pos1.x += maxPipes * pipesDistance;
            pipes[i][1].pos1.y = topSize + holeSize;
            
            score += 1;
        }
        
        birds.forEach(bird => {
            if(bird.isDead) return;
            if(bird.collide(pipes[i][0]) || bird.collide(pipes[i][1])){
                bird.kill(Date.now());
                deadBirds ++;
            } 
            
        });
        
        pipes[i][0].update();
        pipes[i][0].draw();
        
        pipes[i][1].update();
        pipes[i][1].draw();
    }

    let nearestPipe = pipes[0];

    for(let i = 1; i < pipes.length; i++) {
        if (pipes[i][0].pos1.x < nearestPipe[0].pos1.x) {
            nearestPipe = pipes[i];
        }
    }
    fill(255, 0, 0, 60);
    birds.forEach(bird => {
        if(bird.isDead) return;
        bird.update();
        bird.draw();
        
        if (bird.wallCollide()){
            deadBirds ++;
            bird.kill(Date.now());
        }
        
        const inputs = [
            bird.pos.y,
            bird.vel.y,
            nearestPipe[0].pos2.y,
            nearestPipe[1].pos1.y,
            nearestPipe[0].pos1.x - bird.pos.x,
        ]

        bird.predict(inputs);
    })
}

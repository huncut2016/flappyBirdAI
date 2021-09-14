class Pipe {
    constructor ({pos1, pos2, vel}) {
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.vel = vel;
    }

    draw () {
        playingCanvas.noStroke();
        playingCanvas.fill(255);
        playingCanvas.rect(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y);
    }

    update () {
        this.pos1.add(this.vel);
    }

    dead () {
        return ((this.pos1.x + this.pos2.x) <= this.pos2.x -75)
    }
}
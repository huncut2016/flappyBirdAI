class Bird {
    constructor ({x, y, gravity, begin, r}) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 1);
        this.acc = createVector(0, 0);
        this.gravity = gravity;
        this.begin = begin;
        this.end = 0;
        this.isDead = false;
        this.r = r;
    }

    update () {
        this.vel.add(this.gravity);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    }

    draw () {
        playingCanvas.texture(birdImage);
        playingCanvas.noStroke();
        playingCanvas.circle(this.pos.x, this.pos.y, this.r * 2);
    }

    wallCollide () {
        return (this.pos.y >= h - this.r || this.pos.y <= this.r);
    }

    reset () {
        this.vel = createVector(0, 1);
        this.acc = createVector(0, 0);
        this.begin = 0;
        this.end = 0;
        this.isDead = false;
    }

    predict (inputTensor) {
        tf.tidy( () => {
            const inputs = tf.tensor2d(inputTensor, [1,5]);
            const predictedMove = this.model.predict(inputs).dataSync();
            
            if(predictedMove[0] >= .5) this.hopp();
        })
    }

    hopp () {
        this.vel.y = -19
    }

    kill (end) {
        this.end = end;
        this.isDead = true;
    }

    createBrain (a,b,c) {
        this.model = tf.sequential()

        const hidden = tf.layers.dense ({
            units: b,
            inputShape: [a],
            activation: "sigmoid"
        })
        this.model.add(hidden);

        const output = tf.layers.dense ({
            units: c,
            activation: "sigmoid"
        });
        this.model.add(output);
    }

    valuate () {
        return this.end - this.begin;
    }

    mutate (mutationRate) {
        tf.tidy( () => {
            const weights = this.model.getWeights();
            const mutatedWeights = [];

            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for (let j = 0; j < values.length; j++) {
                    if(random(1) < mutationRate) {
                        let w = values[j];
                        values[j] = w + randomGaussian();
                    }
                }

                let newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        })
    }

    copyModel () {
        return this.model.getWeights();
    }

    setModel (otherModel) {
        this.model.setWeights(otherModel);
    }

    collide (pipe) {
        let cx = this.pos.x,
            cy = this.pos.y,
            rad = this.r,
            rx = pipe.pos1.x,
            ry = pipe.pos1.y,
            rw = pipe.pos2.x,
            rh = pipe.pos2.y;

        let testX = cx;
        let testY = cy;
        
        if (cx < rx)         testX = rx;      // test left edge
        else if (cx > rx+rw) testX = rx+rw;   // right edge
        if (cy < ry)         testY = ry;      // top edge
        else if (cy > ry+rh) testY = ry+rh;   // bottom edge
        
        let d = dist(cx, cy, testX, testY);
        
        if (d <= rad) {
            return  true;
        }
        return false;
    
    }
}
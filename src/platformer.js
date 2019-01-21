var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed, x, y;

const Player = class {
    constructor({
        x, xAcc, xMaxVel,
        y, yAcc, yMaxVel,
        width, height,
        friction,
        jumpAcc,
    }) {

        this.x = x;
        this.xAcc = xAcc;
        this.xVel = 0;
        this.xMaxVel = xMaxVel;
        this.y = y;
        this.yAcc = yAcc;
        this.yMaxVel = yMaxVel;
        this.yVel = 0;
        this.friction = friction;
        this.jumpAcc = jumpAcc;

        this.el = this.createDomElement(width, height);
        this.draw = this.draw.bind(this);
    }

    update() {
        if (controller[up] && this.grounded) {
            this.yVel -= this.jumpAcc;
        }

        if (controller[down]) {
            this.yVel += this.yAcc;

        }

        if (controller[left]) {
            this.xVel -= this.xAcc;
        }

        if (controller[right]) {
            this.xVel += this.xAcc;
        }

        if (this.xVel) {
          this.xVel -= (this.xVel/Math.abs(this.xVel)) * this.friction;
        }

        // TERMINAL VELOCITY

        this.yVel += gravity;
        
        this.terminalVelocity();

        // X COLLISION
        if(this.collision(this.xTrajectory, this.y)) {
            while(!this.collision(
                Math.floor(this.x + 1 * this.xVelSign),
                this.y
            )) { this.x += 1 * this.xVelSign; }
            this.xVel = 0;
        }

        // Y COLLISION
        if(this.collision(this.x, this.yTrajectory)) {
            while(!this.collision(
                this.x,
                Math.floor(this.y + 1 * this.yVelSign)
            )) { this.y += 1 * this.yVelSign; }
            if (this.yVelSign === 1) { this.grounded = true; }
            this.yVel = 0;
        } else { this.grounded = false; }

        this.x = Math.floor(this.x + this.xVel);
        this.y = Math.floor(this.y + this.yVel);
    }

    draw() {
        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
    }

    get xVelSign() { return this.xVel/Math.abs(this.xVel); }

    get xTrajectory() { return Math.floor(this.x + this.xVel); }

    get yVelSign() { return this.yVel/Math.abs(this.yVel); }

    get yTrajectory() { return Math.floor(this.y + this.yVel); }

    collision(x, y) { return detectCollision(x, y, this.width, this.height); }

    terminalVelocity() {
        if (Math.abs(this.xVel) > this.xMaxVel) {
          this.xVel = this.xMaxVel * this.xVelSign;
        }

        if (Math.abs(this.yVel) > this.yMaxVel) {
          this.yVel = this.yMaxVel * this.yVelSign;
        }
    }

    createDomElement(width, height) {
        const el = document.createElement('DIV');
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.position = 'absolute';
        el.style.border = '1px solid black';
        el.backgroundColor = '#831';
        el.style.boxSizing = 'border-box';
        el.style.top = this.y;
        el.style.left = this.x;
        window.document.body.appendChild(el);

        return el;
    }

    get width() {
        return this.el.offsetWidth;
    }

    get height() {
        return this.el.offsetHeight;
    }
}

var gravity = .5;

var controller = {};

var collision = [];

var up = 'ArrowUp';
var left = 'ArrowLeft';
var right = 'ArrowRight';
var down = 'ArrowDown';

// initialize the timer variables and start the animation
function init(fps) {
    const player = new Player({
        x: 50,
        y: 0,
        height: 32,
        width: 32,
        el: null,
        xAcc: 1,
        yAcc: 1,
        xVel: 0,
        xMaxVel: 5,
        yVel: 0,
        yMaxVel: 18,
        friction: .5,
        grounded: false,
        jumpAcc: 12,
    });


    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    getCollisionMap();
    // console.log(collision);
    update(player);
}

// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

function update(player) {
    requestAnimationFrame(() => update(player));
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        player.update();

        draw(player);
    }
}

function draw(player) {
    player.draw();
}

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (!controller[keyName]) {
    controller[keyName] = true;
    //console.log(keyName);
  }

}, false);

document.addEventListener('keyup', (event) => {
  const keyName = event.key;
  controller[keyName] = false;
}, false);

function getProperties(el) {
    var height = el.offsetHeight;
    var width = el.offsetWidth;
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        y: _y,
        x: _x,
        height: height,
        width: width,
    };
}

function getCollisionMap() {
    var platforms = document.getElementsByClassName('platform');

    for (var key in platforms) {
        if (!platforms.hasOwnProperty(key)) continue;

        var platform = platforms[key];

        platform.style.border = '1px solid black';
        var properties = getProperties(platform);
        collision.push(properties);
    }

}

function detectCollision(x, y, width, height) {
    collided = false;
    collision.forEach((platform) => {
        if (
            x < platform.x + platform.width &&
            x + width > platform.x &&
            y < platform.y + platform.height &&
            y + height > platform.y
        ) {
            collided = true;
            //console.log('collided', x, y, width, height);
            return;
        }
    })
    return collided;
}
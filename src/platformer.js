var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed, player, x, y;

var player = {
    x: 0,
    y: 0,
    height: null,
    width: null,
    el: null,
    xAcc: 1,
    yAcc: 1,
    xVel: 0,
    yVel: 0,
    friction: .5,
};

var controller = {};

var collision = [];

var up = 'ArrowUp';
var left = 'ArrowLeft';
var right = 'ArrowRight';
var down = 'ArrowDown';

// initialize the timer variables and start the animation

function init(fps) {
    player.el = document.getElementById('player');
    player.height = player.el.offsetHeight;
    player.width = player.el.offsetWidth;
    console.log(player);
    console.log('Hello World');
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    getCollisionMap();
    console.log(collision);
    update();
}

// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

function update() {

    // request another frame

    requestAnimationFrame(update);

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here
        if (controller[up]) {
            player.yVel -= player.yAcc;
        }

        if (controller[down]) {
            player.yVel += player.yAcc;
        }

        if (controller[left]) {
            player.xVel -= player.xAcc;
        }

        if (controller[right]) {
            player.xVel += player.xAcc;
        }

        if (player.xVel) {
          player.xVel -= (player.xVel/Math.abs(player.xVel)) * player.friction;
        }

        if (player.yVel) {
            player.yVel -= (player.yVel/Math.abs(player.yVel)) * player.friction;
        }

        detectCollision(); 
        player.x += player.xVel;
        player.y += player.yVel;
        // console.log('Player position: ', player.x, ', ', player.y);
        //console.log('Player velocity: ', player.xVel, ', ', player.yVel);
        draw();
    }
}

function draw() {
    player.el.style.left = player.x + 'px';
    player.el.style.top = player.y + 'px';
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
    console.log('Platforms: ', document.getElementsByClassName('platform'));
    var platforms = document.getElementsByClassName('platform');

    for (var key in platforms) {
        // skip loop if the property is from prototype
        if (!platforms.hasOwnProperty(key)) continue;

        var platform = platforms[key];

        var properties = getProperties(platform);
        // console.log(properties);
        collision.push(properties);
    }

}

function detectCollision() {
    collision.forEach((platform) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // collision detected!
            console.log('Collided');
        }
    })
}
var WIDTH = 700, HEIGHT = 600, PI = Math.PI;
var upArrow = 38, downArrow = 40;
var canvas, context, keystate;
var player, ai, ball;

player = {
    x: null,
    y: null,
    width: 20,
    height: 100,

    update: function() {
        if (keystate[upArrow])
            this.y -= 7;
        if (keystate[downArrow])
            this.y += 7;
    },
    draw: function() {
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

ai = {
    x: null,
    y: null,
    width: 20,
    height: 100,

    update: function() {
        var dest_y = ball.y - (this.height + ball.side) * 0.5;
        this.y += (dest_y - this.y) * 0.1;
    },
    draw: function() {
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

ball = {
    x: null,
    y: null,
    side: 20,
    speed: 5,
    velocity: null,

    serve: function(side) {
        var r = Math.random();
        this.x = side === 1 ? player.x : ai.x - this.side;
        this.y = (HEIGHT - this.side) * r;

        var phi = 0.1 * PI * (1 - 2 * r);
        this.velocity = {
            x: side * this.speed * Math.cos(phi),
            y: this.speed * Math.sin(phi)
        }
    },
    update: function() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.y < 0 || this.y + this.side > HEIGHT) {
            var offset = this.velocity.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);

            this.y += 2 * offset;
            this.velocity.y *= -1;
        }

        var intersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
            result =
                ax < bx + bw &&
                ay < by + bh &&
                bx < ax + aw &&
                by < ay + ah;
            return result;
        }

        var paddle = this.velocity.x < 0 ? player : ai;

        if (intersect(paddle.x, paddle.y, paddle.width, paddle.height, this.x, this.y, this.side, this.side)) {
            this.x = paddle === player ? player.x + player.width : ai.x - this.side;
            var n = (this.y + this.side - paddle.y) / (paddle.height + this.side); //Normalized value for location on the paddle where the ball hits
            var phi = (PI / 4) * (2 * n - 1);

            var smash = Math.abs(phi) > 0.2 * PI ? 1.5 : 1;
            this.velocity.x = smash * (paddle === player ? 1 : -1) * this.speed * Math.cos(phi);
            this.velocity.y = smash * this.speed * Math.sin(phi);
        }

        if (this.x + this.side < 0 || this.x > WIDTH) {
            this.serve(paddle === player ? 1 : -1);
        }
    },
    draw: function() {
        context.fillRect(this.x, this.y, this.side, this.side);
    }
}

function main() {
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    context = canvas.getContext("2d");
    document.body.appendChild(canvas);

    keystate = {};
    document.addEventListener("keydown", function(evt) {
        keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function(evt) {
        delete keystate[evt.keyCode];
    });

    init();

    var loop = function() {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);
    };
    window.requestAnimationFrame(loop, canvas);
}

function init() {
    player.x = player.width;
    player.y = (HEIGHT - player.height) / 2;

    ai.x = WIDTH - 2 * ai.width;
    ai.y = (HEIGHT - player.height) / 2;

    ball.serve(1);
}

function update() {
    ball.update();
    player.update();
    ai.update();
}

function draw() {
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.save();
    context.fillStyle = "#fff"

    ball.draw();
    player.draw();
    ai.draw();

    context.restore();
}

main();

let gameRunning = false;
let ai = 'Artifical Intelligence';

function startgame()
{
    gameRunning = true;

    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error('Canvas elementi bulunamadı.');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('2D context alınamadı.');
        return;
    }
    const welcomeText = document.getElementById('WelcomeText');
    const chooseTheme = document.getElementById('ChooseTheme');

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    const keysPressed = [];
    const KEY_UP = 38;
    const KEY_DOWN = 40;

    function showWelcomeText() {
        welcomeText.style.visibility = 'visible';
        chooseTheme.style.visibility = 'visible';
        setTimeout(function() {
            welcomeText.style.visibility = 'hidden'; // Yazıyı 5 saniye sonra gizle
            chooseTheme.style.visibility = 'hidden'; // Yazıyı 5 saniye sonra gizle
        }, 1000); // 5000 milisaniye = 5 saniye
    }

    // Sayfa yüklendiğinde yazıyı göster
    showWelcomeText();

    window.addEventListener('keydown', function(e){
        keysPressed[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e){
        keysPressed[e.keyCode] = false;
    });

    function vec2(x, y)
    {
        return{x: x, y: y};
    }

    function Ball(pos, velocity, radius) // burda ada topun konumu al ve gönder
    {
        this.pos = pos;
        this.velocity = velocity;
        this.radius = radius;

        this.update = function() {
            this.pos.x += this.velocity.x;
            this.pos.y += this.velocity.y;
        };

        this.draw = function()
        {
            ctx.fillStyle = gameBGColor;
            ctx.strokeStyle = gameBGColor;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        };

    }

    function Paddle(pos, velocity, width, height) {
        this.pos = pos;
        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.score = 0;

        this.update = function() {
            if (keysPressed[KEY_UP])
                this.pos.y -= this.velocity.y;
            if (keysPressed[KEY_DOWN])
                this.pos.y += this.velocity.y;
        };

        this.draw = function() {
            ctx.fillStyle = gameBGColor;
            ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        };

        this.getHalfWidth = function() {
            return this.width / 2;
        };

        this.getHalfHeight = function() {
            return this.height / 2;
        };

        this.getCenter = function() {
            return vec2(
                this.pos.x + this.getHalfWidth(),
                this.pos.y + this.getHalfHeight(),
            );
        };
    }

    function paddleCollisionWithTheEdges(paddle)
    {
        if (paddle.pos.y <= 0)
            paddle.pos.y = 0;
        if (paddle.pos.y + paddle.height >= canvas.height)
            paddle.pos.y = canvas.height - paddle.height;
    }

    function ballCallisionWithTheEdges(ball)
    {
        if (ball.pos.y + ball.radius >= canvas.height)
            ball.velocity.y *= -1;
        if (ball.pos.y - ball.radius <= 0)
            ball.velocity.y *= -1;
    }

    function ballPaddleCollision(ball, paddle)
    {
        let ballNextX = ball.pos.x + ball.velocity.x;
        let ballNextY = ball.pos.y + ball.velocity.y;

        let paddleLeft = paddle.pos.x;
        let paddleRight = paddle.pos.x + paddle.width;
        let paddleTop = paddle.pos.y;
        let paddleBottom = paddle.pos.y + paddle.height;

        if (
            ballNextX + ball.radius > paddleLeft &&
            ballNextX - ball.radius < paddleRight &&
            ballNextY + ball.radius > paddleTop &&
            ballNextY - ball.radius < paddleBottom
        ) {
            // Çarpışma oluyorsa topun paddle'dan çıkarılması gerekiyor
            // X ekseninde çarpışma
            if (ballNextX < paddleLeft || ballNextX > paddleRight) {
                ball.velocity.x *= -1;
                // Çarpışma sonrası topun paddle'ın içinden çıkarılması
                if (ballNextX < paddleLeft) {
                    ball.pos.x = paddleLeft - ball.radius;
                } else {
                    ball.pos.x = paddleRight + ball.radius;
                }
            }
            // Y ekseninde çarpışma
            if (ballNextY < paddleTop || ballNextY > paddleBottom) {
                ball.velocity.y *= -1;
                // Çarpışma sonrası topun paddle'ın içinden çıkarılması
                if (ballNextY < paddleTop) {
                    ball.pos.y = paddleTop - ball.radius;
                } else {
                    ball.pos.y = paddleBottom + ball.radius;
                }
            }
        }
    }

    function player2AI(ball,paddle) // gelen veri için kullan burda gelen veri işle ve konum güncellemesini yap
    {
        if (ball.velocity.x > 0)
        {
            if (ball.pos.y > paddle.pos.y)
            {
                paddle.pos.y += paddle.velocity.y;

                if (paddle.pos.y + paddle.height >= canvas.height)
                    paddle.pos.y = canvas.height - paddle.height;
            }

            if (ball.pos.y < paddle.pos.y)
            {
                paddle.pos.y -= paddle.velocity.y;

                if (paddle.pos.y <= 0)
                    paddle.pos.y = 0;
            }
        }
    }

    function respawnBall(ball)
    {
        if (ball.velocity.x > 0)
        {
            ball.pos.x = (Math.random() * (canvas.width / 2 - 150)) + canvas.width / 2 + 150;
            ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
        }

        if (ball.velocity.x < 0)
        {
            ball.pos.x = (Math.random() * (canvas.width / 2 - 150)) + 150;
            ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
        }
        ball.velocity.x *= -1;
        ball.velocity.y *= -1;
    }

    function increaseScore(ball,paddle1,paddle2)
    {
        if (ball.pos.x <= -ball.radius)
        {
            paddle2.score++;
            document.getElementById('player2Score').innerHTML = paddle2.score;

            if (paddle2.score == 3){
                gameRunning = false;
                window.location.hash = 'winnerpage';
                //winnerUser = sessionStorage.getItem('paddle2User');

                winnerUser = ai;
                paddle2.score = 0;
                paddle1.score = 0;
                return;
            }
            respawnBall(ball);
            gameRunning = true;
        }

        if (ball.pos.x >= canvas.width + ball.radius)
        {
            paddle1.score++;
            document.getElementById('player1Score').innerHTML = paddle1.score;

            if (paddle1.score == 3){
                gameRunning = false;
                window.location.hash = 'winnerpage';
                //sessionStorage' set edilecek paddle1User set edilmeli
                winnerUser = sessionStorage.getItem('paddle1User');

                paddle1.score = 0;
                paddle2.score = 0;
                return;
            }
            respawnBall(ball);
            gameRunning = true;
        }
    }

    function drawGameScene()
    {
        ctx.strokeStyle = gameBGColor;


        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(0,0);
        ctx.lineTo(canvas.width, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(0,canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(canvas.width,0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.moveTo(0,0);
        ctx.lineTo(0, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.setLineDash([40, 20]);
        ctx.moveTo(canvas.width / 2,0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        /* ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI * 2);
        ctx.stroke(); */
    }

    const ball = new Ball(vec2(200,200), vec2(10, 10), 20);
    const paddle1 = new Paddle(vec2(0,50), vec2(15, 15), 20, 100);
    const paddle2 = new Paddle(vec2(canvas.width - 20, 30), vec2(15, 15), 20, 100);

    // paddle1.score = 0;
    // paddle2.score = 0; -> Asenkron çalışma var.

    function gameUpdate()
    {
        ball.update();
        paddle1.update();
        paddleCollisionWithTheEdges(paddle1);
        ballCallisionWithTheEdges(ball);
        player2AI(ball,paddle2);
        ballPaddleCollision(ball,paddle1);
        ballPaddleCollision(ball,paddle2);
        increaseScore(ball,paddle1,paddle2);
    }

    function gameDraw()
    {
        ball.draw();
        paddle1.draw();
        paddle2.draw();
        drawGameScene();
    }

    function gameLoop()
    {
        if(window.location.hash != "#aimode"){
            gameTheme = 0;
            gameRunning = false;
        }
        if (!gameRunning)
            return;

        /* ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        window.requestAnimationFrame(gameLoop);

        gameUpdate();
        gameDraw(); */

        var img = new Image();
        img.onload = function() {
            ctx.globalAlpha = 0.1;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
            // Resmin üzerine renkle doldur
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Oyun döngüsünü devam ettir
            window.requestAnimationFrame(gameLoop);

            // Oyun durumunu güncelle
            gameUpdate();
            // Ekranı çiz
            gameDraw();
        };
        img.src = gameBGImagePath;
    }
    gameLoop();
}

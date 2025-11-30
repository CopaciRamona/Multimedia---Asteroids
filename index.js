// --- CONFIGURARE ȘI REFERINȚE DOM---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementele de scor 
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

// Dimensiuni
const GAME_WIDTH = canvas.width = 800;
const GAME_HEIGHT = canvas.height = 600;

// Variabile Joc
let gameLoopId; // ID-ul pentru requestAnimationFrame
let score = 0;
let lives = 3;
let isGameOver = false;

// Liste pentru actorii jocului
let asteroids = [];
let rockets = [];
const MAX_ROCKETS = 3;

// Controlul tastelor
const KEY_CODES = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, Z: 90, C: 67, X: 88 };
let keys = {};

// --- CLASE ---

// Reprezintă nava controlată de jucător.
// Gestionează desenarea, mișcarea bazată pe input și tragerea.
class Ship {
    constructor() {
        this.x = GAME_WIDTH / 2;
        this.y = GAME_HEIGHT / 2;
        this.size = 20;
        this.angle = 0;  // Orientare în radiani
        this.speed = 4;  // Viteză constantă de deplasare
    }

    // Desenează nava folosind transformări de context (translate/rotate)
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -this.size); // Vârf
        ctx.lineTo(-this.size * 0.6, this.size * 0.8); // Stânga-Spate
        ctx.lineTo(this.size * 0.6, this.size * 0.8); // Dreapta-Spate
        ctx.closePath();

        ctx.strokeStyle = 'white'; // Nava e alba
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Un mic triunghi rosu în varf pentru a vedea direcția navei
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.restore();
    }

    // Actualizează poziția și unghiul navei pe baza tastelor apăsate.
    // Aplică limitele ecranului (nava nu poate ieși din cadru)
    update() {

        // Deplasare pe axele X/Y
        if (keys[KEY_CODES.UP]) this.y -= this.speed;
        if (keys[KEY_CODES.DOWN]) this.y += this.speed;
        if (keys[KEY_CODES.LEFT]) this.x -= this.speed;
        if (keys[KEY_CODES.RIGHT]) this.x += this.speed;

        // Rotație
        const rotationSpeed = 0.08;
        if (keys[KEY_CODES.Z]) this.angle -= rotationSpeed;
        if (keys[KEY_CODES.C]) this.angle += rotationSpeed;

        // Limite ecran
        if (this.x < 0) this.x = 0;
        if (this.x > GAME_WIDTH) this.x = GAME_WIDTH;
        if (this.y < 0) this.y = 0;
        if (this.y > GAME_HEIGHT) this.y = GAME_HEIGHT;
    }

    // Lansează o rachetă în direcția curentă a navei
    fireRocket() {
        if (rockets.length < MAX_ROCKETS) {
            rockets.push(new Rocket(this.x, this.y, this.angle));
        }
    }
}


// Reprezintă obicetul cu care nava distruge asteroizii
class Rocket {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10; 
        this.radius = 3; 

        //Calcul vector de mișcare bazat pe unghi
        this.dx = Math.sin(this.angle) * this.speed;
        this.dy = -Math.cos(this.angle) * this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0'; // Racheta este galbenă pentru a fi ușor obervată
        ctx.fill();
    }

    // Actualizează poziția rachetei
    // Returnează True dacă a ieșit din ecran (pentru a fi șters)
    update() {
        this.x += this.dx;
        this.y += this.dy;
       
        return this.x < 0 || this.x > GAME_WIDTH || this.y < 0 || this.y > GAME_HEIGHT;
    }
}


// Reprezintă inamicul care trebuie distrus de navă
// Conține etapa de generare aleatorie a acestora, mișcare și screen wrapping
class Asteroid {
    constructor() {

        // Proprietăți aleatorii
        this.hp = Math.floor(Math.random() * 4) + 1; // 1-4 vieți
        this.updateAppearance(); // Setăm mărimea și culoarea

        // Alege o latură random pentru a intra în scenă
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { this.x = Math.random() * GAME_WIDTH; this.y = -40; }
        else if (side === 1) { this.x = GAME_WIDTH + 40; this.y = Math.random() * GAME_HEIGHT; }
        else if (side === 2) { this.x = Math.random() * GAME_WIDTH; this.y = GAME_HEIGHT + 40; }
        else { this.x = -40; this.y = Math.random() * GAME_HEIGHT; }

        // Calcul vector direcție către centru ecranului
        const targetX = GAME_WIDTH / 2;
        const targetY = GAME_HEIGHT / 2;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);

        const speed = Math.random() * 2 + 0.5;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    // Actualizează raza și culoarea în funcție de HP-ul curent(numărul de rcahete pentru a putea fii distrus)
    updateAppearance() {
        this.radius = 10 + (this.hp * 5); // Raza creste cu HP-ul
        if (this.hp === 4) this.color = '#ff0000'; // Rosu
        else if (this.hp === 3) this.color = '#ff8800'; // Portocaliu
        else if (this.hp === 2) this.color = '#ffff00'; // Galben
        else this.color = '#00ff00'; // Verde
    }

    draw() {

        //Desenare cerc gol 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Afișare Text HP în centru
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.hp, this.x, this.y);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

       // --- TELEPORTARE (Screen Wrap) ---
        // Dacă ieși prin dreapta, apari în stânga
        if (this.x > GAME_WIDTH) this.x = 0;
        // Dacă ieși prin stânga, apari în dreapta
        if (this.x < 0) this.x = GAME_WIDTH;
        // Dacă ieși pe jos, apari sus
        if (this.y > GAME_HEIGHT) this.y = 0;
        // Dacă ieși pe sus, apari jos
        if (this.y < 0) this.y = GAME_HEIGHT; 
       
    }

    // Logica dacă nava lovește asteroidul 
    // Returnează true dacă asteroidul a fost distrus
    hit() {
        this.hp--;
        this.updateAppearance();
        return this.hp <= 0;
    }
}

// Initializare obiecte
const ship = new Ship();

// --- LOGICA JOCULUI ---

// Verifică coliziunea dintre două obiecte circulare folosind distanța Euclidiană
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance < (obj1.radius + obj2.radius);
}

// Bucla principală de actualizare a stării jocului
// Gestionează mișcarea, coliziunile și regenerarea asteroizilor
function updateGame() {
    if (isGameOver) return;

    ship.update();
    asteroids.forEach(a => a.update());

    // Actualizare Rachete (filtrăm pe cele care ies din ecran)
    rockets = rockets.filter(r => !r.update());

    // --- COLIZIUNE 1: RACHETE vs ASTEROIZI ---
    for (let i = rockets.length - 1; i >= 0; i--) {
        let rocketHit = false;
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(rockets[i], asteroids[j])) {
                console.log("Hit!");
                rocketHit = true;
                
                const destroyed = asteroids[j].hit();
                if (destroyed) {
                    score += 100; // 100 puncte per distrugere
                    updateScoreDisplay(); // Actualizăm scorul pe ecran
                    asteroids.splice(j, 1); // Ștergem asteroidul
                }
                break; // Racheta dispare la primul impact
            }
        }
        if (rocketHit) rockets.splice(i, 1); // Ștergem racheta
    }

    // --- COLIZIUNE 2: NAVA vs ASTEROIZI ---
    for (let i = asteroids.length - 1; i >= 0; i--) {
        // Facem un obiect temporar pentru navă( un cerc )
        let shipCircle = { x: ship.x, y: ship.y, radius: ship.size / 2 };
        
        if (checkCollision(shipCircle, asteroids[i])) {
            lives--;
            updateScoreDisplay();
            asteroids.splice(i, 1); // Asteroidul dispare când lovește nava

            if (lives <= 0) {
                endGame();
            } else {
                rockets = [];
            }
        }
    }

    // --- COLIZIUNE 3: ASTEROID vs ASTEROID ---
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            if (checkCollision(asteroids[i], asteroids[j])) {
                // Simplu bounce - schimbăm vitezele între ei
                let tempDx = asteroids[i].dx;
                let tempDy = asteroids[i].dy;
                asteroids[i].dx = asteroids[j].dx;
                asteroids[i].dy = asteroids[j].dy;
                asteroids[j].dx = tempDx;
                asteroids[j].dy = tempDy;
                
                // Îi mutăm putin ca să nu se lipească
                asteroids[i].update();
                asteroids[j].update();
            }
        }
    }

    // Regenerare Asteroizi (pentru a aveam minim 5 pe ecran)
    while (asteroids.length < 5) {
        asteroids.push(new Asteroid());
    }
}

// Funcția principală, desenează cadrul curent
function drawGame() {
    // Curăța ecranul
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Desenare actori
    ship.draw();
    rockets.forEach(r => r.draw());
    asteroids.forEach(a => a.draw());

    // Desenare cadru pentru Game Over
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("GAME OVER", GAME_WIDTH/2, GAME_HEIGHT/2);
    }
}

// Bucla de animație (Game Loop), rulează la aprox 60 FPS
function gameLoop() {
    updateGame();
    drawGame();
    if (!isGameOver) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// --- Elemente de afișare scor ---

function updateScoreDisplay() {
    if(scoreDisplay) scoreDisplay.textContent = score;
    if(livesDisplay) livesDisplay.textContent = lives;
    
    // Regenerare vieți la 1000 puncte
    if (score > 0 && score % 1000 === 0) {
        lives++;
        if(livesDisplay) livesDisplay.textContent = lives;
    }
}

// Inițializare și pornirea din nou a jocului
function startGame() {

    // 1. Resetare variabile de scor
    score = 0;
    lives = 3;
    isGameOver = false;
    updateScoreDisplay(); // Afișăm scorul 0 și viețile 3

    // 2. Curățare ecran (ștergem rachetele și asteroizii vechi)
    rockets = [];
    asteroids = [];
    
    // 3. FIX: Resetăm tastele (ca să nu rămână nava blocată mergând singură)
    keys = {}; 

    // 4. FIX: Punem nava în centru
    ship.x = GAME_WIDTH / 2;
    ship.y = GAME_HEIGHT / 2;
    ship.angle = 0;
    
    // 5. Generăm primii asteroizi
    for(let i=0; i<5; i++) asteroids.push(new Asteroid());

    // 6. Pornim Bucla de Joc (gameLoop)
    // Verificăm "!gameLoopId" ca să fim siguri că nu pornim două bucle deodată
    if (!gameLoopId) {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// Oprește jocul și salvează Highscore
function endGame() {
    isGameOver = true;

    // Dacă bucla încă mai încerca să ruleze, o oprim forțat
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId); 
        gameLoopId = null; //Dăm ID-ului valoarea zero
    }
    // --------------------

    // Desenăm o ultimă dată ca să fim siguri că apare textul GAME OVER
    drawGame(); 

    // O mică pauză să deseneze textul roșu înainte de prompt
    setTimeout(() => {
        // Prompt-ul blochează execuția browserului
        let name = prompt("Ai pierdut! Scor: " + score + ". Numele tau:");
        if (name) saveHighScore(name, score);
        
        // Când dai OK sau Cancel, codul continuă aici și repornește jocul
        startGame();
    }, 100); 
}
// --- CONTROALE ---
document.addEventListener('keydown', (e) => {

    //Previne scroll-ul paginii cu săgețile
    if([37,38,39,40].includes(e.keyCode)) e.preventDefault();
    keys[e.keyCode] = true;
    
    // Instanța de tragere apelată la apăsarea tastei
    if (e.keyCode === KEY_CODES.X) ship.fireRocket();
});

document.addEventListener('keyup', (e) => {
    keys[e.keyCode] = false;
});

// --- SALVARE SCOR  ---
const HIGHSCORE_KEY = 'asteroids_highscores_v2';

function getHighScores() {
    try {
        const str = localStorage.getItem(HIGHSCORE_KEY);
        return str ? JSON.parse(str) : [];
    } catch (e) {
        return [];
    }
}

function saveHighScore(name, currentScore) {
    let scores = getHighScores();
    scores.push({ name: name, score: currentScore });
    scores.sort((a, b) => b.score - a.score); // Sortare descrescătoare
    scores = scores.slice(0, 5); // Top 5
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores));
    displayHighScores();
}

function displayHighScores() {
    const list = document.getElementById('scoresList');
    if (!list) return;
    list.innerHTML = '';
    const scores = getHighScores();
    scores.forEach((s, i) => {
        let li = document.createElement('li');
        li.textContent = (i+1) + ". " + s.name + ": " + s.score;
        list.appendChild(li);
    });
}

// Pornire la încărcarea paginii
window.onload = () => {
    startGame();
    displayHighScores();
};
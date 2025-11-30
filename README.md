# Proiect Multimedia - Joc Asteroids


---

### 1. Interfață Utilizator 
* S-a utilizat elementul HTML5 `<canvas>` pentru randarea grafică.
* Interfața include un HUD (Heads-Up Display) pentru afișarea Scorului și a Vieților.
* Stilizarea este realizată exclusiv prin CSS, asigurând centrarea elementelor și un aspect vizual coerent cu tema spațială.

### 2. Tratare Evenimente 
* S-au atașat funcții de tratare pentru evenimentele de tastatură:
    * `keydown`: Pentru detectarea apăsării continue a tastelor de direcție și a tastelor de acțiune.
    * `keyup`: Pentru oprirea acțiunilor la eliberarea tastelor.

### 3. Cerințe Specifice - Joc Asteroids 

Proiectul implementează integral logica specifică temei 5:

* **Asteroizi :**
    * Reprezentați sub formă de cerc.
    * Generați cu viață (HP) aleatorie între 1-4.
    * Culoarea și dimensiunea se modifică dinamic în funcție de HP.
    * Afișarea numerică a HP-ului în interiorul asteroidului.
    * Deplasare pe traiectorii liniare calculate spre centrul ecranului.

* **Navă Spațială :**
    * Desenată sub formă de triunghi.
    * Control vectorial complet:
        * **Săgeți:** Deplasare pe axele X/Y (independent de rotație).
        * **Z / C:** Rotire Stânga / Dreapta.
        * **X:** Lansare rachetă.

* **Rachete :**
    * Generate din vârful navei în direcția curentă a unghiului.
    * Detectare coliziune cu asteroizii și modificarea stării acestora (scădere HP/distrugere).

* **Coliziuni :**
    * **Asteroid - Asteroid :** Implementare ricoșeu (schimb de vectori de viteză) la impact.
    * **Navă - Asteroid :** Reducerea numărului de vieți și respawn-ul navei în centru. Jocul se încheie la 0 vieți.

* **Regenerare Vieți:**
    * La acumularea a 1000 de puncte, jucătorul primește o viață suplimentară.

* **Stocare Date :**
    * Implementare `Web Storage API` (LocalStorage) pentru salvarea și afișarea topului celor mai bune 5 scoruri.

---

## 🕹️ Controale

| Tastă | Acțiune |
| :--- | :--- |
| **Săgeți** | Deplasare (Sus/Jos/Stânga/Dreapta) |
| **Z** | Rotire Stânga |
| **C** | Rotire Dreapta |
| **X** | Foc (Lansare Rachetă) |


## Cum se rulează
Deschideți fișierul `index.html` în orice browser modern.

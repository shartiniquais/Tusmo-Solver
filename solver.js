async function chargerMots() {
    // Récupérer tous les mots de mots.txt, ils sont déjà triés, mis en majuscules et sans accents
    let response = await fetch("http://127.0.0.1:5500/Tusmo-Solver/mots.txt");
    let text = await response.text();
    const mots = text.split("\n");

    // Filtrer les mots de la bonne longueur
    const longueurMot = obtenirLongueurMot();
    console.log("Longueur du mot cible :", longueurMot);
    return mots.filter(mot => mot.length === longueurMot);
}

function obtenirLongueurMot() {
    const grille = document.querySelector('.motus-grid:not(.mini)'); // Sélectionne la grille principale
    return grille.childElementCount / 6; // Compte le nombre de cellules dans la première ligne
}

function obtenirLignesEssais() {
    const grille = document.querySelector('.motus-grid:not(.mini)'); // Sélectionne la grille principale
    const cellules = Array.from(grille.querySelectorAll('.grid-cell'));
    const longueurMot = obtenirLongueurMot();

    // Parcourir les cellules par groupes de `longueurMot` pour récupérer toutes les lignes d'essai
    let lignesEssais = [];
    for (let i = 0; i < cellules.length; i += longueurMot) {
        const ligne = cellules.slice(i, i + longueurMot);
        if (ligne.some(cell => cell.textContent.trim() !== '')) {
            lignesEssais.push(ligne);
        }
    }

    return lignesEssais;
}

function analyserIndices(lignesEssais) {
    const longueurMot = obtenirLongueurMot(); 
    let bienPlacees = Array(longueurMot).fill(null); 
    let malPlacees = new Set();
    let absentes = new Set();

    if (lignesEssais.length === 1) {
        const premiereLettre = document.querySelector('.motus-grid:not(.mini)').querySelector('.grid-cell').textContent;
        bienPlacees[0] = premiereLettre;
        console.log(`Première lettre initialisée automatiquement : ${premiereLettre}`);
    }

    lignesEssais.forEach(ligne => {
        ligne.forEach((cell, index) => {
            const lettre = cell.textContent;
            const cellContent = cell.querySelector('.cell-content');

            if (cellContent && cellContent.classList.contains('r')) {
                bienPlacees[index] = lettre;
            } else if (cellContent && cellContent.classList.contains('y')) {
                if (!bienPlacees.includes(lettre)) malPlacees.add(lettre);
            } else if (cellContent && cellContent.classList.contains('-')) {
                if (!bienPlacees.includes(lettre) && !malPlacees.has(lettre)) absentes.add(lettre);
            }
        });
    });

    malPlacees.forEach(lettre => {
        if (bienPlacees.includes(lettre)) {
            malPlacees.delete(lettre);
        }
    });

    malPlacees.forEach(lettre => {
        if (absentes.has(lettre)) {
            absentes.delete(lettre);
        }
    });

    console.log("Indices combinés:");
    console.log("Bien placées:", bienPlacees);
    console.log("Mal placées:", Array.from(malPlacees));
    console.log("Absentes:", Array.from(absentes));

    return { bienPlacees, malPlacees, absentes };
}

function filtrerMots(mots, indices) {
    const { bienPlacees, malPlacees, absentes } = indices;

    console.log("Début du filtrage avec indices :");
    console.log("Bien placées:", bienPlacees);
    console.log("Mal placées:", Array.from(malPlacees));
    console.log("Absentes:", Array.from(absentes));

    const motsApresBienPlacees = mots.filter(mot => {
        for (let i = 0; i < bienPlacees.length; i++) {
            if (bienPlacees[i] && mot[i] !== bienPlacees[i]) {
                return false;
            }
        }
        return true;
    });

    const motsApresMalPlacees = motsApresBienPlacees.filter(mot => {
        for (const lettre of malPlacees) {
            if (!mot.includes(lettre)) {
                return false;
            }
    
            for (let i = 0; i < mot.length; i++) {
                if (mot[i] === lettre && bienPlacees[i] !== lettre && bienPlacees[i] !== null) {
                    console.log(`Exclusion de ${mot} (Mal placées) : lettre '${lettre}' trouvée à une position interdite ${i}`);
                    return false;
                }
            }
        }
        return true;
    });    

    const motsApresAbsentes = motsApresMalPlacees.filter(mot => {
        for (const lettre of absentes) {
            for (let i = 0; i < mot.length; i++) {
                if (mot[i] === lettre && bienPlacees[i] !== lettre) {
                    return false;
                }
            }
        }
        return true;
    });

    console.log("Mots possibles finaux :", motsApresAbsentes);
    return motsApresAbsentes;
}


// Fonction principale qui exécute le solveur après chaque essai
async function solver() {
    const mots = await chargerMots();
    const lignesEssais = obtenirLignesEssais();
    const indices = analyserIndices(lignesEssais);
    const motsPossibles = filtrerMots(mots, indices);

    console.log("Suggestions de mots :", motsPossibles);
}

// Fonction pour détecter "Entrée" et relancer le solveur si la ligne est mise à jour
function setAutoRunOnEnter() {
    let lignesEssaisPrecedentes = obtenirLignesEssais().length;

    document.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const lignesEssaisActuelles = obtenirLignesEssais().length;

            if (lignesEssaisActuelles > lignesEssaisPrecedentes) {
                console.log("Nouvel essai détecté, relance du solveur.");
                await solver();
                lignesEssaisPrecedentes = lignesEssaisActuelles;
            }
        }
    });
}

setAutoRunOnEnter();
solver();

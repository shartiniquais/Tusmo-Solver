# Tusmo-Solver
Code javascript pour trouver le résultat a un tusmo : https://www.tusmo.xyz

Le fichier mots.txt contient tous les mots autorisés au Scrabble.

Pour lancer le code, il faut simplement le copier-coller dans la console du navigateur.
Il faut aussi utiliser l'extention Live Server dans vscode pour pouvoir lire le fichier mots.txt

Si vous utilisez un port différent vous pouvez le changer ligne 3 de solver.js : 
let response = await fetch("http://127.0.0.1:5500/Tusmo-Solver/mots.txt");

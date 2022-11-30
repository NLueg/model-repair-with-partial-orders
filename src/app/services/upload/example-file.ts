export const exampleContent1 = `.type run
.events
1 | Reise planen
2 | Prüfen
3 | Flug suchen
4 | Flug buchen
5 | Hotel suchen
6 | Hotel buchen
7 | Unterlagen speichern
.arcs
1 2
2 3
2 5
3 4
4 7
5 6
6 7
`;

export const exampleContent2 = `.type run
.events
1 | Reise planen
2 | Prüfen
3 | Änderung anfordern
4 | Reise planen
5 | Prüfen
6 | Flug suchen
7 | Flug buchen
8 | Hotel suchen
9 | Hotel buchen
10 | Unterlagen speichern
.arcs
1 2
2 3
3 4
4 5
5 6
5 8
6 7
7 10
8 9
9 10
`;

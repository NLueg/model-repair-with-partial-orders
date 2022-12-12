export const simpleExamplePetriNet = `.type pn
.transitions
a a
b b
c c
.places
p1 1
p2 0
.arcs
p1 a
a p2
p2 c
p2 b
`;

export const simpleExampleLogInvalid = `.type log
.events
e1 a
e2 b
e3 c
.arcs
e1 e2
e2 e3
`;

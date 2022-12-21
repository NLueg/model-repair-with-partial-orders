export const simpleExamplePetriNet = `.type pn
.transitions
a a
b b
c c
d d
.places
p1 1
p2 0
p3 0
.arcs
p1 a
a p2
p2 c
p2 b
b p3
c p3
p3 d
`;

export const simpleExampleLogInvalid = `.type log
.events
e1 a
e2 b
e3 c
e4 d
.arcs
e1 e2
e2 e3
e3 e4
`;

export const simpleExampleLogInvalidSecond = `.type log
.events
e1 a
e2 b
e3 c
e4 d
.arcs
e1 e3
e3 e2
e2 e4
`;

export const examplePetriNet = `.type pn
.transitions
a a
b b
c c
d d
e e
f f
.places
p1 2
p2 0
p3 1
p4 2
p5 1
p6 0
p7 1
.arcs
p1 a
a p2
p2 c
c p5
p5 a
p2 b
b p3
p3 d
d p7
p7 d
p7 c
c p7
d p6
c p4
p4 e 3
e p6
p6 f 3
`;

export const exampleLog = `.type log
.events
e1 a
e2 d
e3 c
e4 a
e5 b
e6 d
e7 e
e8 f
.arcs
e1 e3
e2 e3
e3 e4
e4 e5
e5 e6
e6 e8
e3 e7
e7 e8
`;

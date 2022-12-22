export const simpleExamplePetriNet = `.type pn
.transitions
t1 t1
t2 t2
t3 t3
t4 t4
t5 t5
t6 t6
.places
p1 1
p2 0
p3 0
p4 0
p5 0
.arcs
p1 t1
t1 p2
t1 p3
p2 t2
t2 p4
p4 t3
t3 p3
p3 t4
t4 p5
p4 t5
t5 p3
p5 t6
t6 p3
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

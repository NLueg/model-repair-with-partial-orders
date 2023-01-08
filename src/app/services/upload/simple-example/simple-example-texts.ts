export const simpleExamplePetriNet = `.type pn
.transitions
a a
b b
c c
d d
.places
p1 0
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

export const simpleExampleLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 a e1
1 b e2 [e1]
1 c e3 [e1]
1 d e4 [e2,e3]
2 x e5
2 b e6 [e5]
2 c e7 [e5]
2 d e8 [e6,e7]
`;

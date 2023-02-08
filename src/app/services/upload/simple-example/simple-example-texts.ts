export const simpleExamplePetriNet = `.type pn
.transitions
b b
c c
d d
.places
p2 0
p3 0
.arcs
p2 c
p2 b
b p3
c p3
p2 d
b d
c d
`;

export const simpleExampleLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 a e1
1 c e3
1 b e2
1 d e4
2 a e1
2 b e2
2 c e3
2 d e4
`;

export const simpleExamplePo = `.type log
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

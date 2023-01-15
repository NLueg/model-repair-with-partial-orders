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

export const colloquiumNet = `.type pn
.transitions
rp Reise_planen
fs Flug_suchen
hs Hotel_suchen
fb Flug_buchen
hb Hotel_buchen
us Unterlagen_speichern
.places
p1 1
p2 0
p3 0
p4 0
p5 0
p6 0
p7 0
p8 0
.arcs
p1 rp
rp p2
rp p3
p2 fs
p3 hs
hs p4
p4 hb
hb p5
fs p6
p6 fb
fb p7
p5 us
p7 us
us p8
`;

export const colloquiumLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 Reise_planen a
1 Flug_suchen b
1 Flug_buchen c
1 Hotel_suchen d
1 Hotel_buchen e
1 Unterlagen_speichern f
2 Reise_planen a
2 Flug_buchen b
2 Hotel_suchen c
2 Hotel_buchen d
2 Unterlagen_speichern e
3 Reise_planen a
3 Flug_suchen b
3 Flug_buchen c
3 Hotel_suchen d
3 Frühstück_buchen e
3 Hotel_buchen f
3 Unterlagen_speichern g
`;

export const simpleExamplePetriNet = `.type pn
.transitions
rp Reise_planen
op Optionen_prüfen
fs Flug_suchen
hs Hotel_suchen
fb Flug_buchen
hb Hotel_buchen
ud Unterlagen_drucken
.places
p0 1
p1 0
p2 0
p3 0
p4 0
p5 0
p6 0
p7 0
p8 0
.arcs
p0 rp
rp p1
p1 op
op p2
op p3
p3 hs
hs p5
p5 hb
hb p7
p7 ud
ud p8
p2 fs
fs p4
p4 fb
fb p6
p6 ud
`;

export const simpleExampleLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 Reise_planen a
1 Optionen_prüfen a_
1 Flug_suchen b
1 Flug_buchen c
1 Hotel_suchen d
1 Hotel_buchen e
1 Unterlagen_drucken f
2 Reise_planen a
2 Optionen_prüfen a_
2 Flug_buchen b
2 Hotel_suchen c
2 Hotel_buchen d
2 Unterlagen_drucken e
3 Reise_planen a
3 Optionen_prüfen a_
3 Flug_suchen b
3 Flug_buchen c
3 Hotel_suchen d
3 Frühstück_buchen e
3 Hotel_buchen f
3 Unterlagen_drucken g
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

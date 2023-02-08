export const andLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 c
2 a
2 c
2 b`;

export const andPetriNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
.arcs
p0 a
a p1
p1 b
p1 c`;

export const loopLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 b
1 b
1 c
2 a
2 b
2 c`;

export const loopPetriNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
.arcs
p0 a
a p1
p1 b
p1 c`;

export const skipLog = `.type log
.attributes
case-id
concept:name
.events
1 a
1 b
1 c
2 a
2 c`;

export const skipNet = `.type pn
.transitions
a a
b b
c c
.places
p0 1
p1 0
p2 0
.arcs
p0 a
a p1
p1 b
b p2
p2 c`;

export const repairExampleLog = ``;

export const repairExampleNet = ``;

export const coffeeMachineLog = `.type log
.attributes
case-id
concept:name
event-id
follows[]
.events
1 Kaffeebohnen_mahlen km []
1 Kaffeemaschine_entriegeln ke []
1 Wasser_mit_Glaskanne_holen wgh []
1 Filter_leeren fl [ke]
1 Filter_füllen ff [km, fl]
1 Wasser_einfüllen we [wgh, ke]
1 Kaffeekanne_auswaschen ka [ke]
1 Zusammensetzen_und_starten e [ka, we, ff]
2 Kaffeebohnen_mahlen km []
2 Kaffeemaschine_entriegeln ke []
2 Filter_leeren fl [ke]
2 Filter_füllen ff [km, fl]
2 Kaffeekanne_auswaschen ka [ke]
2 Wasser_mit_Kaffeekanne_holen wkh [ka]
2 Wasser_einfüllen we [wkh]
2 Zusammensetzen_und_starten e [we, ff]`;

export const coffeeMachineNet = `.type pn
.transitions
km Kaffeebohnen_mahlen
ff Filter_füllen
fl Filter_leeren
ke Kaffeemaschine_entriegeln
ka Kaffeekanne_auswaschen
wkh Wasser_mit_Kaffeekanne_holen
wgh Wasser_mit_Glaskanne_holen
we Wasser_einfüllen
e Zusammensetzen_und_starten
.places
p0 1
p1 1
p3 0
p4 0
p5 0
p6 0
p7 0
p8 0
p9 0
p10 0
p11 0
.arcs
p0 km
km p3
p3 ff
ff p4
p4 e
p1 ke
ke p5
p5 fl
fl p6
p6 ff
ke p7
p7 ka
ka p8
p8 e
ka p9
p9 wkh
wkh p10
p10 we
we p11
p11 e
p9 wgh
wgh p10`;

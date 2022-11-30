export type PnmlWrapper = {
  pnml: {
    net: {
      page?: PnmlPage;
    } & PnmlPage;
  };
};

export type PnmlPage = {
  arc: PnmlArc[];
  place: PnmlPlace[];
  transition: PnmlTransitions[];
};

type PnmlArc = {
  source: string;
  target: string;
};

type PnmlPlace = {
  id: string;
  name: {
    text: string;
  };
};

type PnmlTransitions = {
  id: string;
  name?: {
    text?: string;
  };
};

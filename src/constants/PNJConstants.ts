import { ViewId } from "@/core/commons/constants/views/ViewId";

export enum PNJId {
  FDP_1 = 'FDP_1',
  FDP_2 = 'FDP_2',
  FDP_3 = 'FDP_3',
  FDP_4 = 'FDP_4',
  FDP_5 = 'FDP_5',
}

export interface PNJData {
  house: string;
  dialogs: Array<string>;
  character?: string;
  viewId: ViewId;
}

export const PNJHouseIndices = [
  PNJId.FDP_1,
  PNJId.FDP_2,
  PNJId.FDP_3,
  PNJId.FDP_4,
  PNJId.FDP_5,
] as const satisfies Array<PNJId>

export const PNJDatas = {
  FDP_1: {
    house: "Maison du Mécano",
    viewId: ViewId.MECANO_GAME,
    dialogs: [
      "images/dialogsvg/mecano/0.svg",
      "images/dialogsvg/mecano/1.svg",
      "images/dialogsvg/mecano/2.svg",
      "images/dialogsvg/mecano/3.svg",
    ],
    character: "images/character/mecano.png",
  },
  FDP_2: {
    house: "Maison de la Scientifique",
    viewId: ViewId.SCIENTIFIQUE_GAME,
  },
  FDP_3: {
    house: "Maison de la Forgeronne",
    viewId: ViewId.FORGERON_GAME,
  },
  FDP_4: {
    house: "Maison du Stratège",
    viewId: ViewId.STRATEGE_GAME
  },
  FDP_5: {
    house: "Maison du Jardinier",
    viewId: ViewId.JARDINIER_GAME,
  },
} as const satisfies Record<PNJId, PNJData>;
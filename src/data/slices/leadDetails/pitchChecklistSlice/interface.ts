export interface PitchChecklistItem {
  key: string;
  checked: boolean;
  labelTh: string;
  labelEn: string;
}

export interface PitchChecklistSection {
  key: string;
  labelTh: string;
  labelEn: string;
  order: number;
  items: PitchChecklistItem[];
}

export interface PitchChecklistStats {
  checked: number;
  total: number;
}

export interface PitchChecklist {
  name: string;
  version: string;
  sections: PitchChecklistSection[];
  stats: PitchChecklistStats;
}

export interface UpdatePitchChecklistItemPayload {
  leadName: string;
  itemKey: string;
  checked: boolean;
}

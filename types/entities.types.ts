export interface SavedWord {
  id: number;
  word: string;
  translation: string;
  dictionary_id: string;
  created: string;
}

export interface Dictionary {
  id: number;
  name: string;
  created: string;
}
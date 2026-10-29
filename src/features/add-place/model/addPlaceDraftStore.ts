import {create} from 'zustand';
import {PlaceFormValues} from './placeSchema';

const DRAFT_TTL_MS = 20 * 60 * 1000;

export const EMPTY_PLACE_FORM_VALUES: PlaceFormValues = {
  title: '',
  address: '',
  description: '',
  category: 'sightseeing',
  latitude: '',
  longitude: '',
};

interface AddPlaceDraftState {
  draft: PlaceFormValues;
  updatedAt: number | null;
  saveDraft: (values: Partial<PlaceFormValues>) => void;
  getValidDraft: () => PlaceFormValues;
  clearDraft: () => void;
}

export const useAddPlaceDraftStore = create<AddPlaceDraftState>((set, get) => ({
  draft: EMPTY_PLACE_FORM_VALUES,
  updatedAt: null,
  saveDraft: (values: Partial<PlaceFormValues>) => {
    set(state => ({
      draft: {
        ...state.draft,
        ...values,
      },
      updatedAt: Date.now(),
    }));
  },
  getValidDraft: (): PlaceFormValues => {
    const {draft, updatedAt} = get();
    if (!updatedAt || Date.now() - updatedAt > DRAFT_TTL_MS) {
      return EMPTY_PLACE_FORM_VALUES;
    }
    return draft;
  },
  clearDraft: () => {
    set({
      draft: EMPTY_PLACE_FORM_VALUES,
      updatedAt: null,
    });
  },
}));

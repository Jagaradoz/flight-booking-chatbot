export type BookingStep = 'search' | 'select' | 'customize' | 'book' | 'confirm';

export type ViewMode = 'flights' | 'seats' | 'addons' | 'booking';

export interface ActiveView {
  view: ViewMode;
  key: number;
}

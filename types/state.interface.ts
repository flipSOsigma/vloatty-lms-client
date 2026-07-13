import { LmsEvent } from "./event.interface";
import { CalendarViewType } from "./view.interface";

export interface LmsState {
  events: LmsEvent[];
  selectedView: CalendarViewType;
  activeDayIndex: number; // For the active day highlight (default: Thursday = 3)
  searchQuery: string;
  selectedCategories: string[];
  currentTime: string; // "07:21"
}

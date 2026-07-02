import { LmsEvent } from "./event";
import { CalendarViewType } from "./view";

export interface LmsState {
  events: LmsEvent[];
  selectedView: CalendarViewType;
  activeDayIndex: number; // For the active day highlight (default: Thursday = 3)
  searchQuery: string;
  selectedCategories: string[];
  currentTime: string; // "07:21"
}

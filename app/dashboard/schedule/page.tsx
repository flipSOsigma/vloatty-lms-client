"use client";

import Header from "../../../components/views/Header";
import ScheduleView from "../../../components/views/ScheduleView";
import EventModal from "../../../components/views/EventModal";

export default function SchedulePage() {
  return (
    <>
      <Header />
      <div className="flex-grow overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-6 md:px-8 flex flex-col gap-6">
          <ScheduleView />
        </div>
      </div>
      <EventModal />
    </>
  );
}

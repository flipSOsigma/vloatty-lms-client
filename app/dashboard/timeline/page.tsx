"use client";

import Header from "@/components/layout/Header";
import ScheduleView from "@/components/layout/ScheduleView";
import EventModal from "@/components/layout/EventModal";

export default function TimelinePage() {
  return (
    <>
      <Header title="Timeline" subtitle="Academics" />
      <div className="flex-grow overflow-y-auto pr-1 pb-6 flex flex-col gap-6 text-left select-none w-full no-scrollbar">
        <div className="w-full px-2 md:px-4 flex flex-col gap-6">
          <ScheduleView />
        </div>
      </div>
      <EventModal />
    </>
  );
}

"use client";

import Header from "../../../components/views/Header";
import ScheduleView from "../../../components/views/ScheduleView";
import EventModal from "../../../components/views/EventModal";

export default function SchedulePage() {
  return (
    <>
      {/* Header Panel */}
      <Header />

      {/* Schedule Grid Matrix */}
      <ScheduleView />

      {/* Interactive Add/View Event Modal */}
      <EventModal />
    </>
  );
}

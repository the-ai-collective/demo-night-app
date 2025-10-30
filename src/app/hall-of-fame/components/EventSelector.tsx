"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Expand } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "~/lib/utils";
import type { CompleteEvent } from "~/server/api/routers/event";

interface EventSelectorProps {
  events: CompleteEvent[];
  onEventChange: (event: CompleteEvent) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function EventSelector({
  events,
  onEventChange,
  isOpen,
  setIsOpen,
}: EventSelectorProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = typeof isOpen === "boolean" ? isOpen : internalExpanded;
  const setIsExpanded = setIsOpen ?? setInternalExpanded;
  const [selectedEvent, setSelectedEvent] = useState(events[0]!);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    },
    [setIsExpanded],
  );

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [isExpanded, onKeyDown]);

  const handleEventSelect = (event: CompleteEvent) => {
    setSelectedEvent(event);
    onEventChange(event);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Only show the clickable card if using internal state (not controlled by parent) */}
      {typeof isOpen !== "boolean" && (
        <div
          onClick={toggleExpand}
          className="flex w-full cursor-pointer flex-row items-center justify-between rounded-lg bg-white/80 px-4 py-3 text-center text-lg font-semibold shadow-lg backdrop-blur transition-all duration-300 ease-in-out hover:bg-gray-100/80"
        >
          <motion.div
            key={selectedEvent.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-row gap-2"
          >
            <p>{selectedEvent.name}</p>
          </motion.div>
          <Expand size={22} strokeWidth={2.25} color="black" />
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[15] h-full w-full bg-black/30 backdrop-blur"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: "50%" }}
              animate={{ opacity: 1, scale: 1, y: "0%" }}
              exit={{ opacity: 0, scale: 0.5, y: "50%" }}
              className="m-auto mt-24 flex max-w-xl flex-col"
            >
              <div className="p-4 pb-0">
                <div className="left-0 z-20 m-auto flex w-full max-w-xl flex-col rounded-lg bg-black/60 px-4 pb-2 pt-3 shadow-xl backdrop-blur-lg backdrop-brightness-150">
                  <h1 className="text-2xl font-bold text-white">
                    Select a Demo Night
                  </h1>
                  <p className="pb-2 text-lg font-semibold italic leading-6 text-gray-200">
                    Choose a past event to view its winners and demos
                  </p>
                </div>
              </div>
              <div className="left-0 z-20 flex max-h-[calc(100vh-4rem)] w-full flex-col gap-2 overflow-y-auto p-4 pb-[60vh]">
                {events.map((event, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: -(index + 1) * 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -(index + 1) * 30 }}
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className={cn(
                      "flex cursor-pointer flex-row items-center justify-between gap-2 rounded-lg bg-white/80 px-4 py-3 text-lg font-semibold shadow-xl backdrop-blur-lg backdrop-brightness-150 hover:bg-gray-100/80 focus:outline-none",
                      selectedEvent.id === event.id &&
                        "bg-yellow-200/80 hover:bg-yellow-300/70",
                    )}
                  >
                    <div className="flex w-full flex-col leading-6">
                      <p>{event.name}</p>
                      <p className="text-sm font-semibold italic leading-5 text-gray-700">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

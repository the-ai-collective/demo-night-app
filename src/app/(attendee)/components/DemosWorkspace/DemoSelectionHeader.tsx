import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "~/lib/utils";
import { type PublicDemo } from "~/server/api/routers/event";

export function DemoSelectionHeader({
  demos,
  selectedDemo,
  setSelectedDemo,
  currentDemoId,
}: {
  demos: PublicDemo[];
  selectedDemo: PublicDemo | undefined;
  setSelectedDemo: (demo: PublicDemo) => void;
  currentDemoId: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const votableIndices = useMemo(() => {
    const votableDemos = demos.filter((d) => d.votable);
    return new Map(votableDemos.map((d, i) => [d.id, i + 1]));
  }, [demos]);

  return (
    <>
      <div className="fixed z-20 w-full max-w-xl select-none px-4">
        <div
          onClick={toggleExpand}
          className={cn(
            "flex w-full cursor-pointer flex-row items-center justify-between rounded-xl px-4 py-3 text-center text-lg font-semibold shadow-lg backdrop-blur transition-all duration-300 ease-in-out",
            selectedDemo?.id === currentDemoId
              ? "bg-green-400/50"
              : "bg-green-400/50",
            isExpanded ? " bg-black/40 hover:bg-black/50" : "",
          )}
        >
          <motion.div
            key={selectedDemo ? selectedDemo.id : "none"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-row gap-2"
          >
            {(isExpanded && (
              <p className="italic text-white">Select a demo:</p>
            )) || (
              <>
                <p className="w-7">
                  {votableIndices.get(selectedDemo?.id ?? "") ?? "-"}
                </p>
                <p>
                  {selectedDemo?.name ?? ""}
                  <span className="font-bold text-green-700">
                    {selectedDemo?.id !== currentDemoId
                      ? " (NOT current!)"
                      : ""}
                  </span>
                </p>
              </>
            )}
          </motion.div>
          <ChevronDown
            size={28}
            strokeWidth={2.25}
            color={isExpanded ? "white" : "black"}
            className={cn(
              "transform transition-transform duration-300 ease-in-out",
              isExpanded ? "rotate-180" : "",
            )}
          />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute left-0 flex max-h-[calc(100vh-4rem)] w-full flex-col gap-2 overflow-y-auto px-4 pb-[60vh] pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {demos.map((demo) => (
                <motion.div
                  initial={{ opacity: 0, y: -(demo.index + 1) * 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -(demo.index + 1) * 30 }}
                  key={demo.id}
                  onClick={() => {
                    setSelectedDemo(demo);
                    setIsExpanded(false);
                  }}
                  className={cn(
                    "flex cursor-pointer flex-row items-center justify-between gap-2 rounded-xl px-4 py-3 text-lg font-semibold shadow-xl backdrop-blur-lg backdrop-brightness-150 focus:outline-none",
                    demo.id === currentDemoId
                      ? "bg-green-300/80 hover:bg-green-400/80"
                      : "bg-white/60 hover:bg-green-200/60",
                  )}
                >
                  <div className="flex flex-row gap-2">
                    <p className="w-7">{votableIndices.get(demo.id) ?? "-"}</p>
                    <p>
                      {demo.name}
                      <span className="font-bold text-green-700">
                        {demo.id === currentDemoId ? " (current)" : ""}
                      </span>
                    </p>
                  </div>
                  {selectedDemo?.id === demo.id && (
                    <CircleCheck size={23} strokeWidth={2.25} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-0 z-[15] h-full w-full bg-black/20 backdrop-blur"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

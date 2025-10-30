import { usePresentationContext } from "../contexts/PresentationContext";
import { type Award } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ConfettiExplosion from "react-dom-confetti";

import { EventPhase } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";
import { type PublicDemo } from "~/server/api/routers/event";

import { LogoConfetti, ResultsConfetti } from "~/components/Confetti";

export default function AwardsPresentation() {
  const { currentEvent, event } = usePresentationContext();
  const config = event.config as EventConfig;
  const isPitchNight = config?.isPitchNight ?? false;

  const awards = [...event.awards].reverse();

  const currentAwardIndex = awards.findIndex(
    (a) => a.id === currentEvent.currentAwardId,
  );

  const title = useMemo(() => {
    switch (currentEvent.phase) {
      case EventPhase.Voting:
        return isPitchNight ? "Investing Time! 💰" : "Voting Time! 🗳️";
      case EventPhase.Results:
        return isPitchNight ? "Investment Results! 🤩" : "Voting Results! 🤩";
      case EventPhase.Recap:
        return "Event Recap! 🎉";
      default:
        return "Awards Presentation";
    }
  }, [currentEvent.phase, isPitchNight]);

  return (
    <>
      <div className="flex size-full min-h-[calc(100dvh-80px)] flex-col items-center justify-center gap-4 p-4 pb-20">
        <motion.h1
          key={title}
          initial={{ opacity: 0, scale: 0.75, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.75, x: -100 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center font-kallisto text-4xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>
        <div className="flex w-full flex-col gap-8">
          {awards.map((award, index) => (
            <AwardWinnerItem
              key={award.id}
              award={award}
              demos={event?.demos}
              show={index <= (currentAwardIndex ?? -1)}
            />
          ))}
        </div>
      </div>
      <div className="z-3 pointer-events-none fixed inset-0">
        <ResultsConfetti currentAwardIndex={currentAwardIndex} />
        <LogoConfetti run={currentEvent.phase === EventPhase.Recap} />
      </div>
    </>
  );
}

function AwardWinnerItem({
  award,
  demos,
  show,
}: {
  award: Award;
  demos: PublicDemo[];
  show: boolean;
}) {
  const winner = show ? demos.find((demo) => demo.id === award.winnerId) : null;
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    if (winner !== null) {
      setTimeout(() => {
        setIsExploding(true);
      }, 2000);
    } else {
      setIsExploding(false);
    }
  }, [winner]);

  return (
    <div className="flex flex-col font-medium">
      <h2 className="font-kallisto text-2xl font-bold">{award.name}</h2>
      <p className="text-md pb-2 pl-[2px] text-lg font-semibold italic leading-6 text-gray-500">
        {award.description}
      </p>
      <div className="m-auto w-1 translate-y-20">
        <ConfettiExplosion
          active={isExploding}
          config={{
            elementCount: 500,
            duration: 5000,
            stagger: 2,
          }}
        />
      </div>
      <AnimatePresence initial={false} mode="popLayout">
        {winner ? (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { delay: 2.0, duration: 1.5, type: "spring" },
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="z-10 flex min-h-28 flex-col rounded-lg bg-yellow-300/50 p-4 shadow-xl backdrop-blur"
          >
            <h2 className="font-kallisto text-2xl font-bold">{winner.name}</h2>
            <p className="italic leading-5 text-gray-700">
              {winner.description}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="group z-10 flex min-h-28 items-center justify-center rounded-lg bg-gray-300/50 p-4 shadow-xl backdrop-blur"
          >
            <h2 className="text-4xl">🤫</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

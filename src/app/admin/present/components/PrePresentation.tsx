import { usePresentationContext } from "../contexts/PresentationContext";
import { type Demo } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { LogoConfetti } from "~/components/Confetti";

import { env } from "~/env";

export default function PrePresentation() {
  const { event } = usePresentationContext();
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoIndex((prev) => (prev + 1) % event.demos.length);
    }, 5_000);

    return () => clearInterval(interval);
  }, [event.demos.length]);

  const demo = event.demos[demoIndex]!;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-8 p-4">
      <div className="z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-300/50 p-4 pb-2 shadow-xl backdrop-blur">
        <QRCode value={env.NEXT_PUBLIC_URL} bgColor="transparent" size={256} />
        <p className="text-center text-lg font-bold italic text-gray-500">
          Scan to join! 🚀
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <h2 className="w-full font-kallisto text-2xl font-bold">
          Upcoming Demos 🧑‍💻
        </h2>
        <div className="z-10 flex w-full flex-row">
          <AnimatePresence initial={false} mode="wait">
            <DemoItem key={demo.id} demo={demo} />
          </AnimatePresence>
        </div>
      </div>
      <div className="z-3 pointer-events-none fixed inset-0">
        <LogoConfetti />
      </div>
    </div>
  );
}

function DemoItem({ demo }: { demo: Demo }) {
  return (
    <motion.div
      key={demo.id}
      initial={{ opacity: 0, x: 100, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.75 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="group z-10 flex w-full flex-col gap-1 rounded-lg bg-gray-300/50 p-4 font-medium leading-6 shadow-xl backdrop-blur"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="group/inner flex items-center gap-2">
          <h3 className="line-clamp-1 text-xl font-bold group-hover/inner:underline">
            {demo.name}
          </h3>
        </div>
      </div>
      <p className="italic leading-5 text-gray-700">{demo.description}</p>
    </motion.div>
  );
}

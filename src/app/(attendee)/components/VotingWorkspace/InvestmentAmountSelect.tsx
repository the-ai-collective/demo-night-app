"use client";

import { type Award, type Vote } from "@prisma/client";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";

import useWindowSize from "~/lib/hooks/useWindowSize";
import { cn } from "~/lib/utils";
import { type PublicDemo } from "~/server/api/routers/event";
import { api } from "~/trpc/react";

const TOTAL_BUDGET = 100000; // $100k
const INCREMENT_25K = 25000; // $25k
const INCREMENT_5K = 5000; // $5k

export default function InvestmentAmountSelect({
  award,
  demos,
  eventId,
  attendeeId,
}: {
  award: Award;
  demos: PublicDemo[];
  eventId: string;
  attendeeId: string;
}) {
  const [investments, setInvestments] = useState<Record<string, number>>({});
  const [confettiPieces, setConfettiPieces] = useState(0);
  const { windowSize } = useWindowSize();
  const confettiTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const { data: votesData } = api.vote.all.useQuery({
    eventId,
    attendeeId,
  }) as { data: [Vote] };

  const upsertMutation = api.vote.upsert.useMutation();

  // Load existing investments from votes
  useEffect(() => {
    if (votesData) {
      const awardVotes = votesData.filter((v: Vote) => v.awardId === award.id);
      const investmentMap: Record<string, number> = {};
      awardVotes.forEach((vote: Vote) => {
        if (vote.demoId && vote.amount) {
          investmentMap[vote.demoId] = vote.amount;
        }
      });
      setInvestments(investmentMap);
    }
  }, [votesData, award.id]);

  const totalInvested = Object.values(investments).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const remaining = TOTAL_BUDGET - totalInvested;

  const updateInvestment = (demoId: string, newAmount: number) => {
    const currentAmount = investments[demoId] ?? 0;
    const delta = newAmount - currentAmount;

    // Check if we have enough budget remaining
    if (delta > remaining) {
      toast.error(
        `Not enough budget! You have $${remaining / 1000}k remaining.`,
      );
      return;
    }

    // Update local state
    const newInvestments = { ...investments };
    if (newAmount === 0) {
      delete newInvestments[demoId];
    } else {
      newInvestments[demoId] = newAmount;
    }
    setInvestments(newInvestments);

    // Save to database
    upsertMutation.mutate(
      {
        eventId,
        attendeeId,
        awardId: award.id,
        demoId: newAmount === 0 ? null : demoId,
        amount: newAmount === 0 ? null : newAmount,
      },
      {
        onError: (error) => {
          toast.error(error.message);
          // Revert on error
          setInvestments(investments);
        },
      },
    );
  };

  const triggerConfetti = () => {
    // Confetti based on the increment amount ($10k = 80 pieces)
    const pieces = 20;
    setConfettiPieces(pieces);
    if (confettiTimeoutId.current) {
      clearTimeout(confettiTimeoutId.current);
    }
    confettiTimeoutId.current = setTimeout(() => {
      setConfettiPieces(0);
    }, 1500);
  };

  const increment = (demoId: string, incrementAmount: number) => {
    const current = investments[demoId] ?? 0;
    const newAmount = current + incrementAmount;
    updateInvestment(demoId, newAmount);
    triggerConfetti();
  };

  const decrement = (demoId: string, decrementAmount: number) => {
    const current = investments[demoId] ?? 0;
    if (current >= decrementAmount) {
      updateInvestment(demoId, current - decrementAmount);
      // No confetti on decrement (negative money)
    }
  };

  const votableDemos = demos.filter((demo) => demo.votable);

  const drawMoneyEmoji = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "40px sans-serif";
    ctx.fillText("💸", 0, 0);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Budget Tracker */}
      <div className="z-10 rounded-lg bg-green-800/70 p-4 text-white shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-xl font-bold">Your Scout Fund</p>
            <p className="text-sm font-medium text-white/80">
              ${totalInvested / 1000}k invested • ${remaining / 1000}k remaining
            </p>
          </div>
          <div className="text-right">
            <p className="font-kallisto text-2xl font-bold">
              ${remaining / 1000}k
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/40">
          <motion.div
            className="h-full bg-gradient-to-r from-white/60 to-white"
            initial={{ width: 0 }}
            animate={{ width: `${(totalInvested / TOTAL_BUDGET) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Investment List */}
      <div className="flex flex-col gap-3">
        {votableDemos.map((demo) => {
          const amount = investments[demo.id] ?? 0;
          const hasInvestment = amount > 0;

          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "z-10 flex flex-col gap-2 rounded-lg p-4 shadow-lg backdrop-blur transition-all",
                hasInvestment
                  ? "bg-gray-300/50 ring-2 ring-green-800/40"
                  : "bg-gray-300/50 hover:bg-gray-300/60",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xl font-bold leading-7">{demo.name}</p>
                  {demo.description && (
                    <p className="pb-0.5 font-medium italic leading-5 text-gray-700">
                      {demo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Investment Controls */}
              <div className="flex items-center justify-between gap-2">
                {/* Decrement Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => decrement(demo.id, INCREMENT_25K)}
                    disabled={amount < INCREMENT_25K}
                    className={cn(
                      "flex size-11 flex-col items-center justify-center rounded-full px-2 transition-all",
                      amount < INCREMENT_25K
                        ? "cursor-not-allowed bg-white/50 text-gray-400"
                        : "bg-red-600/70 text-white hover:bg-red-600/90 active:scale-95",
                    )}
                  >
                    <Minus size={16} strokeWidth={3.5} />
                    <span className="-mb-0.5 text-[11px] font-semibold leading-none">
                      25k
                    </span>
                  </button>
                  <button
                    onClick={() => decrement(demo.id, INCREMENT_5K)}
                    disabled={amount < INCREMENT_5K}
                    className={cn(
                      "flex size-11 flex-col items-center justify-center rounded-full px-2 transition-all",
                      amount < INCREMENT_5K
                        ? "cursor-not-allowed bg-white/50 text-gray-400"
                        : "bg-red-600/70 text-white hover:bg-red-600/90 active:scale-95",
                    )}
                  >
                    <Minus size={16} strokeWidth={3.5} />
                    <span className="-mb-0.5 text-[11px] font-semibold leading-none">
                      5k
                    </span>
                  </button>
                </div>

                {/* Amount Display */}
                <div className="flex flex-1 flex-col items-center font-kallisto">
                  <p className="text-2xl font-bold">
                    ${amount === 0 ? "0" : `${amount / 1000}k`}
                  </p>
                  {/* {amount > 0 && (
                    <p className="text-xs text-gray-600">
                      {((amount / TOTAL_BUDGET) * 100).toFixed(1)}% of budget
                    </p>
                  )} */}
                </div>

                {/* Increment Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => increment(demo.id, INCREMENT_5K)}
                    disabled={remaining < INCREMENT_5K}
                    className={cn(
                      "flex size-11 flex-col items-center justify-center rounded-full px-2 transition-all",
                      remaining < INCREMENT_5K
                        ? "cursor-not-allowed bg-white/50 text-gray-400"
                        : "bg-green-800/70 text-white hover:bg-green-800/90 active:scale-95",
                    )}
                  >
                    <Plus size={14} strokeWidth={3.5} />
                    <span className="-mb-0.5 text-[11px] font-semibold leading-none">
                      5k
                    </span>
                  </button>
                  <button
                    onClick={() => increment(demo.id, INCREMENT_25K)}
                    disabled={remaining < INCREMENT_25K}
                    className={cn(
                      "flex size-11 flex-col items-center justify-center rounded-full px-2 transition-all",
                      remaining < INCREMENT_25K
                        ? "cursor-not-allowed bg-white/50 text-gray-400"
                        : "bg-green-800/70 text-white hover:bg-green-800/90 active:scale-95",
                    )}
                  >
                    <Plus size={14} strokeWidth={3.5} />
                    <span className="-mb-0.5 text-[11px] font-semibold leading-none">
                      25k
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="pointer-events-none fixed inset-0 z-[3]">
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          drawShape={drawMoneyEmoji}
          tweenDuration={1000}
          gravity={0.05}
          numberOfPieces={confettiPieces}
        />
      </div>
    </div>
  );
}

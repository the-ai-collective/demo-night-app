"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import type Particle from "react-confetti/dist/types/Particle";

import useWindowSize from "~/lib/hooks/useWindowSize";

import { type LocalFeedback } from "~/app/(attendee)/components/DemosWorkspace/hooks/useFeedback";

export function TellMeMoreConfetti({ feedback }: { feedback: LocalFeedback }) {
  const { windowSize } = useWindowSize();
  const [_active, _setActive] = useState(false);
  const [previousFeedbackDemoId, setPreviousFeedbackDemoId] =
    useState<string>("");
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (feedback.demoId !== previousFeedbackDemoId) {
      setPreviousFeedbackDemoId(feedback.demoId);
      _setActive(false);
      return;
    }
    if (feedback.tellMeMore) {
      _setActive(true);
      timeoutId.current = setTimeout(() => {
        _setActive(false);
      }, 1000);
    } else {
      _setActive(false);
    }
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [feedback.demoId, feedback.tellMeMore]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawShape = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "30px sans-serif";
    ctx.fillText("📧", 0, 0);
  };

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      drawShape={drawShape}
      tweenDuration={1000}
      gravity={0.05}
      numberOfPieces={_active ? 300 : 0}
    />
  );
}

export function ClapsConfetti({ feedback }: { feedback: LocalFeedback }) {
  const { windowSize } = useWindowSize();
  const [_active, _setActive] = useState(false);
  const [previousFeedbackDemoId, setPreviousFeedbackDemoId] =
    useState<string>("");
  const [previousClaps, setPreviousClaps] = useState(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (feedback.demoId !== previousFeedbackDemoId) {
      setPreviousFeedbackDemoId(feedback.demoId);
      setPreviousClaps(feedback.claps);
      _setActive(false);
      return;
    }
    if (feedback.claps > previousClaps) {
      _setActive(true);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(
        () => {
          _setActive(false);
        },
        100 * (feedback.claps - previousClaps),
      );
    }
    setPreviousClaps(feedback.claps);
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [feedback.demoId, feedback.claps]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawShape = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "40px sans-serif";
    ctx.fillText("👏", 0, 0);
  };

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      drawShape={drawShape}
      tweenDuration={10000}
      gravity={0.05}
      numberOfPieces={_active ? 50 : 0}
    />
  );
}

export function ResultsConfetti({
  currentAwardIndex,
}: {
  currentAwardIndex: number | null;
}) {
  const { windowSize } = useWindowSize();
  const [_active, _setActive] = useState(false);
  const [previousAwardIndex, setPreviousAwardIndex] = useState<number | null>(
    currentAwardIndex,
  );
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      currentAwardIndex !== null &&
      (previousAwardIndex == null || currentAwardIndex > previousAwardIndex)
    ) {
      _setActive(true);
      timeoutId.current = setTimeout(() => {
        _setActive(false);
      }, 3000);
    } else {
      _setActive(false);
    }
    setPreviousAwardIndex(currentAwardIndex);
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [currentAwardIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      tweenDuration={3000}
      gravity={0.05}
      colors={["#22c55e", "#4ade80", "#86efac", "#a7f3d0", "#d1fae5"]}
      numberOfPieces={_active ? 500 : 0}
    />
  );
}

export function LogoConfetti({ run = true }: { run?: boolean }) {
  const { windowSize } = useWindowSize();
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const logoElements = Array.from(
      document.getElementsByClassName("logo"),
    ).filter((el): el is HTMLImageElement => el instanceof HTMLImageElement);

    // Create new Image objects and wait for them to load
    const loadImages = logoElements.map((logoEl) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = logoEl.src;
      });
    });

    void Promise.all(loadImages).then(setImages);
  }, []); // Only run once on mount

  const drawShape = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (!images || images.length === 0) return;
    const img = images[particle.shape % images.length];
    if (!img || !(img instanceof HTMLImageElement)) return;
    try {
      ctx.drawImage(img, -18, -18, 36, 36);
    } catch (error) {
      console.error("Error drawing image:", error);
    }
  };

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      drawShape={drawShape}
      basicFloat={true}
      numberOfShapes={images.length}
      initialVelocityY={{ min: -10, max: 0 }}
      tweenDuration={30_000}
      gravity={0.01}
      numberOfPieces={20}
      run={run}
    />
  );
}

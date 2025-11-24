"use client";

import { useState } from "react";
import { SmileIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";

// Curated list of place-related emojis
const PLACE_EMOJIS = [
  // Cities & Landmarks
  "🌉", // Golden Gate Bridge (SF)
  "🗽", // Statue of Liberty (NYC)
  "🏛️", // Building (DC/Boston)
  "🌴", // Palm Tree (LA/Miami)
  "🌆", // Cityscape
  "🌃", // Night Cityscape
  "🏙️", // City Buildings
  "🌁", // Foggy (SF)
  "🌊", // Ocean/Waves
  "⛰️", // Mountain
  "🏔️", // Snow Mountain
  "🌋", // Volcano
  "🏜️", // Desert
  "🏝️", // Island
  "🏖️", // Beach
  // Buildings & Structures
  "🏰", // Castle
  "🏯", // Japanese Castle
  "🏟️", // Stadium
  "🎪", // Circus Tent
  "🎭", // Theater
  "🎨", // Art/Arts District
  "📚", // Library/Books
  "🎓", // University
  "🏫", // School
  "🏢", // Office Building
  "🏬", // Department Store
  "🏪", // Convenience Store
  "🏨", // Hotel
  "🏥", // Hospital
  "🏦", // Bank
  "⛪", // Church
  "🕌", // Mosque
  "🕍", // Synagogue
  "⛩️", // Shrine
  // Transportation
  "🚇", // Metro/Subway
  "✈️", // Airplane
  "🚢", // Ship
  "🚂", // Locomotive
  "🚁", // Helicopter
  // Nature & Geography
  "🌲", // Evergreen Tree
  "🌳", // Deciduous Tree
  "🌵", // Cactus
  "🌾", // Rice/Grain
  "🌿", // Herb
  "🍀", // Four Leaf Clover
  "🌺", // Hibiscus
  "🌻", // Sunflower
  "🌷", // Tulip
  "🌹", // Rose
  "🌼", // Daisy
  "🌸", // Cherry Blossom
  "🌎", // Globe Americas
  "🌍", // Globe Europe-Africa
  "🌏", // Globe Asia-Australia
  // Food & Culture
  "🍕", // Pizza (NYC)
  "🌮", // Taco
  "🍜", // Noodles
  "🍣", // Sushi
  "☕", // Coffee
  "🍺", // Beer
  "🎵", // Music
  "🎸", // Guitar
  "🎹", // Piano
  "🎤", // Microphone
  // Weather & Sky
  "☀️", // Sun
  "🌙", // Moon
  "⭐", // Star
  "🌟", // Glowing Star
  "💫", // Dizzy Star
  "🌈", // Rainbow
  "☁️", // Cloud
  "⛈️", // Thunderstorm
  "❄️", // Snowflake
  "🔥", // Fire
];

interface EmojiPickerProps {
  value: string;
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({
  value,
  onEmojiSelect,
  disabled = false,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {value ? (
                <span className="text-2xl">{value}</span>
              ) : (
                <>
                  <SmileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Select an emoji
                  </span>
                </>
              )}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Place Emoji</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-8 gap-2 p-2">
            {PLACE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setOpen(false);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-md text-2xl transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <div className="text-xs text-muted-foreground">
            Click an emoji to select it
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


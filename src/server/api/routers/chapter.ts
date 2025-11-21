import { type Chapter } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  // Get all chapters
  all: publicProcedure.query(async (): Promise<Chapter[]> => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get all chapters with event counts (for admin)
  allWithCounts: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }),

  // Get a single chapter
  get: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<Chapter | null> => {
      return db.chapter.findUnique({
        where: { id: input },
      });
    }),

  // Create a new chapter
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        emoji: z.string().min(1, "Emoji is required"),
      }),
    )
    .mutation(async ({ input }): Promise<Chapter> => {
      return db.chapter.create({
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      });
    }),

  // Update a chapter
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        emoji: z.string().min(1, "Emoji is required").optional(),
      }),
    )
    .mutation(async ({ input }): Promise<Chapter> => {
      const { id, ...data } = input;
      return db.chapter.update({
        where: { id },
        data,
      });
    }),

  // Delete a chapter
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }): Promise<void> => {
      // When a chapter is deleted, events will have their chapterId set to null
      // due to the onDelete: SetNull in the schema
      await db.chapter.delete({
        where: { id: input },
      });
    }),

  // Bulk create random chapters (for testing)
  createRandomBulk: protectedProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100),
      }),
    )
    .mutation(async ({ input }): Promise<{ count: number }> => {
      const interestingWords = [
        "Quantum", "Nebula", "Phoenix", "Crystal", "Thunder", "Shadow", "Cosmic",
        "Mystic", "Azure", "Crimson", "Golden", "Silver", "Emerald", "Sapphire",
        "Ruby", "Diamond", "Stellar", "Lunar", "Solar", "Astral", "Ethereal",
        "Celestial", "Radiant", "Luminous", "Infinite", "Eternal", "Ancient",
        "Modern", "Future", "Digital", "Analog", "Virtual", "Reality", "Dream",
        "Vision", "Horizon", "Summit", "Valley", "Ocean", "Mountain", "Forest",
        "Desert", "Arctic", "Tropical", "Urban", "Rural", "Metro", "Cyber",
        "Nano", "Mega", "Ultra", "Super", "Hyper", "Alpha", "Beta", "Gamma",
        "Delta", "Omega", "Prime", "Nova", "Star", "Moon", "Sun", "Comet",
        "Galaxy", "Universe", "Cosmos", "Void", "Nexus", "Core", "Edge", "Apex",
        "Zenith", "Nadir", "Vertex", "Vortex", "Matrix", "Vector", "Tensor",
        "Scalar", "Quantum", "Photon", "Electron", "Neutron", "Proton", "Atom",
        "Molecule", "Particle", "Wave", "Field", "Force", "Energy", "Power",
        "Velocity", "Momentum", "Inertia", "Gravity", "Magnetism", "Electric",
        "Thermal", "Nuclear", "Fusion", "Fission", "Plasma", "Liquid", "Solid",
        "Gas", "Crystal", "Prism", "Lens", "Mirror", "Reflection", "Refraction",
        "Diffraction", "Interference", "Resonance", "Harmony", "Discord", "Chaos",
        "Order", "Balance", "Symmetry", "Asymmetry", "Pattern", "Fractal", "Spiral",
        "Helix", "Curve", "Line", "Point", "Plane", "Space", "Time", "Dimension",
        "Parallel", "Perpendicular", "Tangent", "Arc", "Circle", "Square", "Triangle",
        "Polygon", "Polyhedron", "Sphere", "Cube", "Pyramid", "Cone", "Cylinder",
        "Torus", "Helix", "Spiral", "Vortex", "Whirl", "Spin", "Rotate", "Orbit",
        "Revolve", "Circle", "Cycle", "Loop", "Iterate", "Recurse", "Branch",
        "Merge", "Split", "Join", "Connect", "Link", "Node", "Graph", "Tree",
        "Network", "Web", "Mesh", "Grid", "Lattice", "Array", "Matrix", "Table",
        "Stack", "Queue", "Heap", "Hash", "Map", "Set", "List", "Vector",
        "Tensor", "Scalar", "Vector", "Matrix", "Array", "Tuple", "Record",
        "Struct", "Class", "Object", "Instance", "Entity", "Component", "System",
      ];

      const emojis = [
        "🚀", "⚡", "🔥", "💎", "🌟", "✨", "🎯", "🎨", "🎭", "🎪",
        "🎢", "🎡", "🎠", "🎰", "🎲", "🎮", "🎯", "🎳", "🎸", "🎹",
        "🎺", "🎻", "🎤", "🎧", "🎬", "🎭", "🎪", "🎨", "🎰", "🎲",
        "🌈", "🌊", "🌋", "🌌", "🌠", "🌟", "🌞", "🌝", "🌚", "🌕",
        "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "⭐", "🌟",
        "💫", "✨", "🌠", "🌌", "🌃", "🌆", "🌇", "🌉", "🌄", "🏔️",
      ];

      const chapters = [];
      for (let i = 0; i < input.count; i++) {
        // Pick 1-3 random words
        const wordCount = Math.floor(Math.random() * 3) + 1;
        const words = [];
        for (let j = 0; j < wordCount; j++) {
          words.push(interestingWords[Math.floor(Math.random() * interestingWords.length)]!);
        }
        const name = words.join(" ");
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]!;

        chapters.push({
          name,
          emoji,
        });
      }

      await db.chapter.createMany({
        data: chapters,
        skipDuplicates: true,
      });

      return { count: input.count };
    }),
});

# AI Media Curator — Product Requirements Document
**Demo Night App · Feature Proposal**
**Author:** Robert Gilliam | **Date:** November 21, 2025

---

## Problem Statement

**What:** Event organizers lack time/expertise to transform raw Demo Night footage into polished recap content (highlight reels, demo clips, social media posts). Result: presenters miss promotional assets, organizers can't amplify events, sponsor value remains unrealized.

**Who:**
- Event organizers (AI Collective chapters) — manual editing bottleneck
- Presenters — need shareable demo clips for promotion
- Attendees — want to revisit best moments
- Marketing/sponsors — require post-event media assets

**Evidence:** Demo Night infrastructure already captures structured data (event timelines, voting results, presenter submissions, moderator workflows) but produces zero automated media output.

---

## Proposed Solution

AI-powered autonomous media studio that ingests event footage (live streams, uploads, screen shares), analyzes content via multimodal AI, and generates professional video outputs:
- Highlight reels (3-5 min event recaps)
- Per-presenter demo clips
- Award announcement videos
- Social-ready clips (Instagram/TikTok/LinkedIn formats)
- Auto-publishing to YouTube with SEO-optimized metadata

Moderators control creative direction via natural language prompts (e.g., "energetic tech vibe with electronic music"). System orchestrates end-to-end pipeline: ingest → AI analysis → curation → generation → composition → distribution.

---

## User Stories

1. **As an event organizer**, I want auto-generated highlight reels after each Demo Night, so I can share recaps without manual editing labor.

2. **As a presenter**, I want a personalized clip of my demo delivered via email, so I can promote my startup on social media.

3. **As a moderator**, I want to define video style/tone with a text prompt, so output matches event brand without learning editing tools.

4. **As an attendee**, I want to revisit top demos and moments, so I can share them with my network and remember standout projects.

5. **As a marketing volunteer**, I want videos auto-published to YouTube/social channels, so post-event promotion requires zero manual intervention.

---

## Technical Architecture

### Stack Extensions

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Orchestration** | LangChain | Multi-agent workflow coordination |
| **Video Analysis** | Gemini 2.0 Flash | Scene understanding, quality scoring |
| **Transcription** | Deepgram Whisper | Real-time audio-to-text |
| **Music** | Suno API | Prompt-based soundtrack generation |
| **Voiceover** | ElevenLabs | AI voice synthesis |
| **Avatar** | Simli API | Host intro/outro generation |
| **Transitions** | Veo 3 | Text-to-video branded animations |
| **Video Processing** | FFmpeg | Splicing, encoding, multi-format render |
| **Live Ingest** | MediaMTX + Livekit | RTMP/WebRTC streaming |
| **Storage** | AWS S3 | Media object storage |
| **Job Queue** | BullMQ (Redis) | Async processing orchestration |
| **Distribution** | YouTube Data API v3 | Auto-publishing |
| **Notifications** | AWS SES | Email delivery (existing) |

### Database Schema (Prisma Extensions)

```prisma
model MediaAsset {
  id          String   @id @default(cuid())
  eventId     String
  type        MediaAssetType  // VIDEO, AUDIO, SCREEN_SHARE, CAMERA_FEED
  source      MediaSource     // LIVE_STREAM, UPLOAD, GENERATED
  storageKey  String          // S3 key
  duration    Int?
  transcript  String?         // Deepgram output
  analysis    Json?           // Gemini metadata: highlights, scores, timestamps
  demoId      String?
  createdAt   DateTime @default(now())

  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  demo        Demo?    @relation(fields: [demoId], references: [id])
  jobs        MediaCurationJob[]
}

model MediaCurationJob {
  id          String   @id @default(cuid())
  eventId     String
  status      JobStatus       // QUEUED, PROCESSING, COMPLETED, FAILED
  jobType     CurationType    // HIGHLIGHT_REEL, DEMO_CLIP, RESULTS_VIDEO, SOCIAL_CLIP
  prompt      String          // Moderator creative direction
  config      Json            // Style, duration, aspect ratio, branding
  phase       JobPhase        // INGEST, ANALYZE, SELECT, GENERATE, COMPOSE, EXPORT
  progress    Int     @default(0)
  agentState  Json?           // LangChain agent memory
  logs        Json[]

  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  sourceAssets    MediaAsset[]  @relation("JobSources")
  outputs         MediaOutput[]

  createdAt   DateTime @default(now())
  completedAt DateTime?
}

model MediaOutput {
  id          String   @id @default(cuid())
  jobId       String
  outputType  OutputType      // FINAL_VIDEO, SOCIAL_CLIP, PRESENTER_CLIP, THUMBNAIL
  storageKey  String
  url         String?
  published   Boolean  @default(false)
  youtubeId   String?
  publishedAt DateTime?
  metadata    Json

  job         MediaCurationJob @relation(fields: [jobId], references: [id], onDelete: Cascade)
}
```

### LangChain Agent Pipeline

**Hierarchical Multi-Agent System** (Coordinator delegates to specialized sub-agents):

1. **Coordinator Agent** (ReAct)
   - Parses moderator prompt, plans execution, manages job state
   - **Tools:** `getEventData`, `listMediaAssets`, `updateJobPhase`

2. **Analysis Agent** (Video Understanding)
   - Gemini 2.0 Flash for scene detection, quality scoring, reaction detection
   - Deepgram Whisper for transcription, FFmpeg for scene boundaries
   - Cross-references event timeline from Redis cache
   - **Tools:** `analyzeVideoWithGemini`, `transcribeAudio`, `detectSceneChanges`

3. **Selection Agent** (Content Curation)
   - Scores clips: `qualityScore × feedbackScore × promptAlignment`
   - Generates Editing Decision List (EDL) with timestamps
   - **Tools:** `getFeedbackData`, `getVotingResults`, `scoreClip`, `generateEDL`

4. **Generation Agent** (Asset Creation)
   - Suno: Background music from prompt (e.g., "energetic electronic, 3min")
   - ElevenLabs: Script-to-voice for narration
   - Simli: Host avatar for intros/outros
   - Veo 3: Custom branded transitions
   - **Tools:** `generateMusic`, `synthesizeVoice`, `createAvatar`, `generateTransition`

5. **Composition Agent** (Video Assembly)
   - FFmpeg pipeline: splicing, audio mixing, overlays, branding
   - Multi-format render: 16:9 (YouTube), 9:16 (Instagram/TikTok), 1:1 (LinkedIn)
   - **Tools:** `spliceVideo`, `mixAudio`, `addOverlay`, `renderFinalVideo`

6. **Export Agent** (Distribution)
   - S3 upload with presigned URLs, YouTube auto-publish, email notifications
   - **Tools:** `uploadToS3`, `publishToYouTube`, `generateDownloadLink`, `sendEmail`

### Processing Workflow

```
PHASE 1: INGEST (Real-time)
├─ RTMP (MediaMTX): Cameras → S3 segments → MediaAsset(CAMERA_FEED)
├─ WebRTC (Livekit): Browsers/mobile → S3 recording → MediaAsset(SCREEN_SHARE)
└─ Upload: Presigned URLs → S3 → MediaAsset(UPLOAD)

PHASE 2: ANALYZE
├─ Coordinator.parsePrompt() → execution plan
├─ Analysis.transcribeAudio(Deepgram) → transcript
├─ Analysis.analyzeVideo(Gemini, "detect demos, rate quality, find reactions") → JSON metadata
└─ Store in MediaAsset.analysis

PHASE 3: SELECT
├─ Selection.getFeedbackData(Prisma) → scores/votes
├─ Selection.scoreClip() → ranked highlights
└─ Selection.generateEDL() → [intro(0:00-0:15), demo1(0:15-1:30), transition(1:30-1:35), ...]

PHASE 4: GENERATE (Parallel)
├─ Suno.generateMusic("upbeat tech, 3min, instrumental") → audio.mp3
├─ ElevenLabs.synthesize("Welcome to Demo Night...") → voiceover.mp3
├─ Simli.createAvatar(script, profile) → avatar_intro.mp4
└─ Veo3.generateVideo("logo transition, 5s") → transition.mp4

PHASE 5: COMPOSE
├─ FFmpeg.concat(EDL clips) → base_timeline.mp4
├─ FFmpeg.addAudio(music, volume=0.2, fade) + FFmpeg.overlay(avatar, transitions, text)
└─ FFmpeg.encode([1920x1080, 1080x1920, 1080x1080]) → MediaOutput[]

PHASE 6: EXPORT
├─ S3.putObject(videos) → CDN URLs
├─ YouTube.videos.insert(title, description, tags) → youtubeId
├─ Presigned URLs (7-day expiry) for presenter downloads
└─ SES.sendEmail(Demo.email, "Your clip is ready: {url}")
```

### API Layer (tRPC Router)

**New Router:** `src/server/api/routers/media.ts`

```typescript
export const mediaRouter = createTRPCRouter({
  listAssets: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(/* Fetch MediaAssets */),

  getUploadUrl: protectedProcedure
    .input(z.object({ eventId: z.string(), filename: z.string() }))
    .mutation(/* S3 presigned URL */),

  createCurationJob: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      jobType: z.enum(['HIGHLIGHT_REEL', 'DEMO_CLIP', 'RESULTS_VIDEO']),
      prompt: z.string(),
      config: z.object({ /* style, duration, aspect, branding */ })
    }))
    .mutation(/* Create job, enqueue to BullMQ, return job ID */),

  getJobStatus: protectedProcedure
    .input(z.string())
    .query(/* Fetch job with progress/logs */),

  listOutputs: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(/* Fetch MediaOutputs */),

  publishToYouTube: protectedProcedure
    .input(z.object({ outputId: z.string() }))
    .mutation(/* Trigger YouTube upload */),
});
```

**Add to `src/server/api/root.ts`:**
```typescript
export const appRouter = createTRPCRouter({
  // ... existing routers
  media: mediaRouter,
});
```

### UI Components

**Admin Dashboard** (`src/app/admin/[eventId]/components/MediaCurator/`):

1. **MediaCuratorTab.tsx**
   - Drag-drop upload with progress bars
   - Live stream status (RTMP endpoints, active feeds)
   - Asset library (thumbnails, search/filter)

2. **CurationJobPanel.tsx**
   - Prompt textarea with style presets ("energetic", "professional", "casual")
   - Job type selector (highlight/demo/results/social)
   - Real-time progress tracking (phase indicators, logs)

3. **OutputGallery.tsx**
   - Video player with format selector (YouTube/Instagram/LinkedIn)
   - Publish controls (YouTube upload, share links)
   - Presenter distribution (email clips)
   - Analytics (views, engagement from YouTube API)

4. **LiveStreamMonitor.tsx**
   - Multi-camera HLS grid view
   - Stream health metrics (bitrate, dropped frames)
   - Record controls (start/stop, switch camera)

---

## Implementation Plan

| Phase | Duration | Deliverables | Milestone |
|-------|----------|-------------|-----------|
| **1. Foundation** | 2 weeks | DB schema migration, S3 setup, upload UI, tRPC media router | Organizers upload/view footage |
| **2. AI Pipeline** | 3 weeks | LangChain framework, Gemini/Deepgram integration, Selection agent, BullMQ queue | System identifies highlights |
| **3. Generation** | 2 weeks | Generation Agent, Suno/ElevenLabs APIs, FFmpeg composition, multi-format render | End-to-end highlight reel |
| **4. Distribution** | 1 week | Export Agent, YouTube API, email notifications, admin UI polish | Upload → YouTube publish |
| **5. Live Streaming** | 2 weeks | MediaMTX/Livekit, real-time ingest, monitoring UI | Live event capture (optional) |

**Total:** 8-10 weeks (Phases 1-4 required, Phase 5 optional)

---

## Success Metrics

**Adoption:**
- 80% of events using AI Media Curator within 6 months
- Baseline media uploads per event (track growth)

**Quality:**
- Organizer satisfaction: 4+/5 (survey)
- Job success rate: 95% without manual intervention

**Impact:**
- Presenter satisfaction with clips: 4+/5
- Time saved vs. manual editing: 10+ hours/event
- YouTube views: auto-generated ≥ manual edits

**Engagement:**
- Social shares of generated content
- YouTube watch time: >50% avg view duration

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| **AI quality below expectations** | Style presets, preview capabilities, regenerate with refined prompts, human review step |
| **High API costs** (Gemini/Suno/ElevenLabs) | Use Gemini Flash (cheaper), cache/reuse music/avatar templates, usage quotas per tier |
| **Unsupported video codecs/formats** | FFprobe validation on upload, clear format guidelines, auto-transcode problematic files |
| **Live streaming reliability** | Make Phase 5 optional, robust upload fallback, battle-tested MediaMTX |

**Additional Considerations:**
- **Performance:** Streaming S3 reads, FFmpeg in Docker containers, parallel agent execution
- **Scalability:** Worker pool (BullMQ), S3 multipart uploads (>100MB), CloudFront CDN
- **Cost:** Gemini Flash, S3 Intelligent-Tiering, pre-generated music/avatar templates
- **Security:** Presigned URLs (24h upload, 7d download), encrypted YouTube OAuth (NextAuth), rate limits
- **Monitoring:** SNS → Slack alerts, CloudWatch metrics, agent decision logs in `MediaCurationJob.logs`

---

## Complete Tool Call Reference

**Coordinator Agent:** `getEventData`, `listMediaAssets`, `updateJobPhase`
**Analysis Agent:** `analyzeVideoWithGemini`, `transcribeAudio`, `detectSceneChanges`
**Selection Agent:** `getFeedbackData`, `getVotingResults`, `scoreClip`, `generateEDL`
**Generation Agent:** `generateMusic`, `synthesizeVoice`, `createAvatar`, `generateTransition`
**Composition Agent:** `spliceVideo`, `mixAudio`, `addOverlay`, `renderFinalVideo`
**Export Agent:** `uploadToS3`, `publishToYouTube`, `generateDownloadLink`, `sendEmail`

---

## Technology Integration Summary

**Existing Stack (Reuse):**
- Next.js 14 (App Router), PostgreSQL, Prisma ORM, tRPC, NextAuth, Redis (BullMQ), Tailwind CSS, shadcn/ui, AWS credentials (S3/SES)

**New Integrations:**
- **AI/ML:** LangChain (orchestration), Gemini 2.0 Flash (video), Deepgram Whisper (audio), Suno (music), ElevenLabs (voice), Simli (avatar), Veo 3 (transitions)
- **Media:** FFmpeg (processing), MediaMTX (RTMP), Livekit (WebRTC)
- **Distribution:** YouTube Data API v3, AWS S3 (storage), CloudFront (CDN)

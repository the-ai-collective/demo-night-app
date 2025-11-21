# AI Media Curator — Feature Design Document
*Demo Night App – Product Engineering Proposal*  
*Author: Robert Gilliam*  
*Date: November 21, 2025*

---

## 1. Background
After exploring the Demo Night App’s codebase and flow (admin dashboard, submission process, and attendee experience), one major pattern emerges:

Demo Night produces a **lot** of raw media value (live demos, audience reactions, presenter energy), but **none** of that value is captured, processed, or shared automatically. Organizers must scramble to record footage, manually edit highlight clips, summarize winners, and promote events on social platforms. This is labor-intensive and often leads to media being unused or delayed for weeks.

Meanwhile, the app already has:
- structured event data,
- presenter submissions,
- a timeline of demos,
- voting results,
- and a dedicated moderator workflow.

This positions Demo Night perfectly to automate **professional-quality recap content** using AI.

---

## 2. Problem Statement

### What problem are we solving?
Event organizers lack the time, tools, and expertise to turn raw event footage into polished recap videos, highlight reels, and social-ready clips. As a result:
- Presenters do not receive promotional media.
- The AI Collective cannot amplify events effectively.
- Attendees have no easy way to re-experience the best demos.
- Sponsors lack post-event assets.

### Who experiences this problem?
- **Event organizers** (AI Collective chapter leaders): struggle to capture and edit media.
- **Presenters**: want shareable content to promote their demo.
- **Attendees**: miss moments or want recaps.
- **Marketing teams / volunteers**: lack bandwidth for video editing.

Without a solution, high-value content disappears after the event.

---

## 3. Proposed Solution — AI Media Curator
Add an **AI-based, fully automated media curator** into the Demo Night App. This feature collects event media (camera feeds, screen shares, uploaded videos), analyzes them using AI (Gemini, Veo3, etc.), and produces:
- highlight reels  
- social clips  
- presenter-specific recap videos  
- results announcement video  
- branded sponsor content  
- auto-publishing to YouTube/social channels  

Moderators control the creative direction by writing a **simple text prompt** that describes the style, tone, and focus of the final video.

The system uses an **agentic orchestration backend** that manages:
- ingest/import of media  
- highlight detection  
- music generation (Suno/Udio)  
- editing/splicing  
- AI narration or avatar intros  
- exporting  
- publishing  

This turns Demo Night into an **AI-powered media studio**, elevating the value of every event.

---

## 4. User Stories

1. **As an event organizer**, I want the system to automatically generate a highlight reel after each Demo Night, so that I can easily share recap content without manual editing.

2. **As a presenter**, I want to receive a personalized clip of my demo, so that I can promote my startup and gain visibility.

3. **As a moderator**, I want to define the style and tone of the recap video using a simple text prompt, so that the output aligns with the event’s vibe.

4. **As an attendee**, I want to revisit the best demos and moments from the event, so that I can share them with others and remember what stood out.

5. **As a marketing volunteer**, I want the system to upload final videos directly to YouTube and social accounts, so that post-event promotion is automated.

---

## 5. Success Metrics

**Adoption Metrics:**
- % of events using AI Media Curator (target: 80% within 6 months)
- Number of media assets uploaded per event (baseline: establish in month 1)

**Quality Metrics:**
- Organizer satisfaction score (survey: 1-5 scale, target: 4+)
- % of jobs completing successfully without manual intervention (target: 95%)

**Impact Metrics:**
- Presenter satisfaction with demo clips (survey, target: 4+ / 5)
- YouTube views on auto-generated recaps vs. manual edits (compare engagement)
- Time saved vs. manual editing (target: 10+ hours per event)

**Engagement Metrics:**
- Social shares of generated content
- YouTube watch time and retention rate (target: >50% avg view duration)

---

## 6. Technical Implementation

### Architecture Overview

The AI Media Curator extends Demo Night App with an **autonomous multi-agent system** orchestrated by **LangChain** that processes raw event footage into polished video content. The system leverages existing infrastructure (PostgreSQL, Redis, tRPC, NextAuth) while adding specialized media processing pipelines and AI integrations.

**Core Components:**
- **Media Ingestion Layer**: Handles live streams (RTMP/WebRTC) and file uploads (S3 presigned URLs)
- **AI Orchestration Engine**: LangChain-based agentic workflow with specialized agents for analysis, selection, and generation
- **Processing Pipeline**: FFmpeg-based video composition with AI-generated assets
- **Storage & Distribution**: S3 for media artifacts, YouTube API for publishing

### Database Schema Extensions

**New Prisma Models:**

```prisma
model MediaAsset {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  type        MediaAssetType  // VIDEO, AUDIO, SCREEN_SHARE, CAMERA_FEED
  source      MediaSource     // LIVE_STREAM, UPLOAD, GENERATED
  storageKey  String          // S3 object key
  duration    Int?            // seconds
  metadata    Json            // resolution, codec, fps, etc.

  // AI-generated metadata
  transcript  String?         // Full transcription
  analysis    Json?           // Gemini analysis: highlights, quality scores, timestamps

  demoId      String?         // Link to specific demo if applicable
  demo        Demo?           @relation(fields: [demoId], references: [id])

  createdAt   DateTime @default(now())

  jobs        MediaCurationJob[]

  @@index([eventId, type])
}

model MediaCurationJob {
  id          String   @id @default(cuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  status      JobStatus       // QUEUED, PROCESSING, COMPLETED, FAILED
  jobType     CurationType    // HIGHLIGHT_REEL, DEMO_CLIP, RESULTS_VIDEO, SOCIAL_CLIP

  // Job configuration
  prompt      String          // Moderator's creative direction
  config      Json            // Style, duration, aspect ratio, branding

  // Processing state
  phase       JobPhase        // INGEST, ANALYZE, SELECT, GENERATE, COMPOSE, EXPORT
  progress    Int     @default(0)  // 0-100
  logs        Json[]          // Execution logs from each agent

  // AI agent state
  agentState  Json?           // LangChain agent memory/context

  // Input/Output
  sourceAssets    MediaAsset[]  @relation("JobSources")
  outputs         MediaOutput[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?

  @@index([eventId, status])
}

model MediaOutput {
  id          String   @id @default(cuid())
  jobId       String
  job         MediaCurationJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  outputType  OutputType      // FINAL_VIDEO, SOCIAL_CLIP, PRESENTER_CLIP, THUMBNAIL
  storageKey  String          // S3 object key
  url         String?         // Public CDN URL

  // Publishing
  published   Boolean  @default(false)
  youtubeId   String?         // If uploaded to YouTube
  publishedAt DateTime?

  metadata    Json            // Duration, resolution, fileSize, etc.

  createdAt   DateTime @default(now())

  @@index([jobId])
}
```

### AI Orchestration Pipeline

**LangChain Agent Architecture:**

The system uses a **hierarchical agent structure** where a **Coordinator Agent** delegates to specialized sub-agents:

1. **Coordinator Agent** (LangChain ReAct agent)
   - Parses moderator prompt for creative intent
   - Plans execution strategy based on event data and available media
   - Coordinates sub-agents and manages job state
   - Tools: `getEventData`, `listMediaAssets`, `updateJobPhase`

2. **Analysis Agent** (Video Understanding)
   - Processes raw footage using **Gemini 2.0 Flash** with native video understanding
   - Identifies: demo transitions, audience reactions, key moments, visual quality
   - Cross-references with event timeline (demo start/end from Redis cache)
   - Transcribes audio using **Deepgram Whisper Cloud API**
   - Tools: `analyzeVideoWithGemini`, `transcribeAudio`, `detectSceneChanges`

3. **Selection Agent** (Content Curation)
   - Scores clips based on:
     - Voting/feedback data from PostgreSQL
     - Visual quality from Gemini analysis
     - Alignment with moderator prompt
     - Narrative flow and pacing
   - Generates editing decision list (EDL)
   - Tools: `getFeedbackData`, `getVotingResults`, `scoreClip`, `generateEDL`

4. **Generation Agent** (Asset Creation)
   - **Background Music**: Generates track via **Suno API** based on prompt style (e.g., "energetic electronic" for tech events)
   - **Voiceover**: Creates script from event data, synthesizes with **ElevenLabs** (professional voice cloning)
   - **Avatar Intro/Outro**: Generates presenter avatar via **Simli API** for host introductions
   - **Transitions**: Creates custom animations with **Veo 3** (text-to-video for branded transitions)
   - Tools: `generateMusic`, `synthesizeVoice`, `createAvatar`, `generateTransition`

5. **Composition Agent** (Video Assembly)
   - Orchestrates **FFmpeg** pipeline for video splicing, audio mixing, overlay rendering
   - Applies branding (chapter logos, sponsor cards from event config)
   - Renders multiple formats (16:9 for YouTube, 9:16 for Instagram/TikTok, 1:1 for LinkedIn)
   - Tools: `spliceVideo`, `mixAudio`, `addOverlay`, `renderFinalVideo`

6. **Export Agent** (Distribution)
   - Uploads to **AWS S3** (reuses existing AWS credentials from env)
   - Publishes to **YouTube Data API v3** with auto-generated descriptions
   - Generates presigned URLs for presenter downloads
   - Sends email notifications via **AWS SES** (existing integration)
   - Tools: `uploadToS3`, `publishToYouTube`, `generateDownloadLink`, `sendEmail`

**Step-by-Step Processing Flow:**

```
PHASE 1: INGEST (Real-time during event)
├─ Live Camera → RTMP Server (MediaMTX) → S3 Upload → MediaAsset (CAMERA_FEED)
├─ Screen Share → WebRTC Capture → S3 Upload → MediaAsset (SCREEN_SHARE)
└─ Post-Event Uploads → Presigned S3 URL → MediaAsset (UPLOAD)

PHASE 2: ANALYZE (Triggered by moderator)
├─ Coordinator Agent: Parse prompt, fetch event data, plan pipeline
├─ Analysis Agent:
│  ├─ Deepgram.transcribe(audio_stream) → transcript text
│  ├─ Gemini.analyzeVideo(video_file, prompt="identify demo transitions, rate visual quality, detect audience reactions")
│  ├─ FFmpeg.detectSceneChanges() → scene boundary timestamps
│  └─ Store results in MediaAsset.analysis JSON

PHASE 3: SELECT (AI-driven curation)
├─ Selection Agent:
│  ├─ Query Prisma: feedback scores, vote counts, demo metadata
│  ├─ Score each clip: qualityScore * feedbackScore * promptAlignment
│  ├─ Generate EDL:
│  │  ├─ Intro (0:00-0:15): Avatar welcome + event name
│  │  ├─ Demo 1 (0:15-1:30): Best 75s from Demo.index=0 footage
│  │  ├─ Transition (1:30-1:35): Veo3-generated animation
│  │  ├─ Demo 2 (1:35-2:50): Winner clip with "Best Innovation" overlay
│  │  └─ Outro (2:50-3:00): Results + CTA
│  └─ Store EDL in job.agentState

PHASE 4: GENERATE (Asset creation)
├─ Generation Agent (parallel execution):
│  ├─ Suno.generateMusic(prompt="upbeat tech event music, 3min, instrumental", key="C major")
│  ├─ ElevenLabs.synthesize(text="Welcome to AI Collective Demo Night...", voice="professional_host")
│  ├─ Simli.createAvatar(script="intro_script", avatar="host_profile", background="event_venue")
│  └─ Veo3.generateVideo(prompt="smooth fade transition with AI Collective logo", duration=5s)
│  └─ Store generated assets as MediaAsset (GENERATED)

PHASE 5: COMPOSE (FFmpeg video assembly)
├─ Composition Agent:
│  ├─ FFmpeg.concat(clips from EDL) → base_timeline.mp4
│  ├─ FFmpeg.addAudioTrack(music, volume=0.2, fadeIn=2s, fadeOut=3s)
│  ├─ FFmpeg.overlay(avatar_intro, position="0:00")
│  ├─ FFmpeg.overlay(transitions, positions from EDL)
│  ├─ FFmpeg.drawtext(demo names, award labels, chapter branding)
│  ├─ FFmpeg.filter_complex(color_grading="balanced", stabilization=true)
│  └─ FFmpeg.encode(
│     ├─ format1: 1920x1080 H.264 (YouTube)
│     ├─ format2: 1080x1920 H.264 (Instagram/TikTok)
│     └─ format3: 1080x1080 H.264 (LinkedIn)
│    ) → MediaOutput records

PHASE 6: EXPORT (Distribution)
├─ Export Agent:
│  ├─ S3.putObject(video, bucket="demo-night-media", key="events/{eventId}/outputs/{jobId}.mp4")
│  ├─ YouTube.videos.insert(
│  │   title="{Event.name} Highlights",
│  │   description="Auto-generated recap featuring {Demo.names}...",
│  │   tags=["AI Collective", "Demo Night", ...],
│  │   privacy="public"
│  │ ) → MediaOutput.youtubeId
│  ├─ Generate presigned URLs (7-day expiry) for each presenter's clip
│  └─ SES.sendEmail(
│     to=Demo.email,
│     subject="Your Demo Night Clip is Ready",
│     body="Download your personalized demo clip: {presigned_url}"
│   )
```

### Live Streaming Integration

**Camera Ingestion Architecture:**

For real-time event capture, the system supports two pathways:

1. **RTMP Ingest** (Traditional cameras/hardware encoders):
   - Deploy **MediaMTX** (formerly rtsp-simple-server) as RTMP server
   - Cameras push to `rtmp://domain/live/{eventId}-camera1`
   - MediaMTX transcodes to HLS, archives segments to S3 via custom hook
   - Admin dashboard shows live preview with ~10s latency

2. **WebRTC Ingest** (Browser-based/mobile devices):
   - Web interface using **Livekit** for ultra-low-latency streaming
   - Mobile apps/browsers connect via WebRTC → Livekit SFU → S3 recording
   - Ideal for screen sharing, mobile camera feeds, attendee reactions

**Storage Pattern:**
- Live segments written to S3 as `events/{eventId}/live/{stream_id}/segment_*.ts`
- Post-event concatenation creates single MediaAsset per stream
- Coordinator Agent monitors S3 events (via SQS) to detect new media

### API Layer (tRPC Extensions)

**New Router: `src/server/api/routers/media.ts`**

```typescript
export const mediaRouter = createTRPCRouter({
  // Asset management
  listAssets: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => { /* Fetch MediaAssets */ }),

  getUploadUrl: protectedProcedure
    .input(z.object({ eventId: z.string(), filename: z.string() }))
    .mutation(async ({ input }) => { /* Generate S3 presigned URL */ }),

  // Job management
  createCurationJob: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      jobType: z.enum(['HIGHLIGHT_REEL', 'DEMO_CLIP', 'RESULTS_VIDEO']),
      prompt: z.string(),
      config: z.object({ /* ... */ })
    }))
    .mutation(async ({ input }) => {
      // 1. Create job record
      // 2. Enqueue to Redis (BullMQ)
      // 3. Return job ID for polling
    }),

  getJobStatus: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => { /* Fetch job with progress */ }),

  listOutputs: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => { /* Fetch MediaOutputs */ }),

  publishToYouTube: protectedProcedure
    .input(z.object({ outputId: z.string() }))
    .mutation(async ({ input }) => { /* Trigger YouTube upload */ }),
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

**Admin Dashboard Integration** (`src/app/admin/[eventId]/components/MediaCurator/`):

1. **MediaCuratorTab.tsx** - Main tab in event dashboard
   - Upload interface (drag-drop with progress bars)
   - Live stream status indicators (RTMP endpoints, active feeds)
   - Asset library (thumbnails, metadata, search/filter)

2. **CurationJobPanel.tsx** - Job creation and monitoring
   - Prompt textarea with style presets ("energetic," "professional," "casual")
   - Job type selector (highlight reel, demo clips, results video)
   - Real-time progress tracking with phase indicators
   - Log viewer for debugging agent decisions

3. **OutputGallery.tsx** - Manage generated content
   - Video player with format selector (YouTube, Instagram, LinkedIn)
   - Publish controls (YouTube upload, generate share links)
   - Presenter distribution (send clips via email)
   - Analytics (views, engagement from YouTube API)

4. **LiveStreamMonitor.tsx** - Real-time stream management
   - Multi-camera grid view with HLS playback
   - Stream health metrics (bitrate, dropped frames)
   - Quick actions (start/stop recording, switch active camera)

### Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI Orchestration** | LangChain | Multi-agent coordination, tool calling |
| **Video Analysis** | Gemini 2.0 Flash | Scene understanding, quality scoring |
| **Transcription** | Deepgram Whisper | Real-time audio-to-text |
| **Music Generation** | Suno API | Prompt-based background music |
| **Voice Synthesis** | ElevenLabs | Professional voiceover generation |
| **Avatar Creation** | Simli API | Host intro/outro avatars |
| **Video Generation** | Veo 3 | Custom transitions and animations |
| **Video Processing** | FFmpeg | Splicing, encoding, composition |
| **Live Streaming** | MediaMTX + Livekit | RTMP/WebRTC ingest and relay |
| **Storage** | AWS S3 | Media object storage (reuse credentials) |
| **Job Queue** | BullMQ (Redis) | Async processing orchestration |
| **Distribution** | YouTube Data API v3 | Auto-publishing and metadata |
| **Notifications** | AWS SES | Email delivery (existing integration) |

---

## 7. Implementation Plan

**Phase 1: Foundation (2 weeks)**
- Database schema migration (MediaAsset, MediaCurationJob, MediaOutput)
- S3 bucket setup and presigned URL generation
- Basic media upload UI in admin dashboard
- tRPC media router with upload/list endpoints
- *Milestone: Organizers can upload and view event footage*

**Phase 2: AI Pipeline Core (3 weeks)**
- LangChain agent framework setup (Coordinator, Analysis, Selection agents)
- Gemini video analysis integration (scene detection, quality scoring)
- Deepgram transcription integration
- Selection agent with scoring logic (feedback data + video analysis)
- BullMQ job queue for async processing
- *Milestone: System can analyze footage and identify highlights*

**Phase 3: Content Generation (2 weeks)**
- Generation Agent implementation
- Suno music generation integration
- ElevenLabs voiceover synthesis
- FFmpeg video composition pipeline (splicing, audio mixing, overlays)
- Multi-format rendering (16:9, 9:16, 1:1)
- *Milestone: End-to-end highlight reel generation from prompt*

**Phase 4: Distribution & Polish (1 week)**
- Export Agent with YouTube API integration
- Email notification system (reuse existing SES integration)
- Admin UI: job progress tracking, output gallery, publish controls
- Error handling and retry logic
- *Milestone: Complete workflow from upload to YouTube publish*

**Phase 5: Live Streaming (2 weeks, optional)**
- MediaMTX RTMP server deployment
- Livekit WebRTC integration
- Real-time ingestion pipeline (S3 archival)
- Live stream monitoring UI
- *Milestone: Capture event footage live during Demo Night*

**Total estimated time: 8-10 weeks** (phases 1-4 required, phase 5 optional for enhanced capture)

---

## 8. Risks & Mitigation Strategies

**Risk: AI-generated content quality may not meet expectations**
- *Mitigation*: Provide style presets and preview capabilities; allow organizers to regenerate with refined prompts; include human review step before publishing

**Risk: High API costs from Gemini/Suno/ElevenLabs for large events**
- *Mitigation*: Use Gemini Flash (cheaper, faster), cache/reuse generated music and avatar templates, implement usage quotas per event tier

**Risk: Video processing failures due to unsupported codecs/formats**
- *Mitigation*: Validate uploads with FFprobe, provide clear format guidelines in UI, auto-transcode problematic formats on ingest

**Risk: Live streaming latency or reliability issues during events**
- *Mitigation*: Make Phase 5 optional; provide robust fallback upload-based workflow; use battle-tested MediaMTX for production stability

### Implementation Considerations

**Performance:**
- Large video files processed via streaming (chunked S3 reads)
- FFmpeg operations executed in isolated Docker containers (prevent memory leaks)
- Job parallelization: multiple agents run concurrently within phases

**Scalability:**
- Horizontal scaling: worker pool consumes jobs from Redis queue
- S3 multipart uploads for large files (>100MB)
- CDN (CloudFront) for MediaOutput delivery

**Cost Optimization:**
- Gemini Flash (faster, cheaper than Pro for video analysis)
- S3 Intelligent-Tiering for archived event media
- Pre-generate music/avatar templates to reduce API calls

**Security:**
- Presigned S3 URLs with short expiration (24h for uploads, 7d for downloads)
- YouTube OAuth tokens stored in encrypted session (NextAuth)
- Rate limiting on job creation (prevent abuse)

**Monitoring:**
- Job failure alerts via AWS SNS → Slack
- Performance metrics logged to CloudWatch
- Agent decision logs stored in `MediaCurationJob.logs` for auditing

---

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

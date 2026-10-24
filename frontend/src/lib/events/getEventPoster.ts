import type { Event } from "@/lib/api/events";

/** Slug → local poster image path for known events whose poster isn't stored on the backend yet. */
const DEFAULT_EVENT_POSTERS: Record<string, string> = {
  "logocon": "/images/events/Logocon.png",
  "code-in-pair": "/images/events/CodeInPair.png",
  "decode": "/images/events/deencode.png",
  "deencode": "/images/events/deencode.png",
  "valorant": "/images/events/valorant.png",
  "genai-workshop": "/images/events/GenAI.jpeg",
  "genai": "/images/events/GenAI.jpeg",
  "resume-workshop": "/images/events/Linkdin.jpeg",
  "linkedin-workshop": "/images/events/Linkdin.jpeg",
  "linkedin": "/images/events/Linkdin.jpeg",
  "linkdin": "/images/events/Linkdin.jpeg",
};

/**
 * Returns the poster image URL for a given event.
 * Priority: posterUrl from backend → slug map → title heuristics → undefined.
 */
export function getEventPoster(evt?: Event | null): string | undefined {
  if (!evt) return undefined;
  if (evt.posterUrl && evt.posterUrl.trim() !== "") return evt.posterUrl;

  const slug = (evt.slug || "").toLowerCase();
  if (DEFAULT_EVENT_POSTERS[slug]) return DEFAULT_EVENT_POSTERS[slug];

  const title = (evt.title || "").toLowerCase();
  if (title.includes("logocon")) return "/images/events/Logocon.png";
  if (title.includes("code-in-pair") || title.includes("code in pair")) return "/images/events/CodeInPair.png";
  if (title.includes("decode") || title.includes("deencode")) return "/images/events/deencode.png";
  if (title.includes("valorant")) return "/images/events/valorant.png";
  if (title.includes("genai") || title.includes("generative ai")) return "/images/events/GenAI.jpeg";
  if (title.includes("linkedin") || title.includes("linkdin") || title.includes("resume")) return "/images/events/Linkdin.jpeg";
  if (title.includes("hackathon")) return "/images/events/CodeInPair.png";
  if (title.includes("web dev") || title.includes("core programming")) return "/images/events/CodeInPair.png";

  return undefined;
}

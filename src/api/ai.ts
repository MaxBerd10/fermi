/** Frontend OpenAI client — uses VITE_OPENAI_API_KEY from env (bundled at build). */
export {
  aiChat,
  aiPathfinder,
  aiSearch,
  aiQabul,
  aiFaculty,
  aiReception,
  aiSummarize,
  type AiSource,
  type AiLink,
} from "@/lib/aiClient";

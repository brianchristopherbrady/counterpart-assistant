import { startConversationTopic } from "./startConversation";
import { flowDecisionsTopic } from "./flowDecisions";
import { walkthroughsTopic } from "./walkthroughs";
import { architectureTopic } from "./architecture";
import { designSystemTopic } from "./designSystem";
import { reliabilityTopic } from "./reliability";
import { interviewPracticeTopic } from "./interviewPractice";
import { sourcesTopic } from "./sourcesMap";
import type { StudyTopic } from "./types";

export const STUDY_TOPICS: StudyTopic[] = [
  startConversationTopic,
  flowDecisionsTopic,
  walkthroughsTopic,
  architectureTopic,
  designSystemTopic,
  reliabilityTopic,
  interviewPracticeTopic,
  sourcesTopic,
];

export interface SearchEntry {
  topicId: string;
  sectionId: string;
  topicTitle: string;
  sectionTitle: string;
  text: string;
}

export const SEARCH_INDEX: SearchEntry[] = STUDY_TOPICS.flatMap((topic) =>
  topic.sections.map((section) => ({
    topicId: topic.id,
    sectionId: section.id,
    topicTitle: topic.title,
    sectionTitle: section.title,
    text: `${section.title} ${section.sayThisAloud} ${(section.keywords ?? []).join(" ")}`.toLowerCase(),
  })),
);

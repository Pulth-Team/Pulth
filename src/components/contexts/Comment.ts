import { createContext } from "react";

export type ActivitySettings =
  | {
      isActive: true;
      id: string;
      activity: "edit" | "reply";
    }
  | {
      isActive: false;
    };

const CommentContext = createContext<{
  isActive: boolean;
  activity: "edit" | "reply" | "none";
  setActivity: (obj: ActivitySettings) => void;
  currentActiveCommentId?: string;

  isAuthed: boolean;
  user?: {
    id: string;
    name: string;
    image: string;
  };
  articleId: string;
  requestDelete: (id: string) => void;
  revalidate: (reason: "edit" | "reply") => void;
  revalidationStatus: "idle" | "loading" | "success" | "error";
}>({
  isActive: false,
  activity: "none",
  setActivity: () => {},
  currentActiveCommentId: undefined,

  isAuthed: false,
  user: {
    id: "",
    name: "",
    image: "",
  },
  articleId: "",
  requestDelete: () => {},
  revalidate: () => {},
  revalidationStatus: "idle",
});
CommentContext.displayName = "Comment Context";

export default CommentContext;

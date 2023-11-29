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

type AuthUserData =
  | {
      AuthStatus: "authenticated";
      user: {
        id: string;
        name: string;
        image: string;
      };
    }
  | {
      AuthStatus: "loading" | "unauthenticated";
      user: undefined;
    }
  | {
      AuthStatus: "authenticated" | "loading" | "unauthenticated";
      user?: {
        id: string;
        name: string;
        image: string;
      };
    };

// type NonAuthedUser  {

//     AuthStatus: "loading"|"unauthenticated";
//     user:undefined;
//   };

const CommentContext = createContext<
  {
    isActive: boolean;
    activity: "edit" | "reply" | "none";
    setActivity: (obj: ActivitySettings) => void;
    currentActiveCommentId?: string;

    // isAuthed: boolean;

    articleId: string;
    requestDelete: (id: string) => void;
    revalidate: (reason: "edit" | "reply") => void;
    revalidationStatus: "idle" | "loading" | "success" | "error";
  } & AuthUserData
>({
  isActive: false,
  activity: "none",
  setActivity: () => {},
  currentActiveCommentId: undefined,

  AuthStatus: "unauthenticated",
  user: undefined,
  articleId: "",
  requestDelete: () => {},
  revalidate: () => {},
  revalidationStatus: "idle",
});
CommentContext.displayName = "Comment Context";

export default CommentContext;

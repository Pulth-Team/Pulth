import { createContext } from "react";

const InspectContext = createContext<{
  id?: string;

  slug: string;
  title: string;
  description: string;

  isPublished: boolean;

  updatedAt: Date;
  createdAt: Date;

  refetch: () => void;

  // Tags is wronh
  Tags: { name: string; slug: string }[];
  keywords: string[];
}>({
  id: "",

  slug: "",
  title: "",
  description: "",

  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),

  Tags: [],
  keywords: [],
  refetch: () => {},
});

InspectContext.displayName = "Inspect Page Context";

export default InspectContext;

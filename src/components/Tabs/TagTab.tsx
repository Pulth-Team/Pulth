import { useRouter } from "next/router";

const TagTab = () => {
  // get slug from url using useRouters
  const router = useRouter();
  const { slug } = router.query;

  return <div>TagTab</div>;
};

export default TagTab;

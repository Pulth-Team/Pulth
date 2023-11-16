import { useRouter } from "next/router";
import { api } from "~/utils/api";

const TagTab = () => {
  // get slug from url using useRouters
  const router = useRouter();
  const { slug } = router.query;

  const { data: tagData, isLoading } = api.tag.getTagsBySlug.useQuery({
    slug: slug as string,
  });

  return (
    <div className="flex gap-2">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        tagData?.map((tagEntry) => (
          <div
            key={tagEntry.tag.id}
            style={{
              backgroundColor: tagEntry.tag.color,
              color: pickTextColorBasedOnBgColor(tagEntry.tag.color),
            }}
            className="rounded-md p-2"
          >
            {tagEntry.tag.name}
          </div>
        ))
      )}
    </div>
  );
};

function pickTextColorBasedOnBgColor(bgColor: string) {
  const lightColor = "#ffffff";
  const darkColor = "#000000";

  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? darkColor : lightColor;
}

export default TagTab;

import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

interface SeoTabProps {
  title: string;
  description: string;
}

const SEOTab = ({ title, description }: SeoTabProps) => {
  type TitleChecks = "isLongerThan20" | "isLongerThan30" | "isLessThan50";
  const TitleScores: {
    [key in TitleChecks]: {
      isValid: boolean;
      failMessage: string;
      successMessage: string;
      importance: "critical" | "warning";
    };
  } = {
    isLongerThan20: {
      isValid: (title?.length || 0) > 20,
      failMessage:
        "Title is too short. It should be at least 20 charecters long.",
      successMessage: "Title is longer than 20 character.",
      importance: "critical",
    },
    isLongerThan30: {
      isValid: (title?.length || 0) > 30,
      failMessage:
        "Title is too short. It should be at least 30 charecters long.",
      successMessage: "Title is longer than 30 character.",
      importance: "critical",
    },
    isLessThan50: {
      isValid: (title?.length || 0) < 50,
      failMessage:
        "Title is too long. It should be at most 50 charecters long.",
      successMessage: "Title is shorter than 50 character.",
      importance: "warning",
    },
  };

  type DescriptionChecks = "isLongerThan80" | "isLessThan220" | "isLessThan280";
  const DescriptionScores: {
    [key in DescriptionChecks]: {
      isValid: boolean;
      failMessage: string;
      successMessage: string;
      importance: "critical" | "warning";
    };
  } = {
    isLongerThan80: {
      isValid: (description?.length || 0) > 80,
      failMessage:
        "Description is too short. It should be at least 80 charecters long.",
      successMessage: "Description is longer than 80 character.",
      importance: "critical",
    },
    isLessThan220: {
      isValid: (description?.length || 0) < 220,
      failMessage:
        "Description is too long. It should be at most 220 charecters long.",
      successMessage: "Description is shorter than 220 character.",
      importance: "warning",
    },
    isLessThan280: {
      isValid: (description?.length || 0) < 280,
      failMessage:
        "Description is too long. It should be at most 280 charecters long.",
      successMessage: "Description is shorter than 280 character.",
      importance: "critical",
    },
  };

  const TitleGreenCount = Object.values(TitleScores).filter(
    (score) => score.isValid
  ).length;
  const TitleYellowCount = Object.values(TitleScores).filter(
    (score) => !score.isValid && score.importance === "warning"
  ).length;
  const TitleRedCount = Object.values(TitleScores).filter(
    (score) => !score.isValid && score.importance === "critical"
  ).length;

  const DescriptionGreenCount = Object.values(DescriptionScores).filter(
    (score) => score.isValid
  ).length;
  const DescriptionYellowCount = Object.values(DescriptionScores).filter(
    (score) => !score.isValid && score.importance === "warning"
  ).length;
  const DescriptionRedCount = Object.values(DescriptionScores).filter(
    (score) => !score.isValid && score.importance === "critical"
  ).length;

  const MetaScore = Math.round(
    ((TitleGreenCount + DescriptionGreenCount) /
      (Object.values(TitleScores).length +
        Object.values(DescriptionScores).length)) *
      100
  );
  const ArticleScore = 50;

  const OverallScore = Math.round((MetaScore + ArticleScore) / 2).toString();

  return (
    <>
      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
          <p className="text-xl">Overall Score</p>
          <p className="text-2xl font-semibold">
            {OverallScore}
            <span className="text-base text-black/50">/100</span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
          <p className="text-xl">Meta Score</p>
          <p className="text-2xl font-semibold">
            {MetaScore}
            <span className="text-base text-black/50">/100</span>
          </p>
        </div>
        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
          <p className="text-xl">Article Score</p>
          <p className="text-2xl font-semibold">
            {ArticleScore}
            <span className="text-base text-black/50">/100</span>
          </p>
        </div>
      </div>
      <hr className="border" />
      <div className="w-full py-4">
        <div className="mx-auto flex w-full flex-col gap-4 rounded-2xl bg-white">
          <Disclosure as={"div"}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg border bg-white px-4 py-2 text-left font-medium text-black focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                  <span className="">Title</span>
                  <div className=" flex items-center gap-4">
                    <div
                      className={`flex items-center gap-1 ${
                        TitleGreenCount == 0 ? "hidden" : ""
                      }`}
                    >
                      <p>{TitleGreenCount}</p>
                      <div className="h-3 w-3 rounded-full bg-green-700"></div>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        TitleYellowCount == 0 ? "hidden" : ""
                      }`}
                    >
                      <p>{TitleYellowCount}</p>
                      <div className=" h-3 w-3 rounded-full bg-yellow-500"></div>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        TitleRedCount == 0 ? "hidden" : ""
                      }`}
                    >
                      <p>{TitleRedCount}</p>
                      <div className=" h-3 w-3 rounded-full bg-red-500"></div>
                    </div>

                    <ChevronUpIcon
                      className={`${
                        open ? "" : "rotate-180 transform"
                      } h-5 w-5 text-black`}
                    />
                  </div>
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-2">
                  {Object.values(TitleScores).map((score, index) => {
                    if (!score.isValid && score.importance === "critical") {
                      return (
                        <p
                          className={`text-red-700`}
                          key={"fail-message-title-critical-" + index}
                        >
                          {score.failMessage}
                        </p>
                      );
                    }
                  })}
                  {Object.values(TitleScores).map((score, index) => {
                    if (!score.isValid && score.importance === "warning") {
                      return (
                        <p
                          className={`text-yellow-600`}
                          key={"fail-message-title-warning-" + index}
                        >
                          {score.failMessage}
                        </p>
                      );
                    }
                  })}
                  {Object.values(TitleScores).map((Score, index) => {
                    if (Score.isValid)
                      return (
                        <p
                          className={`text-green-700`}
                          key={"succes-message-title-" + index}
                        >
                          {Score.successMessage}
                        </p>
                      );
                  })}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure as={"div"}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg border bg-white px-4 py-2 text-left font-medium text-black focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                  <span className="">Description</span>
                  <div className=" flex items-center gap-4">
                    <div
                      className={`flex items-center gap-1 ${
                        DescriptionGreenCount == 0 ? "hidden" : ""
                      }`}
                    >
                      <p>{DescriptionGreenCount}</p>
                      <div className="h-3 w-3 rounded-full bg-green-700"></div>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        DescriptionYellowCount == 0 ? "hidden" : ""
                      }`}
                    >
                      <p>{DescriptionYellowCount}</p>
                      <div className=" h-3 w-3 rounded-full bg-yellow-500"></div>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        DescriptionRedCount == 0 ? " hidden" : ""
                      }`}
                    >
                      <p>{DescriptionRedCount}</p>
                      <div className=" h-3 w-3 rounded-full bg-red-500"></div>
                    </div>
                    <ChevronUpIcon
                      className={`${
                        open ? "" : "rotate-180 transform"
                      } h-5 w-5 text-black`}
                    />
                  </div>
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pb-2 pt-2">
                  {Object.values(DescriptionScores).map((score, index) => {
                    if (!score.isValid && score.importance === "critical") {
                      return (
                        <p
                          className={`text-red-700`}
                          key={"fail-message-description-critical-" + index}
                        >
                          {score.failMessage}
                        </p>
                      );
                    }
                  })}
                  {Object.values(DescriptionScores).map((score, index) => {
                    if (!score.isValid && score.importance === "warning") {
                      return (
                        <p
                          className={`text-yellow-600`}
                          key={"fail-message-description-warning-" + index}
                        >
                          {score.failMessage}
                        </p>
                      );
                    }
                  })}
                  {Object.values(DescriptionScores).map((Score, index) => {
                    if (Score.isValid)
                      return (
                        <p
                          className={`text-green-700`}
                          key={"success-message-description-" + index}
                        >
                          {Score.successMessage}
                        </p>
                      );
                  })}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </div>
    </>
  );
};

export default SEOTab;

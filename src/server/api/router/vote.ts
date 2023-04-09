import { z } from "zod";
import { ObjectId } from "bson";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const voteRouter = createTRPCRouter({
  voteByArticleId: protectedProcedure
    .input(
      z.object({
        articleId: z.string().refine((id) => ObjectId.isValid(id), {
          message: "Invalid ObjectId",
        }),
        vote: z.enum(["up", "down"]),
      })
    )
    .output(
      z.object({
        msg: z.string(),
        vote: z.object({
          id: z.string(),
          articleId: z.string(),
          userId: z.string(),
          upVote: z.boolean(),
        }),
        newRank: z.number(),
        voteDirection: z.enum(["up", "down", "deleted"]),
      })
    )
    .mutation(
      async ({ input: { articleId, vote }, ctx: { session, prisma } }) => {
        const {
          user: { id: userId },
        } = session;

        const isUpVote = vote === "up";

        const isVotedBefore: { isUpvote: boolean; id: string } | false =
          await prisma.votedBy
            .findFirst({
              where: {
                articleId,
                userId,
              },
            })
            .then((result) => {
              if (result) {
                return { isUpvote: result.upVote, id: result.id };
              } else {
                return false;
              }
            });

        if (isVotedBefore) {
          // if user already voted to this article
          // compare vote type
          if (isVotedBefore.isUpvote === isUpVote) {
            // if same vote type, delete vote
            const voteDeleteResult = prisma.votedBy.delete({
              where: {
                id: isVotedBefore.id,
              },
            });

            // update voteRank in article
            const voteRankUpdateResult = prisma.article.update({
              where: {
                id: articleId,
              },
              data: {
                voteRank: {
                  increment: -1 * (isUpVote ? 1 : -1),
                },
              },
            });

            return Promise.all([voteDeleteResult, voteRankUpdateResult]).then(
              ([voteDeleteResult, voteRankUpdateResult]) => {
                return {
                  msg: "vote deleted",
                  vote: voteDeleteResult,
                  newRank: voteRankUpdateResult.voteRank,
                  voteDirection: "deleted",
                };
              }
            );
          } else {
            // if different vote type, update vote
            const voteUpdateResult = prisma.votedBy.update({
              where: {
                id: isVotedBefore.id,
              },
              data: {
                upVote: isUpVote,
              },
            });

            // update voteRank in article
            const voteRankUpdateResult = prisma.article.update({
              where: {
                id: articleId,
              },
              data: {
                voteRank: {
                  increment: 2 * (isUpVote ? 1 : -1),
                },
              },
            });

            return Promise.all([voteUpdateResult, voteRankUpdateResult]).then(
              ([voteUpdateResult, voteRankUpdateResult]) => {
                return {
                  msg: "vote converted to opposite type",
                  vote: voteUpdateResult,
                  newRank: voteRankUpdateResult.voteRank,
                  voteDirection: isUpVote ? "up" : "down",
                };
              }
            );
          }
        }

        // if user never voted to this article, create vote
        const voteCreateResult = await prisma.votedBy.create({
          data: {
            articleId,
            userId,
            upVote: isUpVote,
          },
        });

        // update voteRank in article
        const voteRankUpdateResult = await prisma.article.update({
          where: {
            id: articleId,
          },
          data: {
            voteRank: {
              increment: 1 * (isUpVote ? 1 : -1),
            },
          },
        });

        console.log("voteRankUpdateResult", voteRankUpdateResult);

        return Promise.all([voteCreateResult, voteRankUpdateResult]).then(
          ([voteCreateResult, voteRankUpdateResult]) => {
            return {
              msg: "vote created",
              vote: voteCreateResult,
              newRank: voteRankUpdateResult.voteRank,
              voteDirection: isUpVote ? "up" : "down",
            };
          }
        );
      }
    ),

  checkMyVoteByArticleId: protectedProcedure
    .input(
      z.string().refine((id) => ObjectId.isValid(id), {
        message: "Invalid ObjectId",
      })
    )
    .query(async ({ input: articleId, ctx: { session, prisma } }) => {
      const {
        user: { id: userId },
      } = session;

      const vote = await prisma.votedBy.findFirst({
        where: {
          articleId,
          userId,
        },
      });

      return vote || { msg: "no vote found" };
    }),
});

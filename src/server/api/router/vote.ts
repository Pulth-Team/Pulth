import { z } from "zod";
import { ObjectId } from "bson";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
            const voteDeleteResult = await prisma.votedBy.delete({
              where: {
                id: isVotedBefore.id,
              },
            });

            return {
              msg: "vote deleted",
              vote: voteDeleteResult,
              voteDirection: "deleted",
            };
          } else {
            // if different vote type, update vote
            const voteUpdateResult = await prisma.votedBy.update({
              where: {
                id: isVotedBefore.id,
              },
              data: {
                upVote: isUpVote,
              },
            });

            return {
              msg: "vote converted to opposite type",
              vote: voteUpdateResult,
              voteDirection: isUpVote ? "up" : "down",
            };
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

        return Promise.all([voteCreateResult]).then(([voteCreateResult]) => {
          return {
            msg: "vote created",
            vote: voteCreateResult,
            // newRank: voteRankUpdateResult.voteRank,
            voteDirection: isUpVote ? "up" : "down",
          };
        });
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
      let voteEnum: "up" | "down" | "none" = "none";

      if (!vote) voteEnum = "none";
      else voteEnum = vote?.upVote ? "up" : "down";

      return {
        voteDirection: voteEnum,
        details: vote
          ? {
              id: vote.id,
              articleId: vote.articleId,
              userId: vote.userId,
            }
          : undefined,
      };
    }),
  getVoteRankByArticleId: publicProcedure
    .input(z.string().refine((id) => ObjectId.isValid(id), {}))
    .query(async ({ input: articleId, ctx: { prisma } }) => {
      const article = await prisma.article.findUnique({
        where: {
          id: articleId,
        },
      });
      if (!article) return 0;

      return await article.voteRank;
    }),
});

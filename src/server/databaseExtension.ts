import { Prisma } from "@prisma/client";

export default Prisma.defineExtension((prismaClient) => {
  return prismaClient.$extends({
    result: {
      article: {
        voteRank: {
          needs: { id: true },
          compute: async (article) => {
            const votes = await prismaClient.votedBy.findMany({
              where: { articleId: article.id },
              select: { upVote: true },
            });
            const voteRank = votes.reduce((acc, vote) => {
              return acc + (vote.upVote ? 1 : -1);
            }, 0);
            return voteRank;
          },
        },
      },
    },
    model: {
      article: {
        getVoteRank: async (ArticleId: string) => {
          const votes = await prismaClient.votedBy.findMany({
            where: { articleId: ArticleId },
            select: { upVote: true },
          });

          return votes.reduce((acc, vote) => {
            return acc + (vote.upVote ? 1 : -1);
          }, 0);
        },
      },
    },
  });
});

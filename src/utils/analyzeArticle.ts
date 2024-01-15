interface AnalysisResult {
  score: number;
  checks: string[];
}

function analyzeLength(
  text: string,
  minLength: number,
  maxLength: number,
  checkName: string
): AnalysisResult {
  const length = text.length;
  const minScore = 0;
  const maxScore = 20; // Adjusted for a maximum score of 100
  console.log(
    `Length: ${length}, Min: ${minLength}, Max: ${maxLength}, Score: ${
      maxScore *
      (1 - binomialDistribution(maxLength, length / maxLength, length / 2))
    }`
  );

  const score = Math.max(
    minScore,
    Math.min(
      maxScore,
      maxScore *
        // (1 -
        //   binomialDistribution(length, (minLength + maxLength) / 2)[
        //     Math.floor(length / 2)
        //   ]!)
        (1 - binomialDistribution(maxLength, length / maxLength, length / 2))
    )
  );
  const checks =
    length < minLength
      ? [`${checkName} is too short`]
      : length > maxLength
      ? [`${checkName} is too long`]
      : [];
  return { score, checks };
}

function analyzeKeywordDensity(
  text: string,
  keywords: string[]
): AnalysisResult {
  const words = text.toLowerCase().split(/\s+/);
  const keywordDensity = keywords.filter((keyword) =>
    words.includes(keyword.toLowerCase())
  ).length;
  const minScore = 0;
  const maxScore = 30; // Adjusted for a maximum score of 100
  const score = Math.max(
    minScore,
    1 //Math.min(maxScore, maxScore * (keywordDensity / 3))
    // Math.min(maxScore, maxScore * (1 - Math.abs(keywordDensity - 3) / 3))
  );
  const checks = keywordDensity < 3 ? ["Low keyword density"] : [];
  return { score, checks };
}

function analyzeCapitalization(text: string): AnalysisResult {
  const words = text.split(/\s+/);
  const hasCapitalizedWords = words.some((word) => /^[A-Z]+$/.test(word));
  const score = hasCapitalizedWords ? 10 : 0; // Adjusted for a maximum score of 100
  const checks = hasCapitalizedWords ? ["Contains capitalized words"] : [];
  return { score, checks };
}

function calculateArticleScore(...results: AnalysisResult[]): number {
  const totalScore = results.reduce(
    (totalScore, result) => totalScore + result.score,
    0
  );
  return Math.min(100, totalScore); // Ensure the maximum score is 100
}

function analyzeMetadata(
  title: string,
  description: string,
  keywords?: string[]
): {
  titleScore: number;
  descriptionScore: number;
  totalScore: number;
  titleChecks: string[];
  descriptionChecks: string[];
} {
  const titleResult = analyzeLength(title, 20, 70, "Title");
  const descriptionResult = analyzeLength(description, 100, 150, "Description");
  const keywordResults = analyzeKeywordDensity(description, keywords || []);
  const capitalizationResult = analyzeCapitalization(description);

  const titleScore = titleResult.score;
  const descriptionScore =
    descriptionResult.score + keywordResults.score + capitalizationResult.score;
  const totalScore = calculateArticleScore(
    titleResult,
    descriptionResult,
    keywordResults,
    capitalizationResult
  );

  return {
    titleScore,
    descriptionScore,
    totalScore,
    titleChecks: titleResult.checks,
    descriptionChecks: [
      ...descriptionResult.checks,
      ...keywordResults.checks,
      ...capitalizationResult.checks,
    ],
  };
}

export { analyzeMetadata };

function binomialDistribution(n: number, p: number, x: number): number {
  // @ts-ignore
  const coefficient = factorial[n] / (factorial[x] * factorial[n - x]);
  const probability = coefficient * Math.pow(p, x) * Math.pow(1 - p, n - x);
  return probability;
}
var factorial = [
  1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600,
  6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000,
  6402373705728000, 121645100408832000, 2432902008176640000,
  51090942171709440000, 1.1240007277776077e21, 2.585201673888498e22,
  6.204484017332394e23, 1.5511210043330986e25, 4.0329146112660565e26,
  1.0888869450418352e28, 3.0488834461171384e29, 8.841761993739701e30,
  2.6525285981219103e32, 8.222838654177922e33, 2.631308369336935e35,
  8.683317618811886e36, 2.9523279903960412e38, 1.0333147966386144e40,
  3.719933267899012e41, 1.3763753091226343e43, 5.23022617466601e44,
  2.0397882081197442e46, 8.159152832478977e47, 3.3452526613163803e49,
  1.4050061177528798e51, 6.041526306337383e52, 2.6582715747884485e54,
  1.1962222086548019e56, 5.5026221598120885e57, 2.5862324151116818e59,
  1.2413915592536073e61, 6.082818640342675e62, 3.0414093201713376e64,
  1.5511187532873822e66, 8.065817517094388e67, 4.2748832840600255e69,
  2.308436973392414e71, 1.2696403353658276e73, 7.109985878048635e74,
  4.052691950487722e76, 2.350561331282879e78, 1.3868311854568986e80,
  8.320987112741392e81, 5.075802138772248e83, 3.146997326038794e85,
  1.98260831540444e87, 1.2688693218588417e89, 8.247650592082472e90,
  5.443449390774431e92, 3.647111091818868e94, 2.4800355424368305e96,
  1.711224524281413e98, 1.197857166996989e100, 8.504785885678622e101,
  6.123445837688608e103, 4.4701154615126834e105, 3.3078854415193856e107,
  2.480914081139539e109, 1.8854947016660498e111, 1.4518309202828584e113,
  1.1324281178206295e115, 8.946182130782973e116, 7.156945704626378e118,
  5.797126020747366e120, 4.75364333701284e122, 3.945523969720657e124,
  3.314240134565352e126, 2.8171041143805494e128, 2.4227095383672724e130,
  2.107757298379527e132, 1.8548264225739836e134, 1.6507955160908452e136,
  1.4857159644817607e138, 1.3520015276784023e140, 1.24384140546413e142,
  1.1567725070816409e144, 1.0873661566567424e146, 1.0329978488239052e148,
  9.916779348709491e149, 9.619275968248206e151, 9.426890448883242e153,
  9.33262154439441e155, 9.33262154439441e157,
];

// hooks/useFaqSearch.js

/**
 * Calculates a relevance score for a FAQ based on keyword matches.
 * Heavily prioritizes matches in the question.
 * @param {string[]} validKeywords - Array of valid keywords (> 2 chars) from user input.
 * @param {object} faq - The FAQ object { question: string, answer: string }.
 * @returns {number} The relevance score.
 */
function calculateScore(validKeywords, faq) {
  let score = 0;
  const questionText = faq.question.toLowerCase();
  const answerText = faq.answer.toLowerCase();

  validKeywords.forEach((word) => {
    // Only score based on valid keywords (already filtered to > 2 chars)
    if (questionText.includes(word)) {
      score += 3; // INCREASED SCORE: Make question matches much more valuable
    } else if (answerText.includes(word)) {
      score += 1; // Lower score for answer match
    }
  });

  return score;
}

/**
 * Finds the top 3 most relevant FAQs based on keywords.
 * Ignores keywords with length less than or equal to 2 characters entirely.
 * @param {string} keyword - The search keyword string.
 * @param {Array<object>} allFaqs - Array of all FAQ objects.
 * @returns {Array<object>} Top 3 matching FAQs, sorted by score.
 */
export function findTopFaqs(keyword, allFaqs) {
  const trimmedKeyword = keyword.trim().toLowerCase();

  // FIX: Return empty array if the overall keyword length is 2 or less
  if (trimmedKeyword.length <= 2) {
    return [];
  }

  // Split into tokens and remove empty strings
  const keywordTokens = trimmedKeyword.split(/\s+/).filter((token) => token.length > 0);

  // FIX: Filter out tokens that are 2 characters or shorter
  const validKeywords = keywordTokens.filter((word) => word.length > 2);

  // If NO valid keywords remain after filtering, return empty
  if (validKeywords.length === 0) {
    return [];
  }

  // Calculate scores using only the valid keywords
  const scoredFaqs = allFaqs.map((faq) => ({
    ...faq,
    score: calculateScore(validKeywords, faq), // Pass only valid keywords
  }));

  // Filter out FAQs with no score and sort by score (descending)
  const sortedFaqs = scoredFaqs
    .filter((faq) => faq.score > 0)
    .sort((a, b) => {
      // Primary sort: score descending
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary sort (tie-breaker): shorter question first (arbitrary but consistent)
      return a.question.length - b.question.length;
    });

  // Return top 3 results
  return sortedFaqs.slice(0, 3);
}

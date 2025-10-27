// hooks/useFaqSearch.js

/**
 * Calculates a relevance score for a FAQ based on keyword matches.
 * Prioritizes matches in the question.
 * @param {string[]} keywordTokens - Array of keywords from user input.
 * @param {object} faq - The FAQ object { question: string, answer: string }.
 * @returns {number} The relevance score.
 */
function calculateScore(keywordTokens, faq) {
  let score = 0;
  const questionText = faq.question.toLowerCase();
  const answerText = faq.answer.toLowerCase();

  keywordTokens.forEach((word) => {
    // Only score words with 2 or more characters (Fixes the short keyword test)
    if (word.length >= 2) {
      if (questionText.includes(word)) {
        score += 2; // Higher score for question match
      } else if (answerText.includes(word)) {
        score += 1; // Lower score for answer match
      }
    }
  });
  return score;
}

/**
 * Finds the top 3 most relevant FAQs based on keywords.
 * Ignores keywords shorter than 2 characters.
 * @param {string} keyword - The search keyword string.
 * @param {Array<object>} allFaqs - Array of all FAQ objects.
 * @returns {Array<object>} Top 3 matching FAQs, sorted by score.
 */
export function findTopFaqs(keyword, allFaqs) {
  const trimmedKeyword = keyword.trim().toLowerCase();

  // FIX: Return empty array if keyword is too short
  if (trimmedKeyword.length < 2) {
    return [];
  }

  const keywordTokens = trimmedKeyword.split(/\s+/).filter(Boolean); // Split into words

  if (keywordTokens.length === 0) {
    return [];
  }

  const scoredFaqs = allFaqs.map((faq) => ({
    ...faq,
    score: calculateScore(keywordTokens, faq),
  }));

  // Filter out FAQs with no score and sort by score (descending)
  const sortedFaqs = scoredFaqs
    .filter((faq) => faq.score > 0)
    .sort((a, b) => b.score - a.score); // Higher score first

  // Return top 3 results
  return sortedFaqs.slice(0, 3);
}

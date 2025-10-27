// hooks/useFaqSearch.js

/**
 * Calculates a relevance score for a FAQ based on keyword matches.
 * Prioritizes matches in the question. Adds a small bonus if all valid keywords match the question.
 * @param {string[]} validKeywords - Array of valid keywords (>= 2 chars) from user input.
 * @param {object} faq - The FAQ object { question: string, answer: string }.
 * @returns {number} The relevance score.
 */
function calculateScore(validKeywords, faq) {
  let score = 0;
  let questionMatchCount = 0;
  const questionText = faq.question.toLowerCase();
  const answerText = faq.answer.toLowerCase();

  validKeywords.forEach((word) => {
    // Score based on valid keywords (already filtered to >= 2 chars)
    if (questionText.includes(word)) {
      score += 2; // Higher score for question match
      questionMatchCount += 1; // FIX: Replaced ++ with += 1
    } else if (answerText.includes(word)) {
      score += 1; // Lower score for answer match
    }
  });

  // Add a small tie-breaking bonus if ALL valid keywords match the question
  if (validKeywords.length > 0 && questionMatchCount === validKeywords.length) {
    score += 1; // Bonus helps prioritize questions matching all terms
  }

  return score;
}

/**
 * Finds the top 3 most relevant FAQs based on keywords.
 * Ignores keywords shorter than 2 characters *entirely*.
 * @param {string} keyword - The search keyword string.
 * @param {Array<object>} allFaqs - Array of all FAQ objects.
 * @returns {Array<object>} Top 3 matching FAQs, sorted by score.
 */
export function findTopFaqs(keyword, allFaqs) {
  const trimmedKeyword = keyword.trim().toLowerCase();

  // If the overall trimmed keyword is less than 2, return empty
  if (trimmedKeyword.length < 2) {
    return [];
  }

  // Split into tokens and remove empty strings
  // FIX: Added parentheses around 'token'
  const keywordTokens = trimmedKeyword.split(/\s+/).filter((token) => token.length > 0);

  // Filter out any tokens that are shorter than 2 characters
  // FIX: Added parentheses around 'word'
  const validKeywords = keywordTokens.filter((word) => word.length >= 2);

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
    .sort((a, b) => b.score - a.score); // Higher score first

  // Return top 3 results
  return sortedFaqs.slice(0, 3);
}

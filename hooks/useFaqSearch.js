// hooks/useFaqSearch.js
export function findTopFaqs(keyword, allFaqs) {
    if (!keyword || !allFaqs) return [];
    const userWords = keyword.toLowerCase().trim().split(/\s+/);
    const scoredFaqs = allFaqs.map(faq => {
        let score = 0;
        const questionText = faq.question.toLowerCase();
        const answerText = faq.answer.toLowerCase();
        userWords.forEach(word => {
            if (word.length < 2) return;
            if (questionText.includes(word)) score += 2;
            if (answerText.includes(word)) score += 1;
        });
        return { ...faq, score };
    });
    return scoredFaqs.filter(faq => faq.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}
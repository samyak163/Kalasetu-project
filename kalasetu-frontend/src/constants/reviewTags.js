// kalasetu-frontend/src/constants/reviewTags.js

export const POSITIVE_TAGS = [
  'Excellent Craftsmanship',
  'On Time',
  'True to Photos',
  'Great Communication',
  'Exceeded Expectations',
  'Patient & Helpful',
  'Clean Workshop',
];

export const NEGATIVE_TAGS = [
  'Delayed',
  'Different from Photos',
  'Poor Packaging',
  'Unresponsive',
  'Overpriced',
];

export const ALL_TAGS = [...POSITIVE_TAGS, ...NEGATIVE_TAGS];

/**
 * Returns allowed tags based on the selected star rating.
 * 4-5 stars → positive only, 1-2 stars → negative only, 3 stars → all.
 */
export function getTagsForRating(rating) {
  if (rating >= 4) return POSITIVE_TAGS;
  if (rating <= 2) return NEGATIVE_TAGS;
  return ALL_TAGS; // 3 stars
}

/**
 * Returns 'positive' or 'negative' sentiment for a tag string.
 * Used by TagSummary for color coding.
 */
export function getTagSentiment(tag) {
  if (POSITIVE_TAGS.includes(tag)) return 'positive';
  if (NEGATIVE_TAGS.includes(tag)) return 'negative';
  return 'neutral';
}

import { max } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { op_Subtraction, compare, now as now_1, addDays } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { Mastery_level, Card, SRData as SRData_1 } from "./Types.fs.js";
import { truncate, length, map, sum, isEmpty, sortBy, filter } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { totalHours, totalMinutes, totalDays } from "./fable_modules/fable-library-js.4.24.0/TimeSpan.js";
import { comparePrimitives } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";

function newEaseFactor(current, difficulty) {
    return max(1.3, current + ((difficulty.tag === 1) ? -0.15 : ((difficulty.tag === 2) ? 0 : ((difficulty.tag === 3) ? 0.15 : -0.8))));
}

function newInterval(sr, difficulty) {
    switch (difficulty.tag) {
        case 1:
            switch (sr.Repetitions) {
                case 0:
                    return 1;
                case 1:
                    return 1;
                default:
                    return sr.Interval * 1.2;
            }
        case 2:
            switch (sr.Repetitions) {
                case 0:
                    return 1;
                case 1:
                    return 3;
                default:
                    return sr.Interval * sr.EaseFactor;
            }
        case 3:
            switch (sr.Repetitions) {
                case 0:
                    return 2;
                case 1:
                    return 4;
                default:
                    return (sr.Interval * sr.EaseFactor) * 1.3;
            }
        default:
            return 0;
    }
}

function newRepetitions(current, difficulty) {
    if (difficulty.tag === 0) {
        return 0;
    }
    else {
        return (current + 1) | 0;
    }
}

/**
 * Update a card's spaced repetition data after a review
 */
export function updateCard(card, difficulty) {
    const sr = card.SRData;
    const ef = newEaseFactor(sr.EaseFactor, difficulty);
    const interval = newInterval(sr, difficulty);
    return new Card(card.Id, card.Front, card.Back, card.CodeSnippet, card.Language, card.Tags, new SRData_1(interval, ef, newRepetitions(sr.Repetitions, difficulty), addDays(now_1(), interval), now_1()), card.CreatedAt);
}

/**
 * Get cards that are due for review (nextReview <= now)
 */
export function dueCards(cards) {
    const now = now_1();
    return filter((c) => (compare(c.SRData.NextReview, now) <= 0), cards);
}

/**
 * Get cards sorted by urgency (most overdue first, then new cards)
 */
export function sortByUrgency(cards) {
    const now = now_1();
    return sortBy((c) => -totalDays(op_Subtraction(now, c.SRData.NextReview)), cards, {
        Compare: comparePrimitives,
    });
}

/**
 * Calculate the estimated next review time for display
 */
export function nextReviewLabel(sr) {
    const diff = op_Subtraction(sr.NextReview, now_1());
    if (sr.Repetitions === 0) {
        return "New card";
    }
    else if (totalMinutes(diff) < 1) {
        return "Due now";
    }
    else if (totalHours(diff) < 1) {
        const arg = ~~totalMinutes(diff) | 0;
        return toText(printf("In %d min"))(arg);
    }
    else if (totalDays(diff) < 1) {
        const arg_1 = ~~totalHours(diff) | 0;
        return toText(printf("In %d hours"))(arg_1);
    }
    else if (totalDays(diff) < 7) {
        const arg_2 = ~~totalDays(diff) | 0;
        return toText(printf("In %d days"))(arg_2);
    }
    else if (totalDays(diff) < 30) {
        const arg_3 = ~~(totalDays(diff) / 7) | 0;
        return toText(printf("In %d weeks"))(arg_3);
    }
    else {
        const arg_4 = ~~(totalDays(diff) / 30) | 0;
        return toText(printf("In %d months"))(arg_4);
    }
}

/**
 * Calculate overall mastery percentage for a list of cards
 */
export function masteryPercentage(cards) {
    if (isEmpty(cards)) {
        return 0;
    }
    else {
        return (sum(map((c) => {
            const matchValue = Mastery_level(c.SRData);
            switch (matchValue.tag) {
                case 1:
                    return 0.33;
                case 2:
                    return 0.66;
                case 3:
                    return 1;
                default:
                    return 0;
            }
        }, cards), {
            GetZero: () => 0,
            Add: (x, y) => (x + y),
        }) / length(cards)) * 100;
    }
}

/**
 * Get a study session — returns up to N due cards, sorted by urgency
 */
export function getStudySession(maxCards, cards) {
    return truncate(maxCards, sortByUrgency(dueCards(cards)));
}


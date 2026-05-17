import { dayOfWeek, toString, compare, equals, addDays, now, date as date_1 } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { empty, singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { op_UnaryNegation_Int32 } from "./fable_modules/fable-library-js.4.24.0/Int32.js";
import { sumBy, tryFind, sortBy, collect as collect_1, max as max_1, isEmpty, ofArray, map, filter, length } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.24.0/Range.js";
import { FSharpSet__Contains, ofList } from "./fable_modules/fable-library-js.4.24.0/Set.js";
import { List_countBy, List_groupBy, List_distinct } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";
import { safeHash, equals as equals_1, int32ToString, comparePrimitives, createObj, dateHash } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { createElement } from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { defaultOf } from "./fable_modules/Feliz.2.9.0/../.././fable_modules/fable-library-js.4.24.0/Util.js";
import { max } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { item } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { Difficulty, Mastery_label, Mastery_color, Mastery_level } from "./Types.fs.js";
import { map as map_1, defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";

function dailyActivity(days, history) {
    const today = date_1(now());
    return toList(delay(() => collect((i) => {
        const date = addDays(today, op_UnaryNegation_Int32(i));
        const count = length(filter((r) => equals(date_1(r.ReviewedAt), date), history)) | 0;
        return singleton([date, count]);
    }, rangeDouble(days - 1, -1, 0))));
}

function studyStreak(history) {
    const today = date_1(now());
    const dates = ofList(List_distinct(map((r) => date_1(r.ReviewedAt), history), {
        Equals: equals,
        GetHashCode: dateHash,
    }), {
        Compare: compare,
    });
    let streak = 0;
    let day = today;
    if (!FSharpSet__Contains(dates, today)) {
        day = addDays(today, -1);
        if (!FSharpSet__Contains(dates, day)) {
            day = today;
        }
    }
    while (FSharpSet__Contains(dates, day)) {
        streak = ((streak + 1) | 0);
        day = addDays(day, -1);
    }
    return streak | 0;
}

function statCard(label, value, icon, color) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "stat-card"], (elems_1 = [createElement("div", {
        className: "stat-icon",
        style: {
            backgroundColor: color,
        },
        children: icon,
    }), createElement("div", createObj(ofArray([["className", "stat-content"], (elems = [createElement("div", {
        className: "stat-value",
        children: value,
    }), createElement("div", {
        className: "stat-label",
        children: label,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function activityChart(data) {
    let elems_3, elems_2;
    if (isEmpty(data)) {
        return defaultOf();
    }
    else {
        const maxVal = max(1, max_1(map((tuple) => tuple[1], data), {
            Compare: comparePrimitives,
        })) | 0;
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return createElement("div", createObj(ofArray([["className", "activity-chart"], (elems_3 = [createElement("div", createObj(ofArray([["className", "activity-bars"], (elems_2 = toList(delay(() => collect((matchValue) => {
            let arg, elems_1, elems;
            const date = matchValue[0];
            const count = matchValue[1] | 0;
            const heightPct = (count / maxVal) * 100;
            const isToday = equals(date_1(date), date_1(now()));
            return singleton(createElement("div", createObj(ofArray([["className", "activity-col"], ["title", (arg = toString(date, "MMM dd"), toText(printf("%s: %d reviews"))(arg)(count))], (elems_1 = [createElement("div", {
                className: "activity-value",
                children: (count > 0) ? int32ToString(count) : "",
            }), createElement("div", createObj(ofArray([["className", "activity-bar-track"], (elems = [createElement("div", {
                className: "activity-bar-fill",
                style: {
                    height: heightPct + "%",
                    backgroundColor: isToday ? "#6366f1" : "#3b82f6",
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("span", {
                className: isToday ? "activity-label today" : "activity-label",
                children: item(dayOfWeek(date), dayNames),
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
        }, data))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
    }
}

function masteryDistribution(decks) {
    let elems_3, elems, elems_2;
    const allCards = collect_1((d) => d.Cards, decks);
    if (isEmpty(allCards)) {
        return defaultOf();
    }
    else {
        const groups = sortBy((tupledArg_1) => {
            const level_1 = tupledArg_1[0];
            switch (level_1.tag) {
                case 1:
                    return 1;
                case 2:
                    return 2;
                case 3:
                    return 3;
                default:
                    return 0;
            }
        }, map((tupledArg) => {
            const level = tupledArg[0];
            const cards = tupledArg[1];
            return [level, length(cards)];
        }, List_groupBy((c) => Mastery_level(c.SRData), allCards, {
            Equals: equals_1,
            GetHashCode: safeHash,
        })), {
            Compare: comparePrimitives,
        });
        const total = length(allCards);
        return createElement("div", createObj(ofArray([["className", "mastery-dist"], (elems_3 = [createElement("h3", {
            children: "Card Mastery",
        }), createElement("div", createObj(ofArray([["className", "mastery-stacked-bar"], (elems = toList(delay(() => collect((matchValue) => {
            let arg;
            const level_2 = matchValue[0];
            const count = matchValue[1] | 0;
            const pct = (count / total) * 100;
            return (pct > 0) ? singleton(createElement("div", {
                className: "mastery-segment",
                style: {
                    width: pct + "%",
                    backgroundColor: Mastery_color(level_2),
                },
                title: (arg = Mastery_label(level_2), toText(printf("%s: %d cards (%.0f%%)"))(arg)(count)(pct)),
            })) : empty();
        }, groups))), ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "mastery-legend"], (elems_2 = toList(delay(() => collect((matchValue_1) => {
            let elems_1, arg_3;
            const level_3 = matchValue_1[0];
            const count_1 = matchValue_1[1] | 0;
            return singleton(createElement("div", createObj(ofArray([["className", "legend-item"], (elems_1 = [createElement("div", {
                className: "legend-dot",
                style: {
                    backgroundColor: Mastery_color(level_3),
                },
            }), createElement("span", {
                children: (arg_3 = Mastery_label(level_3), toText(printf("%s: %d"))(arg_3)(count_1)),
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
        }, groups))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
    }
}

function accuracyBreakdown(history) {
    let elems_3, elems_2;
    const recent = filter((r) => (compare(r.ReviewedAt, addDays(now(), -30)) >= 0), history);
    if (isEmpty(recent)) {
        return defaultOf();
    }
    else {
        const groups = List_countBy((r_1) => r_1.Difficulty, recent, {
            Equals: equals_1,
            GetHashCode: safeHash,
        });
        const total = length(recent);
        return createElement("div", createObj(ofArray([["className", "accuracy-section"], (elems_3 = [createElement("h3", {
            children: "Review Accuracy (30 days)",
        }), createElement("div", createObj(ofArray([["className", "accuracy-bars"], (elems_2 = toList(delay(() => collect((diff) => {
            let elems_1, elems;
            const count = defaultArg(map_1((tuple) => tuple[1], tryFind((tupledArg) => {
                const d = tupledArg[0];
                return equals_1(d, diff);
            }, groups)), 0) | 0;
            const pct = (count / total) * 100;
            const patternInput = (diff.tag === 2) ? ["Good", "#3b82f6"] : ((diff.tag === 1) ? ["Hard", "#f59e0b"] : ((diff.tag === 0) ? ["Again", "#ef4444"] : ["Easy", "#22c55e"]));
            const label = patternInput[0];
            const color = patternInput[1];
            return singleton(createElement("div", createObj(ofArray([["className", "accuracy-row"], (elems_1 = [createElement("span", {
                className: "accuracy-label",
                children: label,
            }), createElement("div", createObj(ofArray([["className", "accuracy-bar-track"], (elems = [createElement("div", {
                className: "accuracy-bar-fill",
                style: {
                    width: pct + "%",
                    backgroundColor: color,
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("span", {
                className: "accuracy-count",
                children: toText(printf("%d (%.0f%%)"))(count)(pct),
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
        }, [new Difficulty(3, []), new Difficulty(2, []), new Difficulty(1, []), new Difficulty(0, [])]))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
    }
}

/**
 * Main stats view
 */
export function view(model, _dispatch) {
    let elems_2, elems, elems_1;
    const totalCards = sumBy((d) => length(d.Cards), model.Decks, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    }) | 0;
    const totalReviews = length(model.ReviewHistory) | 0;
    const streak = studyStreak(model.ReviewHistory) | 0;
    const todayReviews = length(filter((r) => equals(date_1(r.ReviewedAt), date_1(now())), model.ReviewHistory)) | 0;
    const daily = dailyActivity(14, model.ReviewHistory);
    return createElement("div", createObj(ofArray([["className", "stats-page"], (elems_2 = [createElement("h2", {
        children: "Study Statistics",
    }), createElement("div", createObj(ofArray([["className", "stat-cards"], (elems = [statCard("Total Cards", int32ToString(totalCards), "📚", "#6366f1"), statCard("Reviews Today", int32ToString(todayReviews), "📝", "#3b82f6"), statCard("Study Streak", toText(printf("%d days"))(streak), "🔥", "#f59e0b"), statCard("All Reviews", int32ToString(totalReviews), "📊", "#22c55e")], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "chart-section"], (elems_1 = [createElement("h3", {
        children: "Last 14 Days",
    }), activityChart(daily)], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), masteryDistribution(model.Decks), accuracyBreakdown(model.ReviewHistory)], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}


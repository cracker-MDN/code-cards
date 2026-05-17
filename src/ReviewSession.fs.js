import { createElement } from "react";
import { safeHash, equals, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { item, isEmpty, tryFind, filter, length, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { CardSide, Mastery_label, Mastery_color, Mastery_level, ActiveView, Msg, Difficulty } from "./Types.fs.js";
import { map, empty, append, singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { List_countBy } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";
import { getStudySession, dueCards } from "./SpacedRepetition.fs.js";
import { render } from "./CodeHighlight.fs.js";

function progressBar(current, total, color) {
    let elems;
    const pct = (total === 0) ? 0 : ((current / total) * 100);
    return createElement("div", createObj(ofArray([["className", "review-progress"], (elems = [createElement("div", {
        className: "review-progress-bar",
        style: {
            width: pct + "%",
            backgroundColor: color,
        },
    }), createElement("span", {
        className: "review-progress-text",
        children: toText(printf("%d / %d"))(current)(total),
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function ratingButtons(dispatch) {
    let elems_4, elems, elems_1, elems_2, elems_3;
    return createElement("div", createObj(ofArray([["className", "rating-buttons"], (elems_4 = [createElement("button", createObj(ofArray([["className", "rate-btn rate-again"], ["onClick", (_arg) => {
        dispatch(new Msg(21, [new Difficulty(0, [])]));
    }], (elems = [createElement("span", {
        className: "rate-label",
        children: "Again",
    }), createElement("span", {
        className: "rate-hint",
        children: "< 1 min",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("button", createObj(ofArray([["className", "rate-btn rate-hard"], ["onClick", (_arg_1) => {
        dispatch(new Msg(21, [new Difficulty(1, [])]));
    }], (elems_1 = [createElement("span", {
        className: "rate-label",
        children: "Hard",
    }), createElement("span", {
        className: "rate-hint",
        children: "1 day",
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("button", createObj(ofArray([["className", "rate-btn rate-good"], ["onClick", (_arg_2) => {
        dispatch(new Msg(21, [new Difficulty(2, [])]));
    }], (elems_2 = [createElement("span", {
        className: "rate-label",
        children: "Good",
    }), createElement("span", {
        className: "rate-hint",
        children: "3 days",
    })], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("button", createObj(ofArray([["className", "rate-btn rate-easy"], ["onClick", (_arg_3) => {
        dispatch(new Msg(21, [new Difficulty(3, [])]));
    }], (elems_3 = [createElement("span", {
        className: "rate-label",
        children: "Easy",
    }), createElement("span", {
        className: "rate-hint",
        children: "7 days",
    })], ["children", reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", reactApi.Children.toArray(Array.from(elems_4))])])));
}

function sessionComplete(results, deck, dispatch) {
    let elems_3, elems_1, elems_2;
    const total = length(results) | 0;
    const correct = length(filter((r) => !equals(r.Difficulty, new Difficulty(0, [])), results)) | 0;
    const pct = (total === 0) ? 0 : ((correct / total) * 100);
    return createElement("div", createObj(ofArray([["className", "session-complete"], (elems_3 = [createElement("div", {
        className: "complete-icon",
        children: "🎉",
    }), createElement("h2", {
        children: "Session Complete!",
    }), createElement("p", {
        className: "complete-stats",
        children: toText(printf("%d/%d correct (%.0f%%)"))(correct)(total)(pct),
    }), createElement("div", createObj(ofArray([["className", "result-breakdown"], (elems_1 = toList(delay(() => {
        const groups = List_countBy((r_1) => r_1.Difficulty, results, {
            Equals: equals,
            GetHashCode: safeHash,
        });
        return collect((matchValue) => {
            let elems;
            const diff = matchValue[0];
            const count = matchValue[1] | 0;
            const patternInput = (diff.tag === 1) ? ["Hard", "#f59e0b"] : ((diff.tag === 2) ? ["Good", "#3b82f6"] : ((diff.tag === 3) ? ["Easy", "#22c55e"] : ["Again", "#ef4444"]));
            const label = patternInput[0];
            const color = patternInput[1];
            return singleton(createElement("div", createObj(ofArray([["className", "result-item"], (elems = [createElement("div", {
                className: "result-dot",
                style: {
                    backgroundColor: color,
                },
            }), createElement("span", {
                children: toText(printf("%s: %d"))(label)(count),
            })], ["children", reactApi.Children.toArray(Array.from(elems))])]))));
        }, groups);
    })), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "complete-actions"], (elems_2 = toList(delay(() => append(singleton(createElement("button", {
        className: "btn btn-primary btn-large",
        children: "Back to Deck",
        onClick: (_arg) => {
            dispatch(new Msg(0, [new ActiveView(1, [deck.Id])]));
        },
    })), delay(() => {
        const remaining = length(dueCards(deck.Cards)) | 0;
        return (remaining > 0) ? singleton(createElement("button", {
            className: "btn btn-secondary btn-large",
            children: toText(printf("Continue (%d more)"))(remaining),
            onClick: (_arg_1) => {
                dispatch(new Msg(19, [deck.Id]));
            },
        })) : empty();
    })))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

/**
 * Main review view
 */
export function view(deckId, model, dispatch) {
    let elems_2, elems_1, elems_3, elems_9, elems;
    const deck = tryFind((d) => (d.Id === deckId), model.Decks);
    if (deck != null) {
        const deck_1 = deck;
        const studyCards = getStudySession(20, deck_1.Cards);
        const totalCards = length(studyCards) | 0;
        if ((totalCards === 0) && isEmpty(model.SessionResults)) {
            return createElement("div", createObj(ofArray([["className", "review-page"], (elems_2 = [createElement("div", createObj(ofArray([["className", "empty-state"], (elems_1 = [createElement("div", {
                className: "empty-icon",
                children: "✅",
            }), createElement("h3", {
                children: "All caught up!",
            }), createElement("p", {
                children: "No cards are due for review.",
            }), createElement("button", {
                className: "btn btn-primary",
                children: "Back to Deck",
                onClick: (_arg) => {
                    dispatch(new Msg(0, [new ActiveView(1, [deck_1.Id])]));
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
        }
        else if (model.CurrentCardIndex >= totalCards) {
            return createElement("div", createObj(ofArray([["className", "review-page"], (elems_3 = [sessionComplete(model.SessionResults, deck_1, dispatch)], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
        }
        else {
            const card = item(model.CurrentCardIndex, studyCards);
            const mastery = Mastery_level(card.SRData);
            return createElement("div", createObj(ofArray([["className", "review-page"], (elems_9 = toList(delay(() => {
                let elems_4;
                return append(singleton(createElement("div", createObj(ofArray([["className", "review-header"], (elems_4 = [createElement("button", {
                    className: "btn-back",
                    children: "← End",
                    onClick: (_arg_1) => {
                        dispatch(new Msg(23, []));
                    },
                }), createElement("span", {
                    className: "review-deck-name",
                    children: deck_1.Name,
                })], ["children", reactApi.Children.toArray(Array.from(elems_4))])])))), delay(() => append(singleton(progressBar(model.CurrentCardIndex + 1, totalCards, deck_1.Color)), delay(() => append(singleton(createElement("div", {
                    className: "card-mastery-tag",
                    style: {
                        backgroundColor: Mastery_color(mastery),
                    },
                    children: Mastery_label(mastery),
                })), delay(() => {
                    let elems_7;
                    return append(singleton(createElement("div", createObj(ofArray([["className", equals(model.CardSide, new CardSide(1, [])) ? "review-card flipped" : "review-card"], ["onClick", (_arg_2) => {
                        if (equals(model.CardSide, new CardSide(0, []))) {
                            dispatch(new Msg(20, []));
                        }
                    }], (elems_7 = toList(delay(() => {
                        let elems_6, elems_5;
                        return (model.CardSide.tag === 1) ? singleton(createElement("div", createObj(ofArray([["className", "card-content back"], (elems_6 = toList(delay(() => append(singleton(createElement("p", {
                            className: "card-question-echo",
                            children: card.Front,
                        })), delay(() => append(singleton(createElement("hr", {})), delay(() => append(singleton(createElement("p", {
                            className: "card-text",
                            children: card.Back,
                        })), delay(() => ((card.CodeSnippet !== "") ? singleton(render(card.Language, card.CodeSnippet)) : empty()))))))))), ["children", reactApi.Children.toArray(Array.from(elems_6))])])))) : singleton(createElement("div", createObj(ofArray([["className", "card-content front"], (elems_5 = toList(delay(() => append(singleton(createElement("p", {
                            className: "card-text",
                            children: card.Front,
                        })), delay(() => append((card.CodeSnippet !== "") ? singleton(render(card.Language, card.CodeSnippet)) : empty(), delay(() => singleton(createElement("p", {
                            className: "flip-hint",
                            children: "Tap to reveal answer",
                        })))))))), ["children", reactApi.Children.toArray(Array.from(elems_5))])]))));
                    })), ["children", reactApi.Children.toArray(Array.from(elems_7))])])))), delay(() => append(equals(model.CardSide, new CardSide(1, [])) ? singleton(ratingButtons(dispatch)) : singleton(createElement("button", {
                        className: "btn btn-primary btn-large btn-flip",
                        children: "Show Answer",
                        onClick: (_arg_3) => {
                            dispatch(new Msg(20, []));
                        },
                    })), delay(() => {
                        let elems_8;
                        return !isEmpty(card.Tags) ? singleton(createElement("div", createObj(ofArray([["className", "card-tags"], (elems_8 = toList(delay(() => map((tag) => createElement("span", {
                            className: "tag",
                            children: tag,
                        }), card.Tags))), ["children", reactApi.Children.toArray(Array.from(elems_8))])])))) : empty();
                    }))));
                }))))));
            })), ["children", reactApi.Children.toArray(Array.from(elems_9))])])));
        }
    }
    else {
        return createElement("div", createObj(ofArray([["className", "review-page"], (elems = [createElement("p", {
            children: "Deck not found.",
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
    }
}


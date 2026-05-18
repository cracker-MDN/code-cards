import { isEmpty, sumBy, filter, ofArray, length, map } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { List_groupBy } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";
import { Colors_palette, Icons_all, Msg, ActiveView, Mastery_label, Mastery_color, Mastery_level } from "./Types.fs.js";
import { createObj, safeHash, equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { createElement } from "react";
import { map as map_1, empty, append, singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { masteryPercentage, dueCards } from "./SpacedRepetition.fs.js";

function masteryBadges(cards) {
    let elems;
    const counts = map((tupledArg) => [tupledArg[0], length(tupledArg[1])], List_groupBy((c) => Mastery_level(c.SRData), cards, {
        Equals: equals,
        GetHashCode: safeHash,
    }));
    return createElement("div", createObj(ofArray([["className", "mastery-badges"], (elems = toList(delay(() => collect((matchValue) => {
        let arg_1;
        const level_1 = matchValue[0];
        return singleton(createElement("span", {
            className: "mastery-badge",
            style: {
                backgroundColor: Mastery_color(level_1),
            },
            children: (arg_1 = Mastery_label(level_1), toText(printf("%d %s"))(matchValue[1])(arg_1)),
        }));
    }, counts))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function deckCard(deck, dispatch) {
    let elems_5, elems_1, elems_4;
    const totalCards = length(deck.Cards) | 0;
    const dueCount = length(dueCards(deck.Cards)) | 0;
    const mastery = masteryPercentage(deck.Cards);
    return createElement("div", createObj(ofArray([["className", "deck-card"], ["onClick", (_arg) => {
        dispatch(new Msg(0, [new ActiveView(1, [deck.Id])]));
    }], (elems_5 = [createElement("div", createObj(ofArray([["className", "deck-card-header"], ["style", {
        backgroundColor: deck.Color,
    }], (elems_1 = toList(delay(() => append(singleton(createElement("span", {
        className: "deck-icon",
        children: deck.Icon,
    })), delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "deck-card-actions"], (elems = [createElement("button", {
            className: "btn-icon-light",
            children: "✎",
            title: "Edit deck",
            onClick: (e) => {
                e.stopPropagation();
                dispatch(new Msg(7, [deck.Id]));
            },
        }), createElement("button", {
            className: "btn-icon-light btn-delete-light",
            children: "×",
            title: "Delete deck",
            onClick: (e_1) => {
                e_1.stopPropagation();
                dispatch(new Msg(9, [deck.Id]));
            },
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => ((dueCount > 0) ? singleton(createElement("span", {
            className: "due-count-badge",
            children: toText(printf("%d due today"))(dueCount),
        })) : empty())));
    })))), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "deck-card-body"], (elems_4 = toList(delay(() => append(singleton(createElement("h3", {
        className: "deck-name",
        children: deck.Name,
    })), delay(() => append(singleton(createElement("p", {
        className: "deck-desc",
        children: deck.Description,
    })), delay(() => {
        let elems_2;
        return append(singleton(createElement("div", createObj(ofArray([["className", "deck-stats-row"], (elems_2 = toList(delay(() => append(singleton(createElement("span", {
            children: toText(printf("%d cards"))(totalCards),
        })), delay(() => ((dueCount > 0) ? singleton(createElement("span", {
            className: "due-badge",
            children: toText(printf("%d due"))(dueCount),
        })) : empty()))))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))), delay(() => {
            let elems_3;
            return append((totalCards > 0) ? append(singleton(createElement("div", createObj(ofArray([["className", "mastery-bar-wrap"], (elems_3 = [createElement("div", {
                className: "mastery-bar",
                style: {
                    width: mastery + "%",
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems_3))])])))), delay(() => singleton(createElement("span", {
                className: "mastery-pct",
                children: toText(printf("%.0f%% mastered"))(mastery),
            })))) : empty(), delay(() => ((dueCount > 0) ? singleton(createElement("button", {
                className: "btn btn-study",
                style: {
                    backgroundColor: deck.Color,
                },
                children: toText(printf("Study %d cards"))(dueCount),
                onClick: (e_2) => {
                    e_2.stopPropagation();
                    dispatch(new Msg(19, [deck.Id]));
                },
            })) : empty())));
        }));
    })))))), ["children", reactApi.Children.toArray(Array.from(elems_4))])])))], ["children", reactApi.Children.toArray(Array.from(elems_5))])])));
}

function iconPicker(selected, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "icon-picker"], (elems = toList(delay(() => map_1((icon) => createElement("button", {
        className: (icon === selected) ? "icon-btn selected" : "icon-btn",
        children: icon,
        onClick: (_arg) => {
            dispatch(new Msg(5, [icon]));
        },
    }), Icons_all))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function colorPicker(selected, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "color-picker"], (elems = toList(delay(() => map_1((color) => createElement("button", {
        className: (color === selected) ? "color-dot selected" : "color-dot",
        style: {
            backgroundColor: color,
        },
        onClick: (_arg) => {
            dispatch(new Msg(4, [color]));
        },
    }), Colors_palette))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function deckForm(model, dispatch) {
    let elems_2, elems_1, elems;
    const isEditing = model.EditingDeckId != null;
    return createElement("div", createObj(ofArray([["className", "deck-form-overlay"], ["onClick", (_arg) => {
        dispatch(new Msg(10, []));
    }], (elems_2 = [createElement("div", createObj(ofArray([["className", "deck-form"], ["onClick", (e) => {
        e.stopPropagation();
    }], (elems_1 = [createElement("h3", {
        children: isEditing ? "Edit Deck" : "New Deck",
    }), createElement("input", {
        className: "text-input",
        placeholder: "Deck name...",
        value: model.DeckForm.Name,
        autoFocus: true,
        onChange: (ev) => {
            dispatch(new Msg(2, [ev.target.value]));
        },
    }), createElement("textarea", {
        className: "text-input",
        placeholder: "Description (optional)...",
        value: model.DeckForm.Description,
        rows: 2,
        onChange: (ev_1) => {
            dispatch(new Msg(3, [ev_1.target.value]));
        },
    }), createElement("label", {
        className: "form-label",
        children: "Icon",
    }), iconPicker(model.DeckForm.Icon, dispatch), createElement("label", {
        className: "form-label",
        children: "Color",
    }), colorPicker(model.DeckForm.Color, dispatch), createElement("div", createObj(ofArray([["className", "form-actions"], (elems = [createElement("button", {
        className: "btn btn-primary",
        children: isEditing ? "Save" : "Create Deck",
        disabled: model.DeckForm.Name.trim() === "",
        onClick: (_arg_1) => {
            dispatch(new Msg(8, []));
        },
    }), createElement("button", {
        className: "btn btn-secondary",
        children: "Cancel",
        onClick: (_arg_2) => {
            dispatch(new Msg(10, []));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

/**
 * Main deck list view
 */
export function view(model, dispatch) {
    let elems_4;
    const filteredDecks = (model.SearchQuery === "") ? model.Decks : filter((d) => {
        if (d.Name.toLocaleLowerCase().indexOf(model.SearchQuery.toLocaleLowerCase()) >= 0) {
            return true;
        }
        else {
            return d.Description.toLocaleLowerCase().indexOf(model.SearchQuery.toLocaleLowerCase()) >= 0;
        }
    }, model.Decks);
    const totalDue = sumBy((d_1) => length(dueCards(d_1.Cards)), model.Decks, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    }) | 0;
    return createElement("div", createObj(ofArray([["className", "deck-list-page"], (elems_4 = toList(delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "page-top"], (elems = toList(delay(() => append(singleton(createElement("h2", {
            children: "My Decks",
        })), delay(() => ((totalDue > 0) ? singleton(createElement("span", {
            className: "total-due",
            children: toText(printf("%d cards due"))(totalDue),
        })) : empty()))))), ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => {
            let elems_1;
            return append(singleton(createElement("div", createObj(ofArray([["className", "search-wrap"], (elems_1 = [createElement("span", {
                className: "search-icon",
                children: "🔍",
            }), createElement("input", {
                className: "search-input",
                placeholder: "Search decks...",
                value: model.SearchQuery,
                onChange: (ev) => {
                    dispatch(new Msg(24, [ev.target.value]));
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))), delay(() => {
                let elems_2, elems_3;
                return append((isEmpty(filteredDecks) && isEmpty(model.Decks)) ? singleton(createElement("div", createObj(ofArray([["className", "empty-state"], (elems_2 = [createElement("div", {
                    className: "empty-icon",
                    children: "📚",
                }), createElement("p", {
                    children: "No decks yet.",
                }), createElement("p", {
                    className: "empty-hint",
                    children: "Create your first deck to start studying!",
                })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])))) : singleton(createElement("div", createObj(ofArray([["className", "deck-grid"], (elems_3 = toList(delay(() => map_1((deck) => deckCard(deck, dispatch), filteredDecks))), ["children", reactApi.Children.toArray(Array.from(elems_3))])])))), delay(() => append(singleton(createElement("button", {
                    className: "fab",
                    children: "+",
                    title: "Create new deck",
                    onClick: (_arg) => {
                        dispatch(new Msg(6, []));
                    },
                })), delay(() => (model.ShowDeckForm ? singleton(deckForm(model, dispatch)) : empty())))));
            }));
        }));
    })), ["children", reactApi.Children.toArray(Array.from(elems_4))])])));
}


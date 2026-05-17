import { exportDeck, importDeck, saveHistory, saveDecks, loadHistory, loadDecks } from "./Storage.fs.js";
import { Mastery_label, Mastery_color, Mastery_level, Msg, CardFormState_FromCard_4CE19D30, ReviewResult, SRData_get_New, Card, CardFormState, DeckFormState, Deck, Model, DeckFormState_get_Empty, CardFormState_get_Empty, CardSide as CardSide_4, ActiveView as ActiveView_11 } from "./Types.fs.js";
import { isEmpty, contains, cons, item, length, filter, singleton, append, tryFind, map as map_1, ofArray, empty } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { map } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { printf, toText, split } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { newGuid } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { now } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { nextReviewLabel, masteryPercentage, dueCards, updateCard, getStudySession } from "./SpacedRepetition.fs.js";
import { createObj, stringHash } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { bind } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { createElement } from "react";
import { collect, empty as empty_1, singleton as singleton_1, append as append_1, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { view as view_2 } from "./CardEditor.fs.js";
import { view as view_3 } from "./ReviewSession.fs.js";
import { view as view_4 } from "./Stats.fs.js";
import { view as view_5 } from "./DeckManager.fs.js";

/**
 * Initialize application from localStorage
 */
export function init() {
    const decks = loadDecks();
    const history = loadHistory();
    return new Model(decks, history, new ActiveView_11(0, []), 0, new CardSide_4(0, []), empty(), CardFormState_get_Empty(), DeckFormState_get_Empty(), false, undefined, "", empty());
}

function parseTags(input) {
    let array_1;
    return ofArray((array_1 = map((s) => s.trim(), split(input, [","], undefined, 0)), array_1.filter((s_1) => (s_1 !== ""))));
}

function updateCardInDeck(deckId, cardId, updater, decks) {
    return map_1((d) => {
        if (d.Id === deckId) {
            return new Deck(d.Id, d.Name, d.Description, d.Color, d.Icon, map_1((c) => {
                if (c.Id === cardId) {
                    return updater(c);
                }
                else {
                    return c;
                }
            }, d.Cards), d.CreatedAt);
        }
        else {
            return d;
        }
    }, decks);
}

/**
 * Update function
 */
export function update(msg, model) {
    let bind$0040, bind$0040_1, bind$0040_2, bind$0040_3, bind$0040_4, bind$0040_5, bind$0040_6, bind$0040_7, bind$0040_8;
    switch (msg.tag) {
        case 1: {
            const matchValue = model.ActiveView;
            switch (matchValue.tag) {
                case 1:
                    return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(0, []), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                case 2: {
                    const deckId_1 = matchValue.fields[0];
                    return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(1, [deckId_1]), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                }
                case 3: {
                    const deckId_2 = matchValue.fields[0];
                    return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(1, [deckId_2]), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                }
                default:
                    return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(0, []), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
            }
        }
        case 2: {
            const v = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, (bind$0040 = model.DeckForm, new DeckFormState(v, bind$0040.Description, bind$0040.Color, bind$0040.Icon)), model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 3: {
            const v_1 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, (bind$0040_1 = model.DeckForm, new DeckFormState(bind$0040_1.Name, v_1, bind$0040_1.Color, bind$0040_1.Icon)), model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 4: {
            const v_2 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, (bind$0040_2 = model.DeckForm, new DeckFormState(bind$0040_2.Name, bind$0040_2.Description, v_2, bind$0040_2.Icon)), model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 5: {
            const v_3 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, (bind$0040_3 = model.DeckForm, new DeckFormState(bind$0040_3.Name, bind$0040_3.Description, bind$0040_3.Color, v_3)), model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 6:
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, DeckFormState_get_Empty(), true, undefined, model.SearchQuery, model.SelectedTags);
        case 7: {
            const id = msg.fields[0];
            const matchValue_1 = tryFind((d_2) => (d_2.Id === id), model.Decks);
            if (matchValue_1 == null) {
                return model;
            }
            else {
                const d_3 = matchValue_1;
                return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, new DeckFormState(d_3.Name, d_3.Description, d_3.Color, d_3.Icon), true, id, model.SearchQuery, model.SelectedTags);
            }
        }
        case 8: {
            const name = model.DeckForm.Name.trim();
            if (name === "") {
                return model;
            }
            else {
                const matchValue_2 = model.EditingDeckId;
                if (matchValue_2 == null) {
                    const deck = new Deck(newGuid(), name, model.DeckForm.Description.trim(), model.DeckForm.Color, model.DeckForm.Icon, empty(), now());
                    const newDecks_1 = append(model.Decks, singleton(deck));
                    saveDecks(newDecks_1);
                    return new Model(newDecks_1, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, DeckFormState_get_Empty(), false, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                }
                else {
                    const id_1 = matchValue_2;
                    const newDecks = map_1((d_4) => {
                        if (d_4.Id === id_1) {
                            return new Deck(d_4.Id, name, model.DeckForm.Description.trim(), model.DeckForm.Color, model.DeckForm.Icon, d_4.Cards, d_4.CreatedAt);
                        }
                        else {
                            return d_4;
                        }
                    }, model.Decks);
                    saveDecks(newDecks);
                    return new Model(newDecks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, DeckFormState_get_Empty(), false, undefined, model.SearchQuery, model.SelectedTags);
                }
            }
        }
        case 9: {
            const id_2 = msg.fields[0];
            const newDecks_2 = filter((d_5) => (d_5.Id !== id_2), model.Decks);
            saveDecks(newDecks_2);
            return new Model(newDecks_2, model.ReviewHistory, new ActiveView_11(0, []), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 10:
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, DeckFormState_get_Empty(), false, undefined, model.SearchQuery, model.SelectedTags);
        case 11: {
            const v_4 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, (bind$0040_4 = model.CardForm, new CardFormState(v_4, bind$0040_4.Back, bind$0040_4.CodeSnippet, bind$0040_4.Language, bind$0040_4.Tags)), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 12: {
            const v_5 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, (bind$0040_5 = model.CardForm, new CardFormState(bind$0040_5.Front, v_5, bind$0040_5.CodeSnippet, bind$0040_5.Language, bind$0040_5.Tags)), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 13: {
            const v_6 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, (bind$0040_6 = model.CardForm, new CardFormState(bind$0040_6.Front, bind$0040_6.Back, v_6, bind$0040_6.Language, bind$0040_6.Tags)), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 14: {
            const l = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, (bind$0040_7 = model.CardForm, new CardFormState(bind$0040_7.Front, bind$0040_7.Back, bind$0040_7.CodeSnippet, l, bind$0040_7.Tags)), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 15: {
            const v_7 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, (bind$0040_8 = model.CardForm, new CardFormState(bind$0040_8.Front, bind$0040_8.Back, bind$0040_8.CodeSnippet, bind$0040_8.Language, v_7)), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 16: {
            const deckId_3 = msg.fields[0];
            const front = model.CardForm.Front.trim();
            const back = model.CardForm.Back.trim();
            if ((front === "") ? true : (back === "")) {
                return model;
            }
            else {
                const tags = parseTags(model.CardForm.Tags);
                const matchValue_3 = model.ActiveView;
                let matchResult, cardId_1;
                if (matchValue_3.tag === 2) {
                    if (matchValue_3.fields[1] != null) {
                        matchResult = 0;
                        cardId_1 = matchValue_3.fields[1];
                    }
                    else {
                        matchResult = 1;
                    }
                }
                else {
                    matchResult = 1;
                }
                switch (matchResult) {
                    case 0: {
                        const newDecks_3 = updateCardInDeck(deckId_3, cardId_1, (c_2) => (new Card(c_2.Id, front, back, model.CardForm.CodeSnippet, model.CardForm.Language, tags, c_2.SRData, c_2.CreatedAt)), model.Decks);
                        saveDecks(newDecks_3);
                        return new Model(newDecks_3, model.ReviewHistory, new ActiveView_11(1, [deckId_3]), model.CurrentCardIndex, model.CardSide, model.SessionResults, CardFormState_get_Empty(), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                    }
                    default: {
                        const card_1 = new Card(newGuid(), front, back, model.CardForm.CodeSnippet, model.CardForm.Language, tags, SRData_get_New(), now());
                        const newDecks_4 = map_1((d_6) => {
                            if (d_6.Id === deckId_3) {
                                return new Deck(d_6.Id, d_6.Name, d_6.Description, d_6.Color, d_6.Icon, append(d_6.Cards, singleton(card_1)), d_6.CreatedAt);
                            }
                            else {
                                return d_6;
                            }
                        }, model.Decks);
                        saveDecks(newDecks_4);
                        return new Model(newDecks_4, model.ReviewHistory, new ActiveView_11(1, [deckId_3]), model.CurrentCardIndex, model.CardSide, model.SessionResults, CardFormState_get_Empty(), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                    }
                }
            }
        }
        case 17: {
            const deckId_4 = msg.fields[0];
            const cardId_2 = msg.fields[1];
            const newDecks_5 = map_1((d_7) => {
                if (d_7.Id === deckId_4) {
                    return new Deck(d_7.Id, d_7.Name, d_7.Description, d_7.Color, d_7.Icon, filter((c_3) => (c_3.Id !== cardId_2), d_7.Cards), d_7.CreatedAt);
                }
                else {
                    return d_7;
                }
            }, model.Decks);
            saveDecks(newDecks_5);
            return new Model(newDecks_5, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 18: {
            const matchValue_4 = model.ActiveView;
            if (matchValue_4.tag === 2) {
                const deckId_5 = matchValue_4.fields[0];
                return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(1, [deckId_5]), model.CurrentCardIndex, model.CardSide, model.SessionResults, CardFormState_get_Empty(), model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
            }
            else {
                return model;
            }
        }
        case 19: {
            const deckId_6 = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(3, [deckId_6]), 0, new CardSide_4(0, []), empty(), model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
        case 20:
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, new CardSide_4(1, []), model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        case 21: {
            const difficulty = msg.fields[0];
            const matchValue_5 = model.ActiveView;
            if (matchValue_5.tag === 3) {
                const deckId_7 = matchValue_5.fields[0];
                const deck_1 = tryFind((d_8) => (d_8.Id === deckId_7), model.Decks);
                if (deck_1 == null) {
                    return model;
                }
                else {
                    const deck_2 = deck_1;
                    const studyCards = getStudySession(20, deck_2.Cards);
                    if (model.CurrentCardIndex < length(studyCards)) {
                        const card_2 = item(model.CurrentCardIndex, studyCards);
                        const updatedCard = updateCard(card_2, difficulty);
                        const newDecks_6 = updateCardInDeck(deckId_7, card_2.Id, (_arg) => updatedCard, model.Decks);
                        const result = new ReviewResult(card_2.Id, deckId_7, difficulty, now());
                        const newHistory = cons(result, model.ReviewHistory);
                        saveDecks(newDecks_6);
                        saveHistory(newHistory);
                        return new Model(newDecks_6, newHistory, model.ActiveView, model.CurrentCardIndex + 1, new CardSide_4(0, []), append(model.SessionResults, singleton(result)), model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
                    }
                    else {
                        return model;
                    }
                }
            }
            else {
                return model;
            }
        }
        case 22:
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex + 1, new CardSide_4(0, []), model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        case 23: {
            const matchValue_6 = model.ActiveView;
            if (matchValue_6.tag === 3) {
                const deckId_8 = matchValue_6.fields[0];
                return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(1, [deckId_8]), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
            }
            else {
                return new Model(model.Decks, model.ReviewHistory, new ActiveView_11(0, []), model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
            }
        }
        case 24: {
            const q = msg.fields[0];
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, q, model.SelectedTags);
        }
        case 25: {
            const tag = msg.fields[0];
            const tags_1 = contains(tag, model.SelectedTags, {
                Equals: (x, y) => (x === y),
                GetHashCode: stringHash,
            }) ? filter((t) => (t !== tag), model.SelectedTags) : cons(tag, model.SelectedTags);
            return new Model(model.Decks, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, tags_1);
        }
        case 26: {
            const json = msg.fields[0];
            const matchValue_7 = importDeck(json);
            if (matchValue_7 == null) {
                return model;
            }
            else {
                const deck_3 = matchValue_7;
                const newDecks_7 = append(model.Decks, singleton(deck_3));
                saveDecks(newDecks_7);
                return new Model(newDecks_7, model.ReviewHistory, model.ActiveView, model.CurrentCardIndex, model.CardSide, model.SessionResults, model.CardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
            }
        }
        case 27: {
            const deckId_9 = msg.fields[0];
            const matchValue_8 = tryFind((d_9) => (d_9.Id === deckId_9), model.Decks);
            if (matchValue_8 == null) {
                return model;
            }
            else {
                const deck_4 = matchValue_8;
                const json_1 = exportDeck(deck_4);
                navigator.clipboard?.writeText(json_1);
                return model;
            }
        }
        default: {
            const view_1 = msg.fields[0];
            let cardForm;
            if (view_1.tag === 2) {
                if (view_1.fields[1] != null) {
                    const cardId = view_1.fields[1];
                    const deckId = view_1.fields[0];
                    const card = bind((d_1) => tryFind((c) => (c.Id === cardId), d_1.Cards), tryFind((d) => (d.Id === deckId), model.Decks));
                    if (card == null) {
                        cardForm = CardFormState_get_Empty();
                    }
                    else {
                        const c_1 = card;
                        cardForm = CardFormState_FromCard_4CE19D30(c_1);
                    }
                }
                else {
                    cardForm = CardFormState_get_Empty();
                }
            }
            else {
                cardForm = model.CardForm;
            }
            return new Model(model.Decks, model.ReviewHistory, view_1, model.CurrentCardIndex, model.CardSide, model.SessionResults, cardForm, model.DeckForm, model.ShowDeckForm, model.EditingDeckId, model.SearchQuery, model.SelectedTags);
        }
    }
}

function deckDetailView(deckId, model, dispatch) {
    let elems_9, elems_1, elems_8;
    const deck = tryFind((d) => (d.Id === deckId), model.Decks);
    if (deck != null) {
        const deck_1 = deck;
        const dueCount = length(dueCards(deck_1.Cards)) | 0;
        const mastery = masteryPercentage(deck_1.Cards);
        return createElement("div", createObj(ofArray([["className", "deck-detail-page"], (elems_9 = [createElement("button", {
            className: "btn-back",
            children: "← All Decks",
            onClick: (_arg) => {
                dispatch(new Msg(0, [new ActiveView_11(0, [])]));
            },
        }), createElement("div", createObj(ofArray([["className", "deck-detail-header"], ["style", {
            backgroundColor: deck_1.Color,
        }], (elems_1 = toList(delay(() => append_1(singleton_1(createElement("span", {
            className: "deck-detail-icon",
            children: deck_1.Icon,
        })), delay(() => append_1(singleton_1(createElement("h2", {
            children: deck_1.Name,
        })), delay(() => append_1(singleton_1(createElement("p", {
            className: "deck-detail-desc",
            children: deck_1.Description,
        })), delay(() => {
            let elems;
            return append_1(singleton_1(createElement("div", createObj(ofArray([["className", "deck-detail-stats"], (elems = toList(delay(() => {
                let arg;
                return append_1(singleton_1(createElement("span", {
                    children: (arg = (length(deck_1.Cards) | 0), toText(printf("%d cards"))(arg)),
                })), delay(() => append_1(singleton_1(createElement("span", {
                    children: toText(printf("%.0f%% mastered"))(mastery),
                })), delay(() => ((dueCount > 0) ? singleton_1(createElement("span", {
                    className: "due-badge-large",
                    children: toText(printf("%d due"))(dueCount),
                })) : empty_1())))));
            })), ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => ((dueCount > 0) ? singleton_1(createElement("button", {
                className: "btn btn-study-large",
                children: toText(printf("Study %d Cards"))(dueCount),
                onClick: (_arg_1) => {
                    dispatch(new Msg(19, [deck_1.Id]));
                },
            })) : empty_1())));
        })))))))), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "card-list"], (elems_8 = toList(delay(() => {
            let elems_2;
            return append_1(singleton_1(createElement("div", createObj(ofArray([["className", "card-list-header"], (elems_2 = [createElement("h3", {
                children: "Cards",
            }), createElement("button", {
                className: "btn btn-primary btn-small",
                children: "+ Add Card",
                onClick: (_arg_2) => {
                    dispatch(new Msg(0, [new ActiveView_11(2, [deck_1.Id, undefined])]));
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])))), delay(() => {
                let elems_3;
                return append_1(isEmpty(deck_1.Cards) ? singleton_1(createElement("div", createObj(ofArray([["className", "empty-state"], (elems_3 = [createElement("p", {
                    children: "No cards in this deck yet.",
                }), createElement("p", {
                    className: "empty-hint",
                    children: "Add your first card to start studying!",
                })], ["children", reactApi.Children.toArray(Array.from(elems_3))])])))) : collect((card) => {
                    let elems_6, elems_4, arg_4, arg_5, elems_5;
                    const mastery_1 = Mastery_level(card.SRData);
                    return singleton_1(createElement("div", createObj(ofArray([["className", "card-list-item"], (elems_6 = [createElement("div", {
                        className: "card-mastery-dot",
                        style: {
                            backgroundColor: Mastery_color(mastery_1),
                        },
                    }), createElement("div", createObj(ofArray([["className", "card-list-content"], (elems_4 = [createElement("div", {
                        className: "card-list-front",
                        children: card.Front,
                    }), createElement("div", {
                        className: "card-list-meta",
                        children: (arg_4 = Mastery_label(mastery_1), (arg_5 = nextReviewLabel(card.SRData), toText(printf("%s • %s"))(arg_4)(arg_5))),
                    })], ["children", reactApi.Children.toArray(Array.from(elems_4))])]))), createElement("div", createObj(ofArray([["className", "card-list-actions"], (elems_5 = [createElement("button", {
                        className: "btn-icon",
                        children: "✎",
                        onClick: (_arg_3) => {
                            dispatch(new Msg(0, [new ActiveView_11(2, [deck_1.Id, card.Id])]));
                        },
                    }), createElement("button", {
                        className: "btn-icon btn-delete",
                        children: "×",
                        onClick: (_arg_4) => {
                            dispatch(new Msg(17, [deck_1.Id, card.Id]));
                        },
                    })], ["children", reactApi.Children.toArray(Array.from(elems_5))])])))], ["children", reactApi.Children.toArray(Array.from(elems_6))])]))));
                }, deck_1.Cards), delay(() => {
                    let elems_7;
                    return singleton_1(createElement("div", createObj(ofArray([["className", "deck-export"], (elems_7 = [createElement("button", {
                        className: "btn btn-secondary btn-small",
                        children: "📋 Export Deck",
                        onClick: (_arg_5) => {
                            dispatch(new Msg(27, [deck_1.Id]));
                        },
                    })], ["children", reactApi.Children.toArray(Array.from(elems_7))])]))));
                }));
            }));
        })), ["children", reactApi.Children.toArray(Array.from(elems_8))])])))], ["children", reactApi.Children.toArray(Array.from(elems_9))])])));
    }
    else {
        const children = singleton(createElement("p", {
            children: "Deck not found.",
        }));
        return createElement("div", {
            children: reactApi.Children.toArray(Array.from(children)),
        });
    }
}

function navbar(activeView, dispatch) {
    let elems_2, elems, elems_1;
    return createElement("nav", createObj(ofArray([["className", "navbar"], (elems_2 = [createElement("button", createObj(ofArray([["className", (activeView.tag === 0) ? "nav-tab active" : "nav-tab"], ["onClick", (_arg) => {
        dispatch(new Msg(0, [new ActiveView_11(0, [])]));
    }], (elems = [createElement("span", {
        className: "nav-icon",
        children: "📚",
    }), createElement("span", {
        className: "nav-label",
        children: "Decks",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("button", createObj(ofArray([["className", (activeView.tag === 4) ? "nav-tab active" : "nav-tab"], ["onClick", (_arg_1) => {
        dispatch(new Msg(0, [new ActiveView_11(4, [])]));
    }], (elems_1 = [createElement("span", {
        className: "nav-icon",
        children: "📊",
    }), createElement("span", {
        className: "nav-label",
        children: "Stats",
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

/**
 * Main application view
 */
export function view(model, dispatch) {
    let elems_2;
    return createElement("div", createObj(ofArray([["className", "app-container"], (elems_2 = toList(delay(() => {
        let elems;
        return append_1(singleton_1(createElement("header", createObj(ofArray([["className", "app-header"], (elems = [createElement("h1", {
            children: "CodeCards",
        }), createElement("span", {
            className: "app-subtitle",
            children: "Programming Flashcards",
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => {
            let elems_1;
            return append_1(singleton_1(createElement("main", createObj(ofArray([["className", "app-main"], (elems_1 = toList(delay(() => {
                const matchValue = model.ActiveView;
                switch (matchValue.tag) {
                    case 1: {
                        const deckId = matchValue.fields[0];
                        return singleton_1(deckDetailView(deckId, model, dispatch));
                    }
                    case 2: {
                        const deckId_1 = matchValue.fields[0];
                        const cardId = matchValue.fields[1];
                        return singleton_1(view_2(deckId_1, cardId, model, dispatch));
                    }
                    case 3: {
                        const deckId_2 = matchValue.fields[0];
                        return singleton_1(view_3(deckId_2, model, dispatch));
                    }
                    case 4:
                        return singleton_1(view_4(model, dispatch));
                    default:
                        return singleton_1(view_5(model, dispatch));
                }
            })), ["children", reactApi.Children.toArray(Array.from(elems_1))])])))), delay(() => {
                if (model.ActiveView.tag === 3) {
                    return empty_1();
                }
                else {
                    return singleton_1(navbar(model.ActiveView, dispatch));
                }
            }));
        }));
    })), ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}


import { ReviewResult, Difficulty, Deck, Card, SRData, Languages_fromCode, Language__get_Code } from "./Types.fs.js";
import { toString, list as list_1, guid, nil, datetime, object } from "./fable_modules/Thoth.Json.10.2.0/Encode.fs.js";
import { empty, map } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { fromString, succeed, andThen, list as list_2, guid as guid_1, datetime as datetime_1, int, float, object as object_1, string, map as map_1 } from "./fable_modules/Thoth.Json.10.2.0/Decode.fs.js";
import { uncurry3, uncurry2 } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { bind, defaultArg, ofNullable } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { newGuid } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { now } from "./fable_modules/fable-library-js.4.24.0/Date.js";

export function Encode_language(l) {
    return Language__get_Code(l);
}

export function Encode_srData(sr) {
    let matchValue, dt;
    return object([["interval", sr.Interval], ["easeFactor", sr.EaseFactor], ["repetitions", sr.Repetitions], ["nextReview", datetime(sr.NextReview)], ["lastReviewed", (matchValue = sr.LastReviewed, (matchValue == null) ? nil : ((dt = matchValue, datetime(dt))))]]);
}

export function Encode_card(c) {
    return object([["id", guid(c.Id)], ["front", c.Front], ["back", c.Back], ["codeSnippet", c.CodeSnippet], ["language", Encode_language(c.Language)], ["tags", list_1(map((value_3) => value_3, c.Tags))], ["srData", Encode_srData(c.SRData)], ["createdAt", datetime(c.CreatedAt)]]);
}

export function Encode_deck(d) {
    return object([["id", guid(d.Id)], ["name", d.Name], ["description", d.Description], ["color", d.Color], ["icon", d.Icon], ["cards", list_1(map(Encode_card, d.Cards))], ["createdAt", datetime(d.CreatedAt)]]);
}

export function Encode_reviewResult(r) {
    let matchValue;
    return object([["cardId", guid(r.CardId)], ["deckId", guid(r.DeckId)], ["difficulty", (matchValue = r.Difficulty, (matchValue.tag === 1) ? "hard" : ((matchValue.tag === 2) ? "good" : ((matchValue.tag === 3) ? "easy" : "again")))], ["reviewedAt", datetime(r.ReviewedAt)]]);
}

export const Decode_language = (path_1) => ((value_1) => map_1(Languages_fromCode, string, path_1, value_1));

export const Decode_srData = (path_4) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4;
    return new SRData((objectArg = get$.Required, objectArg.Field("interval", float)), (objectArg_1 = get$.Required, objectArg_1.Field("easeFactor", float)), (objectArg_2 = get$.Required, objectArg_2.Field("repetitions", uncurry2(int))), (objectArg_3 = get$.Required, objectArg_3.Field("nextReview", datetime_1)), (objectArg_4 = get$.Optional, objectArg_4.Field("lastReviewed", datetime_1)));
}, path_4, v));

export const Decode_card = (path_7) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4, objectArg_5, objectArg_6, objectArg_7;
    return new Card((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("front", string)), (objectArg_2 = get$.Required, objectArg_2.Field("back", string)), (objectArg_3 = get$.Required, objectArg_3.Field("codeSnippet", string)), (objectArg_4 = get$.Required, objectArg_4.Field("language", uncurry2(Decode_language))), (objectArg_5 = get$.Required, objectArg_5.Field("tags", (path_5, value_5) => list_2(string, path_5, value_5))), (objectArg_6 = get$.Required, objectArg_6.Field("srData", uncurry2(Decode_srData))), (objectArg_7 = get$.Required, objectArg_7.Field("createdAt", datetime_1)));
}, path_7, v));

export const Decode_deck = (path_7) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4, objectArg_5, objectArg_6;
    return new Deck((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("name", string)), (objectArg_2 = get$.Required, objectArg_2.Field("description", string)), (objectArg_3 = get$.Required, objectArg_3.Field("color", string)), (objectArg_4 = get$.Required, objectArg_4.Field("icon", string)), (objectArg_5 = get$.Required, objectArg_5.Field("cards", (path_5, value_5) => list_2(uncurry2(Decode_card), path_5, value_5))), (objectArg_6 = get$.Required, objectArg_6.Field("createdAt", datetime_1)));
}, path_7, v));

export const Decode_difficulty = (path_1) => ((value_1) => andThen(uncurry3((s) => {
    switch (s) {
        case "again":
            return (arg10$0040) => ((arg20$0040) => succeed(new Difficulty(0, []), arg10$0040, arg20$0040));
        case "hard":
            return (arg10$0040_1) => ((arg20$0040_1) => succeed(new Difficulty(1, []), arg10$0040_1, arg20$0040_1));
        case "good":
            return (arg10$0040_2) => ((arg20$0040_2) => succeed(new Difficulty(2, []), arg10$0040_2, arg20$0040_2));
        case "easy":
            return (arg10$0040_3) => ((arg20$0040_3) => succeed(new Difficulty(3, []), arg10$0040_3, arg20$0040_3));
        default:
            return (arg10$0040_4) => ((arg20$0040_4) => succeed(new Difficulty(2, []), arg10$0040_4, arg20$0040_4));
    }
}), string, path_1, value_1));

export const Decode_reviewResult = (path_3) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3;
    return new ReviewResult((objectArg = get$.Required, objectArg.Field("cardId", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("deckId", guid_1)), (objectArg_2 = get$.Required, objectArg_2.Field("difficulty", uncurry2(Decode_difficulty))), (objectArg_3 = get$.Required, objectArg_3.Field("reviewedAt", datetime_1)));
}, path_3, v));

function save(key, value) {
    window.localStorage.setItem(key, value);
}

function load(key) {
    return ofNullable(window.localStorage.getItem(key));
}

/**
 * Save and load decks
 */
export function saveDecks(decks) {
    save("codecards_decks", toString(0, list_1(map(Encode_deck, decks))));
}

export function loadDecks() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_deck), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            const d = matchValue.fields[0];
            return d;
        }
    }, load("codecards_decks")), empty());
}

/**
 * Save and load review history
 */
export function saveHistory(history) {
    save("codecards_history", toString(0, list_1(map(Encode_reviewResult, history))));
}

export function loadHistory() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_reviewResult), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            const h = matchValue.fields[0];
            return h;
        }
    }, load("codecards_history")), empty());
}

/**
 * Export a deck as JSON string
 */
export function exportDeck(deck) {
    return toString(2, Encode_deck(deck));
}

/**
 * Import a deck from JSON string
 */
export function importDeck(json) {
    const matchValue = fromString(uncurry2(Decode_deck), json);
    if (matchValue.tag === 1) {
        return undefined;
    }
    else {
        const d = matchValue.fields[0];
        return new Deck(newGuid(), d.Name, d.Description, d.Color, d.Icon, d.Cards, now());
    }
}


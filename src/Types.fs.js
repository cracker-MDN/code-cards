import { Record, Union } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { bool_type, list_type, string_type, record_type, option_type, class_type, int32_type, float64_type, union_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";
import { tryFind, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { now } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { join } from "./fable_modules/fable-library-js.4.24.0/String.js";

export class Language extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["FSharp", "Python", "JavaScript", "CSharp", "SQL", "HTML", "CSS", "PlainText"];
    }
}

export function Language_$reflection() {
    return union_type("CodeCards.Types.Language", [], Language, () => [[], [], [], [], [], [], [], []]);
}

export function Language__get_Label(this$) {
    switch (this$.tag) {
        case 1:
            return "Python";
        case 2:
            return "JavaScript";
        case 3:
            return "C#";
        case 4:
            return "SQL";
        case 5:
            return "HTML";
        case 6:
            return "CSS";
        case 7:
            return "Plain Text";
        default:
            return "F#";
    }
}

export function Language__get_Code(this$) {
    switch (this$.tag) {
        case 1:
            return "python";
        case 2:
            return "javascript";
        case 3:
            return "csharp";
        case 4:
            return "sql";
        case 5:
            return "html";
        case 6:
            return "css";
        case 7:
            return "plaintext";
        default:
            return "fsharp";
    }
}

export const Languages_all = ofArray([new Language(0, []), new Language(1, []), new Language(2, []), new Language(3, []), new Language(4, []), new Language(5, []), new Language(6, []), new Language(7, [])]);

export function Languages_fromCode(code) {
    return defaultArg(tryFind((l) => (Language__get_Code(l) === code), Languages_all), new Language(7, []));
}

export class Difficulty extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Again", "Hard", "Good", "Easy"];
    }
}

export function Difficulty_$reflection() {
    return union_type("CodeCards.Types.Difficulty", [], Difficulty, () => [[], [], [], []]);
}

export class SRData extends Record {
    constructor(Interval, EaseFactor, Repetitions, NextReview, LastReviewed) {
        super();
        this.Interval = Interval;
        this.EaseFactor = EaseFactor;
        this.Repetitions = (Repetitions | 0);
        this.NextReview = NextReview;
        this.LastReviewed = LastReviewed;
    }
}

export function SRData_$reflection() {
    return record_type("CodeCards.Types.SRData", [], SRData, () => [["Interval", float64_type], ["EaseFactor", float64_type], ["Repetitions", int32_type], ["NextReview", class_type("System.DateTime")], ["LastReviewed", option_type(class_type("System.DateTime"))]]);
}

export function SRData_get_New() {
    return new SRData(0, 2.5, 0, now(), undefined);
}

export class MasteryLevel extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["New", "Learning", "Reviewing", "Mastered"];
    }
}

export function MasteryLevel_$reflection() {
    return union_type("CodeCards.Types.MasteryLevel", [], MasteryLevel, () => [[], [], [], []]);
}

export class Card extends Record {
    constructor(Id, Front, Back, CodeSnippet, Language, Tags, SRData, CreatedAt) {
        super();
        this.Id = Id;
        this.Front = Front;
        this.Back = Back;
        this.CodeSnippet = CodeSnippet;
        this.Language = Language;
        this.Tags = Tags;
        this.SRData = SRData;
        this.CreatedAt = CreatedAt;
    }
}

export function Card_$reflection() {
    return record_type("CodeCards.Types.Card", [], Card, () => [["Id", class_type("System.Guid")], ["Front", string_type], ["Back", string_type], ["CodeSnippet", string_type], ["Language", Language_$reflection()], ["Tags", list_type(string_type)], ["SRData", SRData_$reflection()], ["CreatedAt", class_type("System.DateTime")]]);
}

export class Deck extends Record {
    constructor(Id, Name, Description, Color, Icon, Cards, CreatedAt) {
        super();
        this.Id = Id;
        this.Name = Name;
        this.Description = Description;
        this.Color = Color;
        this.Icon = Icon;
        this.Cards = Cards;
        this.CreatedAt = CreatedAt;
    }
}

export function Deck_$reflection() {
    return record_type("CodeCards.Types.Deck", [], Deck, () => [["Id", class_type("System.Guid")], ["Name", string_type], ["Description", string_type], ["Color", string_type], ["Icon", string_type], ["Cards", list_type(Card_$reflection())], ["CreatedAt", class_type("System.DateTime")]]);
}

export class ReviewResult extends Record {
    constructor(CardId, DeckId, Difficulty, ReviewedAt) {
        super();
        this.CardId = CardId;
        this.DeckId = DeckId;
        this.Difficulty = Difficulty;
        this.ReviewedAt = ReviewedAt;
    }
}

export function ReviewResult_$reflection() {
    return record_type("CodeCards.Types.ReviewResult", [], ReviewResult, () => [["CardId", class_type("System.Guid")], ["DeckId", class_type("System.Guid")], ["Difficulty", Difficulty_$reflection()], ["ReviewedAt", class_type("System.DateTime")]]);
}

export class DailyStats extends Record {
    constructor(Date$, CardsReviewed, CorrectCount) {
        super();
        this.Date = Date$;
        this.CardsReviewed = (CardsReviewed | 0);
        this.CorrectCount = (CorrectCount | 0);
    }
}

export function DailyStats_$reflection() {
    return record_type("CodeCards.Types.DailyStats", [], DailyStats, () => [["Date", class_type("System.DateTime")], ["CardsReviewed", int32_type], ["CorrectCount", int32_type]]);
}

export class ActiveView extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["DeckListView", "DeckDetailView", "CardEditorView", "ReviewView", "StatsView"];
    }
}

export function ActiveView_$reflection() {
    return union_type("CodeCards.Types.ActiveView", [], ActiveView, () => [[], [["Item", class_type("System.Guid")]], [["deckId", class_type("System.Guid")], ["cardId", option_type(class_type("System.Guid"))]], [["Item", class_type("System.Guid")]], []]);
}

export class CardSide extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["FrontSide", "BackSide"];
    }
}

export function CardSide_$reflection() {
    return union_type("CodeCards.Types.CardSide", [], CardSide, () => [[], []]);
}

export class CardFormState extends Record {
    constructor(Front, Back, CodeSnippet, Language, Tags) {
        super();
        this.Front = Front;
        this.Back = Back;
        this.CodeSnippet = CodeSnippet;
        this.Language = Language;
        this.Tags = Tags;
    }
}

export function CardFormState_$reflection() {
    return record_type("CodeCards.Types.CardFormState", [], CardFormState, () => [["Front", string_type], ["Back", string_type], ["CodeSnippet", string_type], ["Language", Language_$reflection()], ["Tags", string_type]]);
}

export function CardFormState_get_Empty() {
    return new CardFormState("", "", "", new Language(0, []), "");
}

export function CardFormState_FromCard_4CE19D30(card) {
    return new CardFormState(card.Front, card.Back, card.CodeSnippet, card.Language, join(", ", card.Tags));
}

export class DeckFormState extends Record {
    constructor(Name, Description, Color, Icon) {
        super();
        this.Name = Name;
        this.Description = Description;
        this.Color = Color;
        this.Icon = Icon;
    }
}

export function DeckFormState_$reflection() {
    return record_type("CodeCards.Types.DeckFormState", [], DeckFormState, () => [["Name", string_type], ["Description", string_type], ["Color", string_type], ["Icon", string_type]]);
}

export function DeckFormState_get_Empty() {
    return new DeckFormState("", "", "#6366f1", "💻");
}

export class Model extends Record {
    constructor(Decks, ReviewHistory, ActiveView, CurrentCardIndex, CardSide, SessionResults, CardForm, DeckForm, ShowDeckForm, EditingDeckId, SearchQuery, SelectedTags) {
        super();
        this.Decks = Decks;
        this.ReviewHistory = ReviewHistory;
        this.ActiveView = ActiveView;
        this.CurrentCardIndex = (CurrentCardIndex | 0);
        this.CardSide = CardSide;
        this.SessionResults = SessionResults;
        this.CardForm = CardForm;
        this.DeckForm = DeckForm;
        this.ShowDeckForm = ShowDeckForm;
        this.EditingDeckId = EditingDeckId;
        this.SearchQuery = SearchQuery;
        this.SelectedTags = SelectedTags;
    }
}

export function Model_$reflection() {
    return record_type("CodeCards.Types.Model", [], Model, () => [["Decks", list_type(Deck_$reflection())], ["ReviewHistory", list_type(ReviewResult_$reflection())], ["ActiveView", ActiveView_$reflection()], ["CurrentCardIndex", int32_type], ["CardSide", CardSide_$reflection()], ["SessionResults", list_type(ReviewResult_$reflection())], ["CardForm", CardFormState_$reflection()], ["DeckForm", DeckFormState_$reflection()], ["ShowDeckForm", bool_type], ["EditingDeckId", option_type(class_type("System.Guid"))], ["SearchQuery", string_type], ["SelectedTags", list_type(string_type)]]);
}

export class Msg extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["SetView", "GoBack", "SetDeckName", "SetDeckDescription", "SetDeckColor", "SetDeckIcon", "ToggleDeckForm", "EditDeck", "SaveDeck", "DeleteDeck", "CancelDeckEdit", "SetCardFront", "SetCardBack", "SetCardCode", "SetCardLanguage", "SetCardTags", "SaveCard", "DeleteCard", "CancelCardEdit", "StartReview", "FlipCard", "RateCard", "NextCard", "EndReview", "SetSearchQuery", "ToggleTag", "ImportDeck", "ExportDeck"];
    }
}

export function Msg_$reflection() {
    return union_type("CodeCards.Types.Msg", [], Msg, () => [[["Item", ActiveView_$reflection()]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [["Item", class_type("System.Guid")]], [], [["Item", class_type("System.Guid")]], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", Language_$reflection()]], [["Item", string_type]], [["Item", class_type("System.Guid")]], [["Item1", class_type("System.Guid")], ["Item2", class_type("System.Guid")]], [], [["Item", class_type("System.Guid")]], [], [["Item", Difficulty_$reflection()]], [], [], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [["Item", class_type("System.Guid")]]]);
}

export const Colors_palette = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#14b8a6", "#f43f5e"];

export const Icons_all = ["💻", "🐍", "🌐", "📊", "🔧", "🎯", "📖", "🚀", "⚙️", "🧪", "🗃️", "💡", "🤖", "🔍", "📝", "🏆"];

export function Mastery_level(sr) {
    if (sr.Repetitions === 0) {
        return new MasteryLevel(0, []);
    }
    else if (sr.Repetitions < 3) {
        return new MasteryLevel(1, []);
    }
    else if (sr.Interval < 21) {
        return new MasteryLevel(2, []);
    }
    else {
        return new MasteryLevel(3, []);
    }
}

export function Mastery_label(level) {
    switch (level.tag) {
        case 1:
            return "Learning";
        case 2:
            return "Reviewing";
        case 3:
            return "Mastered";
        default:
            return "New";
    }
}

export function Mastery_color(level) {
    switch (level.tag) {
        case 1:
            return "#f59e0b";
        case 2:
            return "#3b82f6";
        case 3:
            return "#22c55e";
        default:
            return "#94a3b8";
    }
}


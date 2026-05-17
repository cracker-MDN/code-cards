import { createElement } from "react";
import { equals, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { empty, singleton, append, map, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { ActiveView, Languages_all, Msg, Language__get_Label } from "./Types.fs.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { tryFind, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { max } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { printf, toText, split } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { render } from "./CodeHighlight.fs.js";
import { map as map_1, defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";

function languageSelector(selected, dispatch) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "lang-selector"], (elems_1 = [createElement("label", {
        className: "form-label",
        children: "Language",
    }), createElement("div", createObj(ofArray([["className", "lang-pills"], (elems = toList(delay(() => map((lang) => createElement("button", {
        className: equals(lang, selected) ? "lang-pill active" : "lang-pill",
        children: Language__get_Label(lang),
        onClick: (_arg) => {
            dispatch(new Msg(14, [lang]));
        },
    }), Languages_all))), ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function codeEditor(code, language, dispatch) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "code-editor-wrap"], (elems_1 = [createElement("div", createObj(ofArray([["className", "code-editor-header"], (elems = [createElement("span", {
        className: "code-lang-label",
        children: Language__get_Label(language),
    }), createElement("span", {
        className: "code-hint",
        children: "(optional)",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("textarea", {
        className: "code-editor",
        placeholder: "Paste or type code here...",
        value: code,
        rows: max(4, split(code, ["\n"], undefined, 0).length + 1),
        onChange: (ev) => {
            dispatch(new Msg(13, [ev.target.value]));
        },
        spellCheck: false,
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function cardPreview(form) {
    let elems_3, elems_2;
    return createElement("div", createObj(ofArray([["className", "card-preview"], (elems_3 = [createElement("h4", {
        children: "Preview",
    }), createElement("div", createObj(ofArray([["className", "preview-card"], (elems_2 = toList(delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "preview-front"], (elems = [createElement("strong", {
            children: "Q: ",
        }), (form.Front === "") ? "Your question here..." : form.Front], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => append(singleton(createElement("hr", {})), delay(() => {
            let elems_1;
            return append(singleton(createElement("div", createObj(ofArray([["className", "preview-back"], (elems_1 = [createElement("strong", {
                children: "A: ",
            }), (form.Back === "") ? "Your answer here..." : form.Back], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))), delay(() => ((form.CodeSnippet !== "") ? singleton(render(form.Language, form.CodeSnippet)) : empty())));
        }))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

/**
 * Main card editor view
 */
export function view(deckId, cardId, model, dispatch) {
    let elems_5, elems, elems_1, elems_2, elems_3, elems_4;
    const deckName = defaultArg(map_1((d_1) => d_1.Name, tryFind((d) => (d.Id === deckId), model.Decks)), "Unknown");
    const isEditing = cardId != null;
    const canSave = (model.CardForm.Front.trim() !== "") && (model.CardForm.Back.trim() !== "");
    return createElement("div", createObj(ofArray([["className", "card-editor-page"], (elems_5 = [createElement("button", {
        className: "btn-back",
        children: toText(printf("← Back to %s"))(deckName),
        onClick: (_arg) => {
            dispatch(new Msg(0, [new ActiveView(1, [deckId])]));
        },
    }), createElement("h2", {
        children: isEditing ? "Edit Card" : "Add New Card",
    }), createElement("div", createObj(ofArray([["className", "form-field"], (elems = [createElement("label", {
        className: "form-label",
        children: "Front (Question)",
    }), createElement("textarea", {
        className: "text-input",
        placeholder: "What concept or question to test?",
        value: model.CardForm.Front,
        rows: 3,
        autoFocus: true,
        onChange: (ev) => {
            dispatch(new Msg(11, [ev.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "form-field"], (elems_1 = [createElement("label", {
        className: "form-label",
        children: "Back (Answer)",
    }), createElement("textarea", {
        className: "text-input",
        placeholder: "The answer or explanation...",
        value: model.CardForm.Back,
        rows: 3,
        onChange: (ev_1) => {
            dispatch(new Msg(12, [ev_1.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), languageSelector(model.CardForm.Language, dispatch), createElement("div", createObj(ofArray([["className", "form-field"], (elems_2 = [createElement("label", {
        className: "form-label",
        children: "Code Snippet",
    }), codeEditor(model.CardForm.CodeSnippet, model.CardForm.Language, dispatch)], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("div", createObj(ofArray([["className", "form-field"], (elems_3 = [createElement("label", {
        className: "form-label",
        children: "Tags (comma-separated)",
    }), createElement("input", {
        className: "text-input",
        placeholder: "e.g. basics, loops, functions",
        value: model.CardForm.Tags,
        onChange: (ev_2) => {
            dispatch(new Msg(15, [ev_2.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_3))])]))), cardPreview(model.CardForm), createElement("div", createObj(ofArray([["className", "form-actions"], (elems_4 = [createElement("button", {
        className: "btn btn-primary btn-large",
        children: isEditing ? "Save Changes" : "Add Card",
        disabled: !canSave,
        onClick: (_arg_1) => {
            dispatch(new Msg(16, [deckId]));
        },
    }), createElement("button", {
        className: "btn btn-secondary",
        children: "Cancel",
        onClick: (_arg_2) => {
            dispatch(new Msg(18, []));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_4))])])))], ["children", reactApi.Children.toArray(Array.from(elems_5))])])));
}


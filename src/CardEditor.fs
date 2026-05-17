module CodeCards.CardEditor

open System
open Feliz
open CodeCards.Types

/// Language selector dropdown
let private languageSelector (selected: Language) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "lang-selector"
        prop.children [
            Html.label [ prop.className "form-label"; prop.text "Language" ]
            Html.div [
                prop.className "lang-pills"
                prop.children [
                    for lang in Languages.all do
                        Html.button [
                            prop.className (if lang = selected then "lang-pill active" else "lang-pill")
                            prop.text lang.Label
                            prop.onClick (fun _ -> dispatch (SetCardLanguage lang))
                        ]
                ]
            ]
        ]
    ]

/// Code editor textarea with line numbers
let private codeEditor (code: string) (language: Language) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "code-editor-wrap"
        prop.children [
            Html.div [
                prop.className "code-editor-header"
                prop.children [
                    Html.span [ prop.className "code-lang-label"; prop.text language.Label ]
                    Html.span [ prop.className "code-hint"; prop.text "(optional)" ]
                ]
            ]
            Html.textarea [
                prop.className "code-editor"
                prop.placeholder "Paste or type code here..."
                prop.value code
                prop.rows (max 4 (code.Split('\n').Length + 1))
                prop.onChange (fun (v: string) -> dispatch (SetCardCode v))
                prop.custom ("spellCheck", false)
            ]
        ]
    ]

/// Preview of the card being edited
let private cardPreview (form: CardFormState) =
    Html.div [
        prop.className "card-preview"
        prop.children [
            Html.h4 [ prop.text "Preview" ]
            Html.div [
                prop.className "preview-card"
                prop.children [
                    Html.div [
                        prop.className "preview-front"
                        prop.children [
                            Html.strong [ prop.text "Q: " ]
                            Html.text (if form.Front = "" then "Your question here..." else form.Front)
                        ]
                    ]
                    Html.hr []
                    Html.div [
                        prop.className "preview-back"
                        prop.children [
                            Html.strong [ prop.text "A: " ]
                            Html.text (if form.Back = "" then "Your answer here..." else form.Back)
                        ]
                    ]
                    if form.CodeSnippet <> "" then
                        CodeHighlight.render form.Language form.CodeSnippet
                ]
            ]
        ]
    ]

/// Main card editor view
let view (deckId: Guid) (cardId: Guid option) (model: Model) (dispatch: Msg -> unit) =
    let deck = model.Decks |> List.tryFind (fun d -> d.Id = deckId)
    let deckName = deck |> Option.map (fun d -> d.Name) |> Option.defaultValue "Unknown"
    let isEditing = cardId.IsSome
    let canSave = model.CardForm.Front.Trim() <> "" && model.CardForm.Back.Trim() <> ""

    Html.div [
        prop.className "card-editor-page"
        prop.children [
            // Back button
            Html.button [
                prop.className "btn-back"
                prop.text (sprintf "\u2190 Back to %s" deckName)
                prop.onClick (fun _ -> dispatch (SetView (DeckDetailView deckId)))
            ]

            Html.h2 [ prop.text (if isEditing then "Edit Card" else "Add New Card") ]

            // Front (question)
            Html.div [
                prop.className "form-field"
                prop.children [
                    Html.label [ prop.className "form-label"; prop.text "Front (Question)" ]
                    Html.textarea [
                        prop.className "text-input"
                        prop.placeholder "What concept or question to test?"
                        prop.value model.CardForm.Front
                        prop.rows 3
                        prop.autoFocus true
                        prop.onChange (fun (v: string) -> dispatch (SetCardFront v))
                    ]
                ]
            ]

            // Back (answer)
            Html.div [
                prop.className "form-field"
                prop.children [
                    Html.label [ prop.className "form-label"; prop.text "Back (Answer)" ]
                    Html.textarea [
                        prop.className "text-input"
                        prop.placeholder "The answer or explanation..."
                        prop.value model.CardForm.Back
                        prop.rows 3
                        prop.onChange (fun (v: string) -> dispatch (SetCardBack v))
                    ]
                ]
            ]

            // Language selector
            languageSelector model.CardForm.Language dispatch

            // Code snippet editor
            Html.div [
                prop.className "form-field"
                prop.children [
                    Html.label [ prop.className "form-label"; prop.text "Code Snippet" ]
                    codeEditor model.CardForm.CodeSnippet model.CardForm.Language dispatch
                ]
            ]

            // Tags
            Html.div [
                prop.className "form-field"
                prop.children [
                    Html.label [ prop.className "form-label"; prop.text "Tags (comma-separated)" ]
                    Html.input [
                        prop.className "text-input"
                        prop.placeholder "e.g. basics, loops, functions"
                        prop.value model.CardForm.Tags
                        prop.onChange (fun (v: string) -> dispatch (SetCardTags v))
                    ]
                ]
            ]

            // Preview
            cardPreview model.CardForm

            // Actions
            Html.div [
                prop.className "form-actions"
                prop.children [
                    Html.button [
                        prop.className "btn btn-primary btn-large"
                        prop.text (if isEditing then "Save Changes" else "Add Card")
                        prop.disabled (not canSave)
                        prop.onClick (fun _ -> dispatch (SaveCard deckId))
                    ]
                    Html.button [
                        prop.className "btn btn-secondary"
                        prop.text "Cancel"
                        prop.onClick (fun _ -> dispatch CancelCardEdit)
                    ]
                ]
            ]
        ]
    ]

module CodeCards.DeckManager

open System
open Feliz
open CodeCards.Types
open CodeCards.SpacedRepetition

/// Render mastery breakdown badges for a deck
let private masteryBadges (cards: Card list) =
    let counts =
        cards
        |> List.groupBy (fun c -> Mastery.level c.SRData)
        |> List.map (fun (level, cs) -> (level, List.length cs))
    Html.div [
        prop.className "mastery-badges"
        prop.children [
            for (level, count) in counts do
                Html.span [
                    prop.className "mastery-badge"
                    prop.style [ style.backgroundColor (Mastery.color level) ]
                    prop.text (sprintf "%d %s" count (Mastery.label level))
                ]
        ]
    ]

/// Render a single deck card in the list
let private deckCard (deck: Deck) (dispatch: Msg -> unit) =
    let totalCards = List.length deck.Cards
    let dueCount = dueCards deck.Cards |> List.length
    let mastery = masteryPercentage deck.Cards

    Html.div [
        prop.className "deck-card"
        prop.onClick (fun _ -> dispatch (SetView (DeckDetailView deck.Id)))
        prop.children [
            Html.div [
                prop.className "deck-card-header"
                prop.style [ style.backgroundColor deck.Color ]
                prop.children [
                    Html.span [ prop.className "deck-icon"; prop.text deck.Icon ]
                    Html.div [
                        prop.className "deck-card-actions"
                        prop.children [
                            Html.button [
                                prop.className "btn-icon-light"
                                prop.text "\u270E"
                                prop.title "Edit deck"
                                prop.onClick (fun e ->
                                    e.stopPropagation ()
                                    dispatch (EditDeck deck.Id))
                            ]
                            Html.button [
                                prop.className "btn-icon-light btn-delete-light"
                                prop.text "\u00D7"
                                prop.title "Delete deck"
                                prop.onClick (fun e ->
                                    e.stopPropagation ()
                                    dispatch (DeleteDeck deck.Id))
                            ]
                        ]
                    ]
                ]
            ]
            Html.div [
                prop.className "deck-card-body"
                prop.children [
                    Html.h3 [ prop.className "deck-name"; prop.text deck.Name ]
                    Html.p [ prop.className "deck-desc"; prop.text deck.Description ]
                    Html.div [
                        prop.className "deck-stats-row"
                        prop.children [
                            Html.span [ prop.text (sprintf "%d cards" totalCards) ]
                            if dueCount > 0 then
                                Html.span [
                                    prop.className "due-badge"
                                    prop.text (sprintf "%d due" dueCount)
                                ]
                        ]
                    ]
                    // Mastery progress bar
                    if totalCards > 0 then
                        Html.div [
                            prop.className "mastery-bar-wrap"
                            prop.children [
                                Html.div [
                                    prop.className "mastery-bar"
                                    prop.style [ style.width (length.percent mastery) ]
                                ]
                            ]
                        ]
                        Html.span [
                            prop.className "mastery-pct"
                            prop.text (sprintf "%.0f%% mastered" mastery)
                        ]
                    // Study button
                    if dueCount > 0 then
                        Html.button [
                            prop.className "btn btn-study"
                            prop.style [ style.backgroundColor deck.Color ]
                            prop.text (sprintf "Study %d cards" dueCount)
                            prop.onClick (fun e ->
                                e.stopPropagation ()
                                dispatch (StartReview deck.Id))
                        ]
                ]
            ]
        ]
    ]

/// Icon picker for deck form
let private iconPicker (selected: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "icon-picker"
        prop.children [
            for icon in Icons.all do
                Html.button [
                    prop.className (if icon = selected then "icon-btn selected" else "icon-btn")
                    prop.text icon
                    prop.onClick (fun _ -> dispatch (SetDeckIcon icon))
                ]
        ]
    ]

/// Color picker for deck form
let private colorPicker (selected: string) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "color-picker"
        prop.children [
            for color in Colors.palette do
                Html.button [
                    prop.className (if color = selected then "color-dot selected" else "color-dot")
                    prop.style [ style.backgroundColor color ]
                    prop.onClick (fun _ -> dispatch (SetDeckColor color))
                ]
        ]
    ]

/// Deck creation/edit form
let private deckForm (model: Model) (dispatch: Msg -> unit) =
    let isEditing = model.EditingDeckId.IsSome

    Html.div [
        prop.className "deck-form-overlay"
        prop.onClick (fun _ -> dispatch CancelDeckEdit)
        prop.children [
            Html.div [
                prop.className "deck-form"
                prop.onClick (fun e -> e.stopPropagation ())
                prop.children [
                    Html.h3 [ prop.text (if isEditing then "Edit Deck" else "New Deck") ]

                    Html.input [
                        prop.className "text-input"
                        prop.placeholder "Deck name..."
                        prop.value model.DeckForm.Name
                        prop.autoFocus true
                        prop.onChange (fun (v: string) -> dispatch (SetDeckName v))
                    ]
                    Html.textarea [
                        prop.className "text-input"
                        prop.placeholder "Description (optional)..."
                        prop.value model.DeckForm.Description
                        prop.rows 2
                        prop.onChange (fun (v: string) -> dispatch (SetDeckDescription v))
                    ]

                    Html.label [ prop.className "form-label"; prop.text "Icon" ]
                    iconPicker model.DeckForm.Icon dispatch

                    Html.label [ prop.className "form-label"; prop.text "Color" ]
                    colorPicker model.DeckForm.Color dispatch

                    Html.div [
                        prop.className "form-actions"
                        prop.children [
                            Html.button [
                                prop.className "btn btn-primary"
                                prop.text (if isEditing then "Save" else "Create Deck")
                                prop.disabled (model.DeckForm.Name.Trim() = "")
                                prop.onClick (fun _ -> dispatch SaveDeck)
                            ]
                            Html.button [
                                prop.className "btn btn-secondary"
                                prop.text "Cancel"
                                prop.onClick (fun _ -> dispatch CancelDeckEdit)
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]

/// Main deck list view
let view (model: Model) (dispatch: Msg -> unit) =
    let filteredDecks =
        if model.SearchQuery = "" then model.Decks
        else
            model.Decks
            |> List.filter (fun d ->
                d.Name.ToLower().Contains(model.SearchQuery.ToLower())
                || d.Description.ToLower().Contains(model.SearchQuery.ToLower()))

    let totalDue =
        model.Decks
        |> List.sumBy (fun d -> dueCards d.Cards |> List.length)

    Html.div [
        prop.className "deck-list-page"
        prop.children [
            // Header with stats
            Html.div [
                prop.className "page-top"
                prop.children [
                    Html.h2 [ prop.text "My Decks" ]
                    if totalDue > 0 then
                        Html.span [
                            prop.className "total-due"
                            prop.text (sprintf "%d cards due" totalDue)
                        ]
                ]
            ]

            // Search bar
            Html.div [
                prop.className "search-wrap"
                prop.children [
                    Html.span [ prop.className "search-icon"; prop.text "\U0001F50D" ]
                    Html.input [
                        prop.className "search-input"
                        prop.placeholder "Search decks..."
                        prop.value model.SearchQuery
                        prop.onChange (fun (v: string) -> dispatch (SetSearchQuery v))
                    ]
                ]
            ]

            // Deck grid
            if filteredDecks.IsEmpty && model.Decks.IsEmpty then
                Html.div [
                    prop.className "empty-state"
                    prop.children [
                        Html.div [ prop.className "empty-icon"; prop.text "\U0001F4DA" ]
                        Html.p [ prop.text "No decks yet." ]
                        Html.p [ prop.className "empty-hint"; prop.text "Create your first deck to start studying!" ]
                    ]
                ]
            else
                Html.div [
                    prop.className "deck-grid"
                    prop.children [
                        for deck in filteredDecks do
                            deckCard deck dispatch
                    ]
                ]

            // New deck button
            Html.button [
                prop.className "fab"
                prop.text "+"
                prop.title "Create new deck"
                prop.onClick (fun _ -> dispatch ToggleDeckForm)
            ]

            // Deck form modal
            if model.ShowDeckForm then
                deckForm model dispatch
        ]
    ]

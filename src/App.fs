module CodeCards.App

open System
open Feliz
open Fable.Core
open CodeCards.Types
open CodeCards.Storage

[<Emit("navigator.clipboard?.writeText($0)")>]
let private writeToClipboard (_text: string) : unit = jsNative

/// Initialize application from localStorage
let init () =
    let decks = loadDecks ()
    let history = loadHistory ()
    { Decks = decks
      ReviewHistory = history
      ActiveView = DeckListView
      CurrentCardIndex = 0
      CardSide = FrontSide
      SessionResults = []
      CardForm = CardFormState.Empty
      DeckForm = DeckFormState.Empty
      ShowDeckForm = false
      EditingDeckId = None
      SearchQuery = ""
      SelectedTags = [] }

/// Parse comma-separated tags into a clean list
let private parseTags (input: string) =
    input.Split(',')
    |> Array.map (fun s -> s.Trim())
    |> Array.filter (fun s -> s <> "")
    |> Array.toList

/// Update a card in a specific deck
let private updateCardInDeck (deckId: Guid) (cardId: Guid) (updater: Card -> Card) (decks: Deck list) =
    decks |> List.map (fun d ->
        if d.Id = deckId then
            { d with Cards = d.Cards |> List.map (fun c -> if c.Id = cardId then updater c else c) }
        else d)

/// Update function
let update (msg: Msg) (model: Model) : Model =
    match msg with
    // Navigation
    | SetView view ->
        let cardForm =
            match view with
            | CardEditorView (deckId, Some cardId) ->
                let card =
                    model.Decks
                    |> List.tryFind (fun d -> d.Id = deckId)
                    |> Option.bind (fun d -> d.Cards |> List.tryFind (fun c -> c.Id = cardId))
                match card with
                | Some c -> CardFormState.FromCard c
                | None -> CardFormState.Empty
            | CardEditorView _ -> CardFormState.Empty
            | _ -> model.CardForm
        { model with ActiveView = view; CardForm = cardForm }

    | GoBack ->
        match model.ActiveView with
        | DeckDetailView _ -> { model with ActiveView = DeckListView }
        | CardEditorView (deckId, _) -> { model with ActiveView = DeckDetailView deckId }
        | ReviewView deckId -> { model with ActiveView = DeckDetailView deckId }
        | _ -> { model with ActiveView = DeckListView }

    // Deck management
    | SetDeckName v -> { model with DeckForm = { model.DeckForm with Name = v } }
    | SetDeckDescription v -> { model with DeckForm = { model.DeckForm with Description = v } }
    | SetDeckColor v -> { model with DeckForm = { model.DeckForm with Color = v } }
    | SetDeckIcon v -> { model with DeckForm = { model.DeckForm with Icon = v } }

    | ToggleDeckForm ->
        { model with
            ShowDeckForm = true
            DeckForm = DeckFormState.Empty
            EditingDeckId = None }

    | EditDeck id ->
        match model.Decks |> List.tryFind (fun d -> d.Id = id) with
        | Some d ->
            { model with
                ShowDeckForm = true
                EditingDeckId = Some id
                DeckForm =
                    { Name = d.Name
                      Description = d.Description
                      Color = d.Color
                      Icon = d.Icon } }
        | None -> model

    | SaveDeck ->
        let name = model.DeckForm.Name.Trim()
        if name = "" then model
        else
            match model.EditingDeckId with
            | Some id ->
                let newDecks =
                    model.Decks |> List.map (fun d ->
                        if d.Id = id then
                            { d with
                                Name = name
                                Description = model.DeckForm.Description.Trim()
                                Color = model.DeckForm.Color
                                Icon = model.DeckForm.Icon }
                        else d)
                saveDecks newDecks
                { model with
                    Decks = newDecks
                    ShowDeckForm = false
                    EditingDeckId = None
                    DeckForm = DeckFormState.Empty }
            | None ->
                let deck =
                    { Id = Guid.NewGuid()
                      Name = name
                      Description = model.DeckForm.Description.Trim()
                      Color = model.DeckForm.Color
                      Icon = model.DeckForm.Icon
                      Cards = []
                      CreatedAt = DateTime.Now }
                let newDecks = model.Decks @ [ deck ]
                saveDecks newDecks
                { model with
                    Decks = newDecks
                    ShowDeckForm = false
                    DeckForm = DeckFormState.Empty }

    | DeleteDeck id ->
        let newDecks = model.Decks |> List.filter (fun d -> d.Id <> id)
        saveDecks newDecks
        { model with Decks = newDecks; ActiveView = DeckListView }

    | CancelDeckEdit ->
        { model with ShowDeckForm = false; EditingDeckId = None; DeckForm = DeckFormState.Empty }

    // Card management
    | SetCardFront v -> { model with CardForm = { model.CardForm with Front = v } }
    | SetCardBack v -> { model with CardForm = { model.CardForm with Back = v } }
    | SetCardCode v -> { model with CardForm = { model.CardForm with CodeSnippet = v } }
    | SetCardLanguage l -> { model with CardForm = { model.CardForm with Language = l } }
    | SetCardTags v -> { model with CardForm = { model.CardForm with Tags = v } }

    | SaveCard deckId ->
        let front = model.CardForm.Front.Trim()
        let back = model.CardForm.Back.Trim()
        if front = "" || back = "" then model
        else
            let tags = parseTags model.CardForm.Tags
            match model.ActiveView with
            | CardEditorView (_, Some cardId) ->
                // Update existing card
                let newDecks =
                    updateCardInDeck deckId cardId (fun c ->
                        { c with
                            Front = front
                            Back = back
                            CodeSnippet = model.CardForm.CodeSnippet
                            Language = model.CardForm.Language
                            Tags = tags }) model.Decks
                saveDecks newDecks
                { model with
                    Decks = newDecks
                    CardForm = CardFormState.Empty
                    ActiveView = DeckDetailView deckId }
            | _ ->
                // Add new card
                let card =
                    { Id = Guid.NewGuid()
                      Front = front
                      Back = back
                      CodeSnippet = model.CardForm.CodeSnippet
                      Language = model.CardForm.Language
                      Tags = tags
                      SRData = SRData.New
                      CreatedAt = DateTime.Now }
                let newDecks =
                    model.Decks |> List.map (fun d ->
                        if d.Id = deckId then { d with Cards = d.Cards @ [ card ] }
                        else d)
                saveDecks newDecks
                { model with
                    Decks = newDecks
                    CardForm = CardFormState.Empty
                    ActiveView = DeckDetailView deckId }

    | DeleteCard (deckId, cardId) ->
        let newDecks =
            model.Decks |> List.map (fun d ->
                if d.Id = deckId then
                    { d with Cards = d.Cards |> List.filter (fun c -> c.Id <> cardId) }
                else d)
        saveDecks newDecks
        { model with Decks = newDecks }

    | CancelCardEdit ->
        match model.ActiveView with
        | CardEditorView (deckId, _) ->
            { model with CardForm = CardFormState.Empty; ActiveView = DeckDetailView deckId }
        | _ -> model

    // Review
    | StartReview deckId ->
        { model with
            ActiveView = ReviewView deckId
            CurrentCardIndex = 0
            CardSide = FrontSide
            SessionResults = [] }

    | FlipCard ->
        { model with CardSide = BackSide }

    | RateCard difficulty ->
        match model.ActiveView with
        | ReviewView deckId ->
            let deck = model.Decks |> List.tryFind (fun d -> d.Id = deckId)
            match deck with
            | Some deck ->
                let studyCards = SpacedRepetition.getStudySession 20 deck.Cards
                if model.CurrentCardIndex < List.length studyCards then
                    let card = studyCards.[model.CurrentCardIndex]
                    let updatedCard = SpacedRepetition.updateCard card difficulty
                    let newDecks =
                        updateCardInDeck deckId card.Id (fun _ -> updatedCard) model.Decks
                    let result =
                        { CardId = card.Id
                          DeckId = deckId
                          Difficulty = difficulty
                          ReviewedAt = DateTime.Now }
                    let newHistory = result :: model.ReviewHistory
                    saveDecks newDecks
                    saveHistory newHistory
                    { model with
                        Decks = newDecks
                        ReviewHistory = newHistory
                        SessionResults = model.SessionResults @ [ result ]
                        CurrentCardIndex = model.CurrentCardIndex + 1
                        CardSide = FrontSide }
                else model
            | None -> model
        | _ -> model

    | NextCard ->
        { model with CurrentCardIndex = model.CurrentCardIndex + 1; CardSide = FrontSide }

    | EndReview ->
        match model.ActiveView with
        | ReviewView deckId -> { model with ActiveView = DeckDetailView deckId }
        | _ -> { model with ActiveView = DeckListView }

    // Filters
    | SetSearchQuery q -> { model with SearchQuery = q }
    | ToggleTag tag ->
        let tags =
            if model.SelectedTags |> List.contains tag then
                model.SelectedTags |> List.filter (fun t -> t <> tag)
            else tag :: model.SelectedTags
        { model with SelectedTags = tags }

    // Import/Export
    | ImportDeck json ->
        match Storage.importDeck json with
        | Some deck ->
            let newDecks = model.Decks @ [ deck ]
            saveDecks newDecks
            { model with Decks = newDecks }
        | None -> model

    | ExportDeck deckId ->
        match model.Decks |> List.tryFind (fun d -> d.Id = deckId) with
        | Some deck ->
            let json = Storage.exportDeck deck
            writeToClipboard json
            model
        | None -> model

/// Deck detail view (shows cards in a deck)
let private deckDetailView (deckId: Guid) (model: Model) (dispatch: Msg -> unit) =
    let deck = model.Decks |> List.tryFind (fun d -> d.Id = deckId)
    match deck with
    | None ->
        Html.div [ Html.p [ prop.text "Deck not found." ] ]
    | Some deck ->
        let dueCount = SpacedRepetition.dueCards deck.Cards |> List.length
        let mastery = SpacedRepetition.masteryPercentage deck.Cards

        Html.div [
            prop.className "deck-detail-page"
            prop.children [
                Html.button [
                    prop.className "btn-back"
                    prop.text "\u2190 All Decks"
                    prop.onClick (fun _ -> dispatch (SetView DeckListView))
                ]

                // Deck header
                Html.div [
                    prop.className "deck-detail-header"
                    prop.style [ style.backgroundColor deck.Color ]
                    prop.children [
                        Html.span [ prop.className "deck-detail-icon"; prop.text deck.Icon ]
                        Html.h2 [ prop.text deck.Name ]
                        Html.p [ prop.className "deck-detail-desc"; prop.text deck.Description ]
                        Html.div [
                            prop.className "deck-detail-stats"
                            prop.children [
                                Html.span [ prop.text (sprintf "%d cards" (List.length deck.Cards)) ]
                                Html.span [ prop.text (sprintf "%.0f%% mastered" mastery) ]
                                if dueCount > 0 then
                                    Html.span [ prop.className "due-badge-large"; prop.text (sprintf "%d due" dueCount) ]
                            ]
                        ]
                        if dueCount > 0 then
                            Html.button [
                                prop.className "btn btn-study-large"
                                prop.text (sprintf "Study %d Cards" dueCount)
                                prop.onClick (fun _ -> dispatch (StartReview deck.Id))
                            ]
                    ]
                ]

                // Card list
                Html.div [
                    prop.className "card-list"
                    prop.children [
                        Html.div [
                            prop.className "card-list-header"
                            prop.children [
                                Html.h3 [ prop.text "Cards" ]
                                Html.button [
                                    prop.className "btn btn-primary btn-small"
                                    prop.text "+ Add Card"
                                    prop.onClick (fun _ -> dispatch (SetView (CardEditorView (deck.Id, None))))
                                ]
                            ]
                        ]

                        if deck.Cards.IsEmpty then
                            Html.div [
                                prop.className "empty-state"
                                prop.children [
                                    Html.p [ prop.text "No cards in this deck yet." ]
                                    Html.p [ prop.className "empty-hint"; prop.text "Add your first card to start studying!" ]
                                ]
                            ]
                        else
                            for card in deck.Cards do
                                let mastery = Mastery.level card.SRData
                                Html.div [
                                    prop.className "card-list-item"
                                    prop.children [
                                        Html.div [
                                            prop.className "card-mastery-dot"
                                            prop.style [ style.backgroundColor (Mastery.color mastery) ]
                                        ]
                                        Html.div [
                                            prop.className "card-list-content"
                                            prop.children [
                                                Html.div [ prop.className "card-list-front"; prop.text card.Front ]
                                                Html.div [
                                                    prop.className "card-list-meta"
                                                    prop.text (sprintf "%s \u2022 %s" (Mastery.label mastery) (SpacedRepetition.nextReviewLabel card.SRData))
                                                ]
                                            ]
                                        ]
                                        Html.div [
                                            prop.className "card-list-actions"
                                            prop.children [
                                                Html.button [
                                                    prop.className "btn-icon"
                                                    prop.text "\u270E"
                                                    prop.onClick (fun _ -> dispatch (SetView (CardEditorView (deck.Id, Some card.Id))))
                                                ]
                                                Html.button [
                                                    prop.className "btn-icon btn-delete"
                                                    prop.text "\u00D7"
                                                    prop.onClick (fun _ -> dispatch (DeleteCard (deck.Id, card.Id)))
                                                ]
                                            ]
                                        ]
                                    ]
                                ]

                        // Export button
                        Html.div [
                            prop.className "deck-export"
                            prop.children [
                                Html.button [
                                    prop.className "btn btn-secondary btn-small"
                                    prop.text "\U0001F4CB Export Deck"
                                    prop.onClick (fun _ -> dispatch (ExportDeck deck.Id))
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]

/// Bottom navigation bar
let private navbar (activeView: ActiveView) (dispatch: Msg -> unit) =
    Html.nav [
        prop.className "navbar"
        prop.children [
            Html.button [
                prop.className (match activeView with DeckListView -> "nav-tab active" | _ -> "nav-tab")
                prop.onClick (fun _ -> dispatch (SetView DeckListView))
                prop.children [
                    Html.span [ prop.className "nav-icon"; prop.text "\U0001F4DA" ]
                    Html.span [ prop.className "nav-label"; prop.text "Decks" ]
                ]
            ]
            Html.button [
                prop.className (match activeView with StatsView -> "nav-tab active" | _ -> "nav-tab")
                prop.onClick (fun _ -> dispatch (SetView StatsView))
                prop.children [
                    Html.span [ prop.className "nav-icon"; prop.text "\U0001F4CA" ]
                    Html.span [ prop.className "nav-label"; prop.text "Stats" ]
                ]
            ]
        ]
    ]

/// Main application view
let view (model: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "app-container"
        prop.children [
            Html.header [
                prop.className "app-header"
                prop.children [
                    Html.h1 [ prop.text "CodeCards" ]
                    Html.span [ prop.className "app-subtitle"; prop.text "Programming Flashcards" ]
                ]
            ]

            Html.main [
                prop.className "app-main"
                prop.children [
                    match model.ActiveView with
                    | DeckListView -> DeckManager.view model dispatch
                    | DeckDetailView deckId -> deckDetailView deckId model dispatch
                    | CardEditorView (deckId, cardId) -> CardEditor.view deckId cardId model dispatch
                    | ReviewView deckId -> ReviewSession.view deckId model dispatch
                    | StatsView -> Stats.view model dispatch
                ]
            ]

            // Only show navbar on non-review screens
            match model.ActiveView with
            | ReviewView _ -> ()
            | _ -> navbar model.ActiveView dispatch
        ]
    ]

module CodeCards.SpacedRepetition

open System
open CodeCards.Types

/// SM-2 inspired spaced repetition algorithm
/// Updates card scheduling based on user's difficulty rating

/// Calculate the new ease factor based on difficulty
let private newEaseFactor (current: float) (difficulty: Difficulty) =
    let adjustment =
        match difficulty with
        | Again -> -0.8
        | Hard -> -0.15
        | Good -> 0.0
        | Easy -> 0.15
    max 1.3 (current + adjustment)

/// Calculate the new interval in days
let private newInterval (sr: SRData) (difficulty: Difficulty) =
    match difficulty with
    | Again ->
        // Reset — review again soon
        0.0
    | Hard ->
        if sr.Repetitions = 0 then 1.0
        elif sr.Repetitions = 1 then 1.0
        else sr.Interval * 1.2
    | Good ->
        if sr.Repetitions = 0 then 1.0
        elif sr.Repetitions = 1 then 3.0
        else sr.Interval * sr.EaseFactor
    | Easy ->
        if sr.Repetitions = 0 then 2.0
        elif sr.Repetitions = 1 then 4.0
        else sr.Interval * sr.EaseFactor * 1.3

/// Calculate the new repetition count
let private newRepetitions (current: int) (difficulty: Difficulty) =
    match difficulty with
    | Again -> 0
    | _ -> current + 1

/// Update a card's spaced repetition data after a review
let updateCard (card: Card) (difficulty: Difficulty) : Card =
    let sr = card.SRData
    let ef = newEaseFactor sr.EaseFactor difficulty
    let interval = newInterval sr difficulty
    let reps = newRepetitions sr.Repetitions difficulty

    { card with
        SRData =
            { Interval = interval
              EaseFactor = ef
              Repetitions = reps
              NextReview = DateTime.Now.AddDays(interval)
              LastReviewed = Some DateTime.Now } }

/// Get cards that are due for review (nextReview <= now)
let dueCards (cards: Card list) : Card list =
    let now = DateTime.Now
    cards |> List.filter (fun c -> c.SRData.NextReview <= now)

/// Get cards sorted by urgency (most overdue first, then new cards)
let sortByUrgency (cards: Card list) : Card list =
    let now = DateTime.Now
    cards
    |> List.sortBy (fun c ->
        let overdue = (now - c.SRData.NextReview).TotalDays
        -overdue) // Most overdue first

/// Calculate the estimated next review time for display
let nextReviewLabel (sr: SRData) =
    let now = DateTime.Now
    let diff = sr.NextReview - now
    if sr.Repetitions = 0 then "New card"
    elif diff.TotalMinutes < 1.0 then "Due now"
    elif diff.TotalHours < 1.0 then sprintf "In %d min" (int diff.TotalMinutes)
    elif diff.TotalDays < 1.0 then sprintf "In %d hours" (int diff.TotalHours)
    elif diff.TotalDays < 7.0 then sprintf "In %d days" (int diff.TotalDays)
    elif diff.TotalDays < 30.0 then sprintf "In %d weeks" (int (diff.TotalDays / 7.0))
    else sprintf "In %d months" (int (diff.TotalDays / 30.0))

/// Calculate overall mastery percentage for a list of cards
let masteryPercentage (cards: Card list) =
    if cards.IsEmpty then 0.0
    else
        let scores =
            cards |> List.map (fun c ->
                match Mastery.level c.SRData with
                | New -> 0.0
                | Learning -> 0.33
                | Reviewing -> 0.66
                | Mastered -> 1.0)
        (scores |> List.sum) / float cards.Length * 100.0

/// Get a study session — returns up to N due cards, sorted by urgency
let getStudySession (maxCards: int) (cards: Card list) : Card list =
    cards
    |> dueCards
    |> sortByUrgency
    |> List.truncate maxCards

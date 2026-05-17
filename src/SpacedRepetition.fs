(* Spaced Repetition — SM-2 Algorithm
   ====================================
   Based on SuperMemo 2 (SM-2), the algorithm schedules card reviews so
   that each card is shown just before it would be forgotten, with the
   gap between reviews growing as recall becomes more reliable.

   Three values are maintained per card (see SRData in Types.fs):

     EaseFactor   — a per-card multiplier (floor 1.3, default 2.5) that
                    reflects how easy the card is for the learner.
                    Adjusted after every review: Hard lowers it, Easy
                    raises it, Good leaves it unchanged.

     Interval     — days until the next review.  Starts at 1 day and
                    grows by EaseFactor on each successful repetition,
                    so an easy card with EF 2.5 reviewed today at 8 days
                    schedules the next review in 20 days.

     Repetitions  — consecutive correct reviews (Again resets to 0).
                    The first two repetitions use fixed short intervals
                    (1 day, then 3 days for Good) so the card is
                    reinforced quickly before EaseFactor-based growth
                    begins.

   Difficulty ratings map to algorithm adjustments:
     Again → reset Repetitions to 0, Interval to 0 (due immediately)
     Hard  → EF -= 0.15, Interval grows by only 1.2×
     Good  → EF unchanged, Interval grows by EF
     Easy  → EF += 0.15, Interval grows by EF × 1.3
*)
module CodeCards.SpacedRepetition

open System
open CodeCards.Types

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

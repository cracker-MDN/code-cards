module CodeCards.Stats

open System
open Feliz
open CodeCards.Types

/// Get daily review counts for the last N days
let private dailyActivity (days: int) (history: ReviewResult list) =
    let today = DateTime.Now.Date
    [ for i in (days - 1) .. -1 .. 0 do
        let date = today.AddDays(float -i)
        let count =
            history
            |> List.filter (fun r -> r.ReviewedAt.Date = date)
            |> List.length
        (date, count) ]

/// Calculate current study streak (consecutive days with reviews)
let private studyStreak (history: ReviewResult list) =
    let today = DateTime.Now.Date
    let dates =
        history
        |> List.map (fun r -> r.ReviewedAt.Date)
        |> List.distinct
        |> Set.ofList
    let mutable streak = 0
    let mutable day = today
    // Check if studied today or yesterday to start the streak
    if not (dates.Contains today) then
        day <- today.AddDays(-1.0)
        if not (dates.Contains day) then
            day <- today // Will result in streak = 0
    while dates.Contains day do
        streak <- streak + 1
        day <- day.AddDays(-1.0)
    streak

/// Stat card component
let private statCard (label: string) (value: string) (icon: string) (color: string) =
    Html.div [
        prop.className "stat-card"
        prop.children [
            Html.div [
                prop.className "stat-icon"
                prop.style [ style.backgroundColor color ]
                prop.text icon
            ]
            Html.div [
                prop.className "stat-content"
                prop.children [
                    Html.div [ prop.className "stat-value"; prop.text value ]
                    Html.div [ prop.className "stat-label"; prop.text label ]
                ]
            ]
        ]
    ]

/// Activity heatmap (last 30 days)
let private activityChart (data: (DateTime * int) list) =
    if data.IsEmpty then Html.none
    else
        let maxVal = data |> List.map snd |> List.max |> max 1
        let dayNames = [| "Sun"; "Mon"; "Tue"; "Wed"; "Thu"; "Fri"; "Sat" |]

        Html.div [
            prop.className "activity-chart"
            prop.children [
                Html.div [
                    prop.className "activity-bars"
                    prop.children [
                        for (date, count) in data do
                            let heightPct = (float count / float maxVal) * 100.0
                            let isToday = date.Date = DateTime.Now.Date
                            Html.div [
                                prop.className "activity-col"
                                prop.title (sprintf "%s: %d reviews" (date.ToString("MMM dd")) count)
                                prop.children [
                                    Html.div [
                                        prop.className "activity-value"
                                        prop.text (if count > 0 then string count else "")
                                    ]
                                    Html.div [
                                        prop.className "activity-bar-track"
                                        prop.children [
                                            Html.div [
                                                prop.className "activity-bar-fill"
                                                prop.style [
                                                    style.height (length.percent heightPct)
                                                    style.backgroundColor (if isToday then "#6366f1" else "#3b82f6")
                                                ]
                                            ]
                                        ]
                                    ]
                                    Html.span [
                                        prop.className (if isToday then "activity-label today" else "activity-label")
                                        prop.text dayNames.[int date.DayOfWeek]
                                    ]
                                ]
                            ]
                    ]
                ]
            ]
        ]

/// Mastery distribution across all decks
let private masteryDistribution (decks: Deck list) =
    let allCards = decks |> List.collect (fun d -> d.Cards)
    if allCards.IsEmpty then Html.none
    else
        let groups =
            allCards
            |> List.groupBy (fun c -> Mastery.level c.SRData)
            |> List.map (fun (level, cards) -> (level, List.length cards))
            |> List.sortBy (fun (level, _) ->
                match level with
                | New -> 0 | Learning -> 1 | Reviewing -> 2 | Mastered -> 3)
        let total = float allCards.Length

        Html.div [
            prop.className "mastery-dist"
            prop.children [
                Html.h3 [ prop.text "Card Mastery" ]
                // Stacked bar
                Html.div [
                    prop.className "mastery-stacked-bar"
                    prop.children [
                        for (level, count) in groups do
                            let pct = float count / total * 100.0
                            if pct > 0.0 then
                                Html.div [
                                    prop.className "mastery-segment"
                                    prop.style [
                                        style.width (length.percent pct)
                                        style.backgroundColor (Mastery.color level)
                                    ]
                                    prop.title (sprintf "%s: %d cards (%.0f%%)" (Mastery.label level) count pct)
                                ]
                    ]
                ]
                // Legend
                Html.div [
                    prop.className "mastery-legend"
                    prop.children [
                        for (level, count) in groups do
                            Html.div [
                                prop.className "legend-item"
                                prop.children [
                                    Html.div [
                                        prop.className "legend-dot"
                                        prop.style [ style.backgroundColor (Mastery.color level) ]
                                    ]
                                    Html.span [ prop.text (sprintf "%s: %d" (Mastery.label level) count) ]
                                ]
                            ]
                    ]
                ]
            ]
        ]

/// Difficulty accuracy from review history
let private accuracyBreakdown (history: ReviewResult list) =
    let recent = history |> List.filter (fun r -> r.ReviewedAt >= DateTime.Now.AddDays(-30.0))
    if recent.IsEmpty then Html.none
    else
        let groups = recent |> List.countBy (fun r -> r.Difficulty)
        let total = float recent.Length

        Html.div [
            prop.className "accuracy-section"
            prop.children [
                Html.h3 [ prop.text "Review Accuracy (30 days)" ]
                Html.div [
                    prop.className "accuracy-bars"
                    prop.children [
                        for diff in [ Easy; Good; Hard; Again ] do
                            let count = groups |> List.tryFind (fun (d, _) -> d = diff) |> Option.map snd |> Option.defaultValue 0
                            let pct = float count / total * 100.0
                            let (label, color) =
                                match diff with
                                | Easy -> ("Easy", "#22c55e")
                                | Good -> ("Good", "#3b82f6")
                                | Hard -> ("Hard", "#f59e0b")
                                | Again -> ("Again", "#ef4444")
                            Html.div [
                                prop.className "accuracy-row"
                                prop.children [
                                    Html.span [ prop.className "accuracy-label"; prop.text label ]
                                    Html.div [
                                        prop.className "accuracy-bar-track"
                                        prop.children [
                                            Html.div [
                                                prop.className "accuracy-bar-fill"
                                                prop.style [
                                                    style.width (length.percent pct)
                                                    style.backgroundColor color
                                                ]
                                            ]
                                        ]
                                    ]
                                    Html.span [
                                        prop.className "accuracy-count"
                                        prop.text (sprintf "%d (%.0f%%)" count pct)
                                    ]
                                ]
                            ]
                    ]
                ]
            ]
        ]

/// Prominent study streak banner shown at the top of the stats page
let private streakBanner (streak: int) =
    let bannerClass =
        if streak = 0 then "streak-banner streak-none"
        elif streak < 7 then "streak-banner streak-active"
        elif streak < 30 then "streak-banner streak-fire"
        else "streak-banner streak-legendary"
    let message =
        if streak = 0 then "Study today to start your streak!"
        elif streak = 1 then "Great start — study again tomorrow!"
        elif streak < 7 then "Keep the momentum going!"
        elif streak < 30 then "You’re on fire — don’t break it now!"
        else "Legendary dedication. Keep it up!"
    Html.div [
        prop.className bannerClass
        prop.children [
            Html.div [ prop.className "streak-flame-icon"; prop.text "\U0001F525" ]
            Html.div [
                prop.className "streak-main"
                prop.children [
                    Html.div [ prop.className "streak-number"; prop.text (string streak) ]
                    Html.div [ prop.className "streak-label"; prop.text "day streak" ]
                    Html.div [ prop.className "streak-msg"; prop.text message ]
                ]
            ]
            Html.div [
                prop.className "streak-milestones"
                prop.children [
                    for (days, emoji) in [ (3, "\U0001F949"); (7, "\U0001F948"); (30, "\U0001F947") ] do
                        Html.div [
                            prop.className (if streak >= days then "streak-milestone unlocked" else "streak-milestone locked")
                            prop.title (sprintf "%d-day milestone" days)
                            prop.children [
                                Html.div [ prop.className "milestone-icon"; prop.text emoji ]
                                Html.div [ prop.className "milestone-days"; prop.text (sprintf "%dd" days) ]
                            ]
                        ]
                ]
            ]
        ]
    ]

/// Main stats view
let view (model: Model) (_dispatch: Msg -> unit) =
    let totalCards = model.Decks |> List.sumBy (fun d -> List.length d.Cards)
    let totalReviews = List.length model.ReviewHistory
    let streak = studyStreak model.ReviewHistory
    let todayReviews =
        model.ReviewHistory
        |> List.filter (fun r -> r.ReviewedAt.Date = DateTime.Now.Date)
        |> List.length
    let daily = dailyActivity 14 model.ReviewHistory

    Html.div [
        prop.className "stats-page"
        prop.children [
            Html.h2 [ prop.text "Study Statistics" ]

            // Streak banner
            streakBanner streak

            // Summary cards
            Html.div [
                prop.className "stat-cards"
                prop.children [
                    statCard "Total Cards" (string totalCards) "\U0001F4DA" "#6366f1"
                    statCard "Reviews Today" (string todayReviews) "\U0001F4DD" "#3b82f6"
                    statCard "Study Streak" (sprintf "%d days" streak) "\U0001F525" "#f59e0b"
                    statCard "All Reviews" (string totalReviews) "\U0001F4CA" "#22c55e"
                ]
            ]

            // Activity chart
            Html.div [
                prop.className "chart-section"
                prop.children [
                    Html.h3 [ prop.text "Last 14 Days" ]
                    activityChart daily
                ]
            ]

            // Mastery distribution
            masteryDistribution model.Decks

            // Accuracy breakdown
            accuracyBreakdown model.ReviewHistory
        ]
    ]

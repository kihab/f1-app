# iOS App Structure & Design Decisions

Building a **SwiftUI** app using the **MVVM** pattern. Two screens: Seasons list + Races list. Code is fully programmatic (no storyboards) for clarity and testability.

---

## 1. Folder Layout

```
iOSApp/
├── Models/                # Codable structs matching API JSON
│   ├── Season.swift
│   └── Race.swift
│   └── Driver.swift       # shared driver model if needed
│
├── Views/                 # SwiftUI views
│   ├── SeasonsView.swift      # lists seasons
│   ├── SeasonRowView.swift    # row UI for a season
│   ├── RacesView.swift        # lists races for a season
│   └── RaceRowView.swift      # row UI for a race
│
├── ViewModels/            # MVVM view models (logic + state)
│   ├── SeasonsViewModel.swift
│   └── RacesViewModel.swift
│
├── Services/              # Networking and data loading
│   ├── APIClient.swift        # protocol definition
│   └── DefaultAPIClient.swift # URLSession implementation
│
├── Utilities/             # Helpers, e.g. error enums, logging
│   └── ErrorHandler.swift
│
└── iOSAppApp.swift        # @main entrypoint with WindowGroup and NavigationStack
```

---

## 2. MVVM Pattern

* **Model**: Plain `structs` conforming to `Codable` (e.g. `Season`, `Race`, `Driver`).
* **ViewModel**: `ObservableObject` classes that:

  * Expose `@Published` properties for view state (data, loading, error).
  * Accept an `APIClient` via initializer for dependency injection.
  * Perform async calls with `async/await`.
* **View**: SwiftUI views observing the ViewModel, showing loading indicators, error messages, and lists via `List` and `NavigationLink`.

---

## 3. Navigation

Use SwiftUI’s **NavigationStack**:

```swift
@main
struct iOSAppApp: App {
  var body: some Scene {
    WindowGroup {
      NavigationStack {
        SeasonsView(viewModel: SeasonsViewModel(apiClient: DefaultAPIClient()))
      }
    }
  }
}
```

* SeasonsView → NavigationLink to RacesView(year: ...)

---

## 4. Dependency Injection

* Define a protocol:

  ```swift
  protocol APIClient {
    func fetchSeasons() async throws -> [Season]
    func fetchRaces(year: Int) async throws -> [Race]
  }
  ```
* Provide a `DefaultAPIClient` implementing it via `URLSession`.
* Inject into ViewModels:

  ```swift
  class SeasonsViewModel: ObservableObject {
    @Published var seasons: [Season] = []
    init(apiClient: APIClient) { ... }
  }
  ```
* Tests can supply a mock `APIClient` that returns canned data.

---

## 5. Third-Party Libraries

> No external dependencies at this stage.

We rely on `URLSession` + `async/await`. Add libraries (e.g. Alamofire, Kingfisher) only if necessary later.

---

## 6. Testing & CI/CD Readiness

* **Unit tests**: Test ViewModels by injecting mock APIClients.
* **UI tests**: Can test navigation and List rendering.
* **CI/CD**: GitHub Actions can run `xcodebuild test` on every push.

---

*This structure ensures high modularity, clear separation of concerns, and ease of testing & future growth.*

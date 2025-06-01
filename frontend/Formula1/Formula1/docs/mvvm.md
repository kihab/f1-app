# MVVM Pattern in the F1 iOS App

This document explains the **MVVM (Model-View-ViewModel)** architecture pattern adopted in the F1 iOS app, and how it shapes the structure, responsibilities, and maintainability of the codebase.

---

## **What is MVVM?**

**MVVM** stands for **Model-View-ViewModel**.  
It is a UI architecture pattern that helps you separate your app’s UI from business logic and data management.  
- **Model**: Data structures, business logic, and networking code.
- **View**: SwiftUI views—responsible only for displaying the UI.
- **ViewModel**: Binds the Model to the View, providing observable state and actions.

---

## **Why MVVM?**

- **Separation of concerns**: Keeps UI logic and business/data logic independent.
- **Testability**: ViewModels can be tested without UI.
- **Reactivity**: SwiftUI works naturally with ObservableObject/ViewModel patterns.
- **Maintainability**: Easy to extend features and fix bugs without UI/logic entanglement.

---

## **How MVVM is Applied in This App**

### **1. Model Layer**

- Represents F1 domain entities (e.g., `Season`, `Race`, `Driver` structs).
- Handles parsing API responses (Decodable/Encodable).
- No UI code or side-effects.

### **2. ViewModel Layer**

- **Example**: `SeasonsViewModel`, `RacesViewModel`
- Owns published properties for UI state (e.g., `@Published var seasons: [Season]`)
- Calls backend API services (e.g., `SeasonsAPI.fetchSeasons()`)
- Performs loading/error handling and minimal transformation of data for the View.
- Exposes only what the View needs (data, loading, error states, actions).

### **3. View Layer**

- **SwiftUI Views** (e.g., `SeasonsListView`)
- Observes ViewModel’s published state using `@ObservedObject`/`@StateObject`.
- Displays lists, loading indicators, error states.
- Binds UI actions to ViewModel (e.g., reload, retry).
- **No business logic or data fetching inside the View.**

---

## **Example Structure**

```swift
// Model
struct Season: Decodable {
    let year: Int
    let champion: String
}

// ViewModel
class SeasonsViewModel: ObservableObject {
    @Published var seasons: [Season] = []
    @Published var isLoading: Bool = false
    @Published var error: String?

    func fetchSeasons() {
        // Fetch from API, update state
    }
}

// View
struct SeasonsListView: View {
    @StateObject var vm = SeasonsViewModel()

    var body: some View {
        List(vm.seasons, id: \.year) { season in
            Text(\"\\(season.year) Champion: \\(season.champion)\")
        }
        // Show loading/error state from vm
    }
}

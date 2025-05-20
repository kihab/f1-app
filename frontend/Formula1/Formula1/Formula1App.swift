//
//  Formula1App.swift
//  Formula1
//
//  Created by Karim Ihab on 19/05/2025.
//

import SwiftUI

@main
struct Formula1App: App {
    var body: some Scene {
        WindowGroup {
            // Instantiate the APIClient and inject it into the SeasonsViewModel,
            // then pass the ViewModel to SeasonsListView.
            SeasonsListView(viewModel: SeasonsViewModel(apiClient: APIClient()))
        }
    }
}

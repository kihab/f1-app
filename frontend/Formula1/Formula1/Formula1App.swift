//
//  Formula1App.swift
//  Formula1
//
//  Created by Karim Ihab on 19/05/2025.
//

import SwiftUI

@main
struct Formula1App: App {
    // Create a single instance of the APIClient to be shared.
    private let apiClient = APIClient()
    
    var body: some Scene {
        WindowGroup {
            // Pass the SeasonsViewModel (initialized with apiClient)
            // AND pass the apiClient again for SeasonsListView to use for navigation.
            SeasonsListView(
                viewModel: SeasonsViewModel(apiClient: apiClient), 
                apiClient: apiClient
            )
        }
    }
}

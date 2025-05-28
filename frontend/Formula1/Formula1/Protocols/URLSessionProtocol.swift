//
//  URLSessionProtocol.swift
//  Formula1
//
//  Created by Karim Ihab on 28/05/2025.
//

import Foundation

/// Protocol defining the URLSession behavior needed by the app
protocol URLSessionProtocol {
    func data(from url: URL) async throws -> (Data, URLResponse)
}

/// Extension to make the real URLSession conform to our protocol
extension URLSession: URLSessionProtocol {
    // URLSession already implements this method, so no additional code needed
}

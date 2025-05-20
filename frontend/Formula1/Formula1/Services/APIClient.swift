// Services/APIClient.swift
// Concrete implementation of APIClientProtocol using URLSession.

import Foundation

/// Provides methods to fetch data from the Formula 1 API.
class APIClient: APIClientProtocol {
    private let baseURL = "http://localhost:3000/api/seasons"
    
    /// Fetches a list of seasons from the API and maps them to domain models.
    /// - Returns: An array of `Season` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    func fetchSeasons() async throws -> [Season] {
        guard let url = URL(string: baseURL) else {
            throw NetworkError.invalidURL
        }
        
        let data: Data
        let response: URLResponse
        
        do {
            (data, response) = try await URLSession.shared.data(from: url)
        } catch {
            throw NetworkError.requestFailed(error)
        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }
        
        do {
            let seasonDTOs = try JSONDecoder().decode([SeasonDTO].self, from: data)
            // Map DTOs to Domain Models
            let seasons = seasonDTOs.map { dto in
                Season(year: dto.year, 
                       champion: Driver(id: dto.champion.id, 
                                        name: dto.champion.name, 
                                        driverRef: dto.champion.driverRef))
            }
            return seasons
        } catch {
            print("Decoding error: \(error)") // Log the actual decoding error for debugging
            throw NetworkError.decodingError(error)
        }
    }
}

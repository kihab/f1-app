// Services/APIClient.swift
// Concrete implementation of APIClientProtocol using URLSession.

import Foundation
import Network

/// Provides methods to fetch data from the Formula 1 API.
class APIClient: APIClientProtocol {
    private let baseSeasonsURL = "http://localhost:3000/api/seasons"
    private let networkMonitor = NetworkMonitor()
    
    /// Fetches a list of seasons from the API and maps them to domain models.
    /// - Returns: An array of `Season` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    /// Maps HTTP status codes to appropriate NetworkError types
    private func mapHTTPError(_ statusCode: Int) -> NetworkError {
        switch statusCode {
        case 404:
            return .emptyData
        case 408, 504:
            return .requestFailed(NSError(domain: "APIClient", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Request timed out"]))
        case 429:
            return .rateLimited
        case 503:
            return .serverMaintenance
        default:
            return .httpError(statusCode: statusCode)
        }
    }
    
    func fetchSeasons() async throws -> [Season] {
        // Check for network connectivity before making the request
        guard networkMonitor.isConnected else {
            throw NetworkError.offline
        }
        
        guard let url = URL(string: baseSeasonsURL) else {
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
            throw mapHTTPError(httpResponse.statusCode)
        }
        
        do {
            // Decode using the new APIResponse wrapper that matches the backend response structure
            let apiResponse = try JSONDecoder().decode(APIResponse<[SeasonDTO]>.self, from: data)
            
            // Extract the seasons array from the data field
            let seasonDTOs = apiResponse.data
            
            // Check if data is empty but response was successful
            if seasonDTOs.isEmpty {
                // This is technically a successful response with no data
                return []
            }
            
            // Map DTOs to Domain Models, now including nationality
            let seasons = seasonDTOs.map { dto in
                Season(year: dto.year, 
                       champion: Driver(id: dto.champion.id, 
                                        name: dto.champion.name, 
                                        driverRef: dto.champion.driverRef,
                                        nationality: dto.champion.nationality))
            }
            return seasons
        } catch {
            print("Decoding error (Seasons): \(error)") // Log the actual decoding error for debugging
            throw NetworkError.decodingError(error)
        }
    }

    /// Fetches a list of races for a given season year from the API and maps them to domain models.
    /// - Parameter year: The year of the season for which to fetch races.
    /// - Returns: An array of `Race` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    func fetchRaces(year: Int) async throws -> [Race] {
        // Check for network connectivity before making the request
        guard networkMonitor.isConnected else {
            throw NetworkError.offline
        }
        
        guard let url = URL(string: "\(baseSeasonsURL)/\(year)/races") else {
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
            throw mapHTTPError(httpResponse.statusCode)
        }
        
        do {
            // Decode using the new APIResponse wrapper that matches the backend response structure
            let apiResponse = try JSONDecoder().decode(APIResponse<[RaceDTO]>.self, from: data)
            
            // Extract the races array from the data field
            let raceDTOs = apiResponse.data
            
            // Check if data is empty but response was successful
            if raceDTOs.isEmpty {
                // This is technically a successful response with no data
                return []
            }
            
            // Map DTOs to Domain Models, now including nationality
            let races = raceDTOs.map { dto in
                Race(round: dto.round,
                     name: dto.name,
                     url: dto.url,
                     date: dto.date,
                     country: dto.country,
                     isChampion: dto.isChampion,
                     winner: Driver(id: dto.winner.id,
                                    name: dto.winner.name,
                                    driverRef: dto.winner.driverRef,
                                    nationality: dto.winner.nationality))
            }
            return races
        } catch {
            print("Decoding error (Races for year \(year)): \(error)") // Log the actual decoding error
            throw NetworkError.decodingError(error)
        }
    }
}

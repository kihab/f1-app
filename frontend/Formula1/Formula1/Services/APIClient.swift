// Services/APIClient.swift
// Concrete implementation of APIClientProtocol using URLSession.

import Foundation
import Network

/// Provides methods to fetch data from the Formula 1 API.
class APIClient: APIClientProtocol {
    // Use constants instead of string literals
    private let baseURL: String
    private let seasonsEndpoint: String
    // Dependencies injected for better testability
    private let networkMonitor: NetworkMonitor
    private let session: URLSessionProtocol
    
    /// Fetches a list of seasons from the API and maps them to domain models.
    /// - Returns: An array of `Season` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    /// Maps HTTP status codes to appropriate NetworkError types
    /// - Parameter statusCode: The HTTP status code to map to a NetworkError
    /// - Returns: The appropriate NetworkError for the given status code
    internal func mapHTTPError(_ statusCode: Int) -> NetworkError {
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
    
    /// Initializes the API client with dependencies.
    /// - Parameters:
    ///   - baseURL: The base URL for API requests
    ///   - seasonsEndpoint: The endpoint for seasons data
    ///   - networkMonitor: The network monitor to check connectivity
    ///   - session: The URL session for network requests
    init(
        baseURL: String = Constants.Network.baseURL,
        seasonsEndpoint: String = Constants.Network.seasonsEndpoint,
        networkMonitor: NetworkMonitor = NetworkMonitor(),
        session: URLSessionProtocol = URLSession.shared
    ) {
        self.baseURL = baseURL
        self.seasonsEndpoint = seasonsEndpoint
        self.networkMonitor = networkMonitor
        self.session = session
    }
    
    /// Creates the full URL for fetching seasons data
    /// - Returns: The URL for the seasons endpoint or nil if invalid
    func makeSeasonsURL() -> URL? {
        return URL(string: baseURL + seasonsEndpoint)
    }
    
    /// Creates the full URL for fetching races data for a specific year
    /// - Parameter year: The year to fetch races for
    /// - Returns: The URL for the races endpoint or nil if invalid
    func makeRacesURL(year: Int) -> URL? {
        return URL(string: baseURL + seasonsEndpoint + "/\(year)/races")
    }
    
    func fetchSeasons() async throws -> [Season] {
        // Check for network connectivity before making the request
        guard networkMonitor.isConnected else {
            throw NetworkError.offline
        }
        
        guard let url = makeSeasonsURL() else {
            throw NetworkError.invalidURL
        }
        
        let data: Data
        let response: URLResponse
        
        do {
            // Use the injected session property instead of URLSession.shared
            (data, response) = try await session.data(from: url)
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
        
        guard let url = makeRacesURL(year: year) else {
            throw NetworkError.invalidURL
        }
        
        let data: Data
        let response: URLResponse
        
        do {
            // Use the injected session property instead of URLSession.shared
            (data, response) = try await session.data(from: url)
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

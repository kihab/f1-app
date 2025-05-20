// Services/APIClient.swift
// Concrete implementation of APIClientProtocol using URLSession.

import Foundation

/// Provides methods to fetch data from the Formula 1 API.
class APIClient: APIClientProtocol {
    private let baseSeasonsURL = "http://localhost:3000/api/seasons"
    
    /// Fetches a list of seasons from the API and maps them to domain models.
    /// - Returns: An array of `Season` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    func fetchSeasons() async throws -> [Season] {
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
            print("Decoding error (Seasons): \(error)") // Log the actual decoding error for debugging
            throw NetworkError.decodingError(error)
        }
    }

    /// Fetches a list of races for a given season year from the API and maps them to domain models.
    /// - Parameter year: The year of the season for which to fetch races.
    /// - Returns: An array of `Race` domain models.
    /// - Throws: A `NetworkError` if any step of the process fails.
    func fetchRaces(year: Int) async throws -> [Race] {
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
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }
        
        do {
            let raceDTOs = try JSONDecoder().decode([RaceDTO].self, from: data)
            // Map DTOs to Domain Models
            let races = raceDTOs.map { dto in
                Race(round: dto.round,
                     name: dto.name,
                     isChampion: dto.isChampion,
                     winner: Driver(id: dto.winner.id,
                                    name: dto.winner.name,
                                    driverRef: dto.winner.driverRef))
            }
            return races
        } catch {
            print("Decoding error (Races for year \(year)): \(error)") // Log the actual decoding error
            throw NetworkError.decodingError(error)
        }
    }
}

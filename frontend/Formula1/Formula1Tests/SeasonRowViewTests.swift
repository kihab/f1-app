import XCTest
@testable import Formula1

class SeasonRowViewTests: XCTestCase {
    
    func testSeasonRowViewInitialization() {
        // Create test data
        let champion = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        let season = Season(year: 2023, champion: champion)
        
        // Create the view
        let seasonRowView = SeasonRowView(season: season)
        
        // Verify the view uses the provided data
        XCTAssertEqual(seasonRowView.season.year, 2023)
        XCTAssertEqual(seasonRowView.season.champion.name, "Max Verstappen")
        XCTAssertEqual(seasonRowView.season.champion.nationality, "Dutch")
    }
    
    func testSeasonRowViewWithDifferentYearAndChampion() {
        // Create test data with different values
        let champion = Driver(id: 2, name: "Lewis Hamilton", driverRef: "hamilton", nationality: "British")
        let season = Season(year: 2020, champion: champion)
        
        // Create the view
        let seasonRowView = SeasonRowView(season: season)
        
        // Verify the view uses the provided data
        XCTAssertEqual(seasonRowView.season.year, 2020)
        XCTAssertEqual(seasonRowView.season.champion.name, "Lewis Hamilton")
        XCTAssertEqual(seasonRowView.season.champion.nationality, "British")
    }
    
    func testSeasonRowViewWithNilNationality() {
        // Create test data with nil nationality
        let champion = Driver(id: 3, name: "Lando Norris", driverRef: "norris", nationality: nil)
        let season = Season(year: 2025, champion: champion)
        
        // Create the view
        let seasonRowView = SeasonRowView(season: season)
        
        // Verify the view uses the provided data
        XCTAssertEqual(seasonRowView.season.year, 2025)
        XCTAssertEqual(seasonRowView.season.champion.name, "Lando Norris")
        XCTAssertNil(seasonRowView.season.champion.nationality)
    }
}

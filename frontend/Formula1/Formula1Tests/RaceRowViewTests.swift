import XCTest
@testable import Formula1

class RaceRowViewTests: XCTestCase {
    
    func testRaceRowViewBasicInitialization() {
        // Create test data
        let winner = Driver(id: 1, name: "Max Verstappen", driverRef: "verstappen", nationality: "Dutch")
        let race = Race(round: 1, 
                      name: "Bahrain Grand Prix", 
                      url: nil, 
                      date: "2023-03-05", 
                      country: "Bahrain", 
                      isChampion: false, 
                      winner: winner)
        
        // Create the view
        let raceRowView = RaceRowView(race: race)
        
        // Verify the view uses the provided data
        XCTAssertEqual(raceRowView.race.name, "Bahrain Grand Prix")
        XCTAssertEqual(raceRowView.race.round, 1)
        XCTAssertEqual(raceRowView.race.winner.name, "Max Verstappen")
        XCTAssertFalse(raceRowView.race.isChampion)
    }
    
    func testRaceRowViewWithChampionFlag() {
        // Create test data with champion flag set to true
        let winner = Driver(id: 2, name: "Lewis Hamilton", driverRef: "hamilton", nationality: "British")
        let race = Race(round: 20, 
                      name: "Abu Dhabi Grand Prix", 
                      url: nil, 
                      date: "2023-11-26", 
                      country: "UAE", 
                      isChampion: true, 
                      winner: winner)
        
        // Create the view
        let raceRowView = RaceRowView(race: race)
        
        // Verify the view uses the provided data
        XCTAssertEqual(raceRowView.race.name, "Abu Dhabi Grand Prix")
        XCTAssertEqual(raceRowView.race.round, 20)
        XCTAssertEqual(raceRowView.race.winner.name, "Lewis Hamilton")
        XCTAssertTrue(raceRowView.race.isChampion)
    }
    
    func testRaceRowViewWithWikipediaURL() {
        // Create test data with URL
        let winner = Driver(id: 3, name: "Charles Leclerc", driverRef: "leclerc", nationality: "Monégasque")
        let race = Race(round: 10, 
                      name: "Monaco Grand Prix", 
                      url: "https://en.wikipedia.org/wiki/Monaco_Grand_Prix", 
                      date: "2023-05-28", 
                      country: "Monaco", 
                      isChampion: false, 
                      winner: winner)
        
        // Create the view
        let raceRowView = RaceRowView(race: race)
        
        // Verify the view uses the provided data
        XCTAssertEqual(raceRowView.race.name, "Monaco Grand Prix")
        XCTAssertEqual(raceRowView.race.country, "Monaco")
        XCTAssertEqual(raceRowView.race.url, "https://en.wikipedia.org/wiki/Monaco_Grand_Prix")
    }
    
    func testRaceRowViewWithNilFields() {
        // Create test data with nil values
        let winner = Driver(id: 4, name: "Lando Norris", driverRef: "norris", nationality: nil)
        let race = Race(round: 5, 
                      name: "Miami Grand Prix", 
                      url: nil, 
                      date: nil, 
                      country: nil, 
                      isChampion: false, 
                      winner: winner)
        
        // Create the view
        let raceRowView = RaceRowView(race: race)
        
        // Verify the view uses the provided data
        XCTAssertEqual(raceRowView.race.name, "Miami Grand Prix")
        XCTAssertNil(raceRowView.race.date)
        XCTAssertNil(raceRowView.race.country)
        XCTAssertNil(raceRowView.race.winner.nationality)
    }
}

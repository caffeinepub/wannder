import Float "mo:core/Float";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Listing Types
  public type ListingType = {
    #hotel;
    #flight;
    #dorm;
    #activity;
  };

  // User Profile
  public type UserProfile = {
    displayName : Text;
    email : Text;
    avatarUrl : Text;
    role : AccessControl.UserRole;
  };

  module UserProfile {
    public func compareByDisplayName(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.displayName, p2.displayName);
    };
  };

  // Hotel Listing
  public type Hotel = {
    id : Nat;
    name : Text;
    location : Text;
    country : Text;
    description : Text;
    pricePerNight : Float;
    rating : Float;
    amenities : [Text];
    imageUrls : [Text];
    availableRooms : Nat;
    roomTypes : [Text];
  };

  // Flight Listing
  public type Flight = {
    id : Nat;
    airline : Text;
    originCity : Text;
    destinationCity : Text;
    departureDateTime : Int;
    arrivalDateTime : Int;
    price : Float;
    flightClass : Text;
    availableSeats : Nat;
    flightNumber : Text;
  };

  // Dorm Listing
  public type Dorm = {
    id : Nat;
    name : Text;
    location : Text;
    country : Text;
    description : Text;
    pricePerNight : Float;
    rating : Float;
    bedTypes : [Text];
    amenities : [Text];
    imageUrls : [Text];
  };

  // Activity Listing
  public type Activity = {
    id : Nat;
    name : Text;
    destinationCity : Text;
    country : Text;
    description : Text;
    price : Float;
    durationHours : Float;
    category : Text;
    rating : Float;
    imageUrls : [Text];
    availableSpots : Nat;
  };

  // Booking
  public type Booking = {
    id : Nat;
    user : Principal;
    listingType : ListingType;
    listingId : Nat;
    bookingDate : Int;
    checkInDate : ?Int;
    checkOutDate : ?Int;
    activityDate : ?Int;
    numGuestsOrSeats : Nat;
    totalPrice : Float;
    status : Text;
  };

  // Itinerary Day
  public type ItineraryDay = {
    dayNumber : Nat;
    date : Int;
    activities : [Text];
    notes : Text;
  };

  // Trip
  public type Trip = {
    id : Nat;
    user : Principal;
    tripName : Text;
    destination : Text;
    startDate : Int;
    endDate : Int;
    itineraryDays : [ItineraryDay];
  };

  // Destination Info
  public type Destination = {
    id : Nat;
    city : Text;
    country : Text;
    altitude : Nat;
    oxygenLevel : Float;
    lat : Float;
    lon : Float;
    description : Text;
    timezone : Text;
  };

  // Analytics Type
  public type Analytics = {
    totalBookings : Nat;
    hotelBookings : Nat;
    flightBookings : Nat;
    dormBookings : Nat;
    activityBookings : Nat;
    totalRevenue : Float;
  };

  // Storage Maps
  let userProfiles = Map.empty<Principal, UserProfile>();
  let hotels = Map.empty<Nat, Hotel>();
  let flights = Map.empty<Nat, Flight>();
  let dorms = Map.empty<Nat, Dorm>();
  let activities = Map.empty<Nat, Activity>();
  let bookings = Map.empty<Nat, Booking>();
  let trips = Map.empty<Nat, Trip>();
  let destinations = Map.empty<Nat, Destination>();

  var nextHotelId = 7;
  var nextFlightId = 7;
  var nextDormId = 5;
  var nextActivityId = 7;
  var nextBookingId = 1;
  var nextTripId = 1;

  // Mixin Authorization - Initialize early
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Seed Data
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    hotels.add(
      1,
      {
        id = 1;
        name = "Grand Plaza Hotel";
        location = "Paris";
        country = "France";
        description = "Luxury hotel in the heart of Paris with stunning views of the Eiffel Tower.";
        pricePerNight = 220.0;
        rating = 4.9;
        amenities = ["Free WiFi", "Pool", "Restaurant"];
        imageUrls = [
          "https://example.com/hotel1_1.jpg",
          "https://example.com/hotel1_2.jpg",
        ];
        availableRooms = 15;
        roomTypes = ["Single", "Double", "Suite"];
      },
    );

    hotels.add(
      2,
      {
        id = 2;
        name = "Ocean View Resort";
        location = "Cancun";
        country = "Mexico";
        description = "Beachfront resort with breathtaking views of the Caribbean Sea.";
        pricePerNight = 160.0;
        rating = 4.7;
        amenities = ["Bar", "Spa", "Fitness Center"];
        imageUrls = [
          "https://example.com/hotel2_1.jpg",
          "https://example.com/hotel2_2.jpg",
        ];
        availableRooms = 20;
        roomTypes = ["Double", "Suite"];
      },
    );

    hotels.add(
      3,
      {
        id = 3;
        name = "Mountain Lodge";
        location = "Aspen";
        country = "USA";
        description = "Charming mountain lodge in Aspen, perfect for ski trips.";
        pricePerNight = 140.0;
        rating = 4.6;
        amenities = ["Free Breakfast", "Hot Tub", "Ski Rental"];
        imageUrls = [
          "https://example.com/hotel3_1.jpg",
          "https://example.com/hotel3_2.jpg",
        ];
        availableRooms = 12;
        roomTypes = ["Single", "Double"];
      },
    );

    hotels.add(
      4,
      {
        id = 4;
        name = "City Center Inn";
        location = "Tokyo";
        country = "Japan";
        description = "Modern hotel in the center of Tokyo with excellent amenities.";
        pricePerNight = 110.0;
        rating = 4.4;
        amenities = ["Free WiFi", "Laundry Service"];
        imageUrls = [
          "https://example.com/hotel4_1.jpg",
          "https://example.com/hotel4_2.jpg",
        ];
        availableRooms = 18;
        roomTypes = ["Single", "Double", "Suite"];
      },
    );

    hotels.add(
      5,
      {
        id = 5;
        name = "Safari Lodge";
        location = "Nairobi";
        country = "Kenya";
        description = "Luxury lodge in Nairobi, offering safari tours and wildlife experiences.";
        pricePerNight = 260.0;
        rating = 4.8;
        amenities = ["Pool", "Restaurant", "Safari Tours"];
        imageUrls = [
          "https://example.com/hotel5_1.jpg",
          "https://example.com/hotel5_2.jpg",
        ];
        availableRooms = 10;
        roomTypes = ["Suite", "Deluxe"];
      },
    );

    hotels.add(
      6,
      {
        id = 6;
        name = "Lakefront Retreat";
        location = "Queenstown";
        country = "New Zealand";
        description = "Tranquil lakeside retreat with stunning mountain views.";
        pricePerNight = 180.0;
        rating = 4.5;
        amenities = ["Free WiFi", "Boat Rental"];
        imageUrls = [
          "https://example.com/hotel6_1.jpg",
          "https://example.com/hotel6_2.jpg",
        ];
        availableRooms = 14;
        roomTypes = ["Single", "Double"];
      },
    );

    flights.add(
      1,
      {
        id = 1;
        airline = "Air France";
        originCity = "Paris";
        destinationCity = "London";
        departureDateTime = 1689900000;
        arrivalDateTime = 1689921600;
        price = 180.0;
        flightClass = "Economy";
        availableSeats = 90;
        flightNumber = "AF123";
      },
    );

    flights.add(
      2,
      {
        id = 2;
        airline = "Delta Airlines";
        originCity = "New York";
        destinationCity = "Los Angeles";
        departureDateTime = 1689938400;
        arrivalDateTime = 1689963600;
        price = 300.0;
        flightClass = "Business";
        availableSeats = 20;
        flightNumber = "DL456";
      },
    );

    flights.add(
      3,
      {
        id = 3;
        airline = "Emirates";
        originCity = "Dubai";
        destinationCity = "Sydney";
        departureDateTime = 1689981600;
        arrivalDateTime = 1690071600;
        price = 1200.0;
        flightClass = "First";
        availableSeats = 6;
        flightNumber = "EK789";
      },
    );

    flights.add(
      4,
      {
        id = 4;
        airline = "British Airways";
        originCity = "London";
        destinationCity = "Cape Town";
        departureDateTime = 1689934800;
        arrivalDateTime = 1689968400;
        price = 600.0;
        flightClass = "Economy";
        availableSeats = 52;
        flightNumber = "BA321";
      },
    );

    flights.add(
      5,
      {
        id = 5;
        airline = "ANA";
        originCity = "Tokyo";
        destinationCity = "Singapore";
        departureDateTime = 1689951600;
        arrivalDateTime = 1689973200;
        price = 450.0;
        flightClass = "Business";
        availableSeats = 32;
        flightNumber = "NH654";
      },
    );

    flights.add(
      6,
      {
        id = 6;
        airline = "Qantas";
        originCity = "Sydney";
        destinationCity = "Auckland";
        departureDateTime = 1689996000;
        arrivalDateTime = 1690003200;
        price = 200.0;
        flightClass = "Economy";
        availableSeats = 40;
        flightNumber = "QF987";
      },
    );

    dorms.add(
      1,
      {
        id = 1;
        name = "Backpackers Hostel";
        location = "Berlin";
        country = "Germany";
        description = "Budget-friendly hostel in the heart of Berlin, perfect for backpackers.";
        pricePerNight = 28.0;
        rating = 4.2;
        bedTypes = ["Dorm Bed", "Private Room"];
        amenities = ["Free Breakfast", "WiFi"];
        imageUrls = [
          "https://example.com/dorm1_1.jpg",
          "https://example.com/dorm1_2.jpg",
        ];
      },
    );

    dorms.add(
      2,
      {
        id = 2;
        name = "City Center Dorm";
        location = "Barcelona";
        country = "Spain";
        description = "Modern dorm with communal spaces in central Barcelona.";
        pricePerNight = 36.0;
        rating = 4.6;
        bedTypes = ["Dorm Bed", "Private Room"];
        amenities = ["Rooftop Terrace", "Shared Kitchen"];
        imageUrls = [
          "https://example.com/dorm2_1.jpg",
          "https://example.com/dorm2_2.jpg",
        ];
      },
    );

    dorms.add(
      3,
      {
        id = 3;
        name = "Hostel Central";
        location = "Prague";
        country = "Czech Republic";
        description = "Charming hostel in the heart of Prague's Old Town.";
        pricePerNight = 22.0;
        rating = 4.0;
        bedTypes = ["Dorm Bed", "Private Room"];
        amenities = ["Pub", "Free Walking Tours"];
        imageUrls = [
          "https://example.com/dorm3_1.jpg",
          "https://example.com/dorm3_2.jpg",
        ];
      },
    );

    dorms.add(
      4,
      {
        id = 4;
        name = "Budget Stay";
        location = "Bangkok";
        country = "Thailand";
        description = "Affordable accommodations in the center of Bangkok.";
        pricePerNight = 16.0;
        rating = 3.9;
        bedTypes = ["Dorm Bed", "Private Room"];
        amenities = ["Laundry Service", "Breakfast"];
        imageUrls = [
          "https://example.com/dorm4_1.jpg",
          "https://example.com/dorm4_2.jpg",
        ];
      },
    );

    activities.add(
      1,
      {
        id = 1;
        name = "Eiffel Tower Tour";
        destinationCity = "Paris";
        country = "France";
        description = "Guided tour of the iconic Eiffel Tower.";
        price = 25.0;
        durationHours = 2.0;
        category = "Tour";
        rating = 4.8;
        imageUrls = [
          "https://example.com/activity1_1.jpg",
        ];
        availableSpots = 8;
      },
    );

    activities.add(
      2,
      {
        id = 2;
        name = "Mexican Cooking Class";
        destinationCity = "Cancun";
        country = "Mexico";
        description = "Authentic Mexican cooking class experience.";
        price = 45.0;
        durationHours = 3.5;
        category = "Food";
        rating = 4.7;
        imageUrls = [
          "https://example.com/activity2_1.jpg",
        ];
        availableSpots = 5;
      },
    );

    activities.add(
      3,
      {
        id = 3;
        name = "Ski Lessons";
        destinationCity = "Aspen";
        country = "USA";
        description = "Professional ski lessons for all skill levels.";
        price = 85.0;
        durationHours = 4.0;
        category = "Adventure";
        rating = 4.6;
        imageUrls = [
          "https://example.com/activity3_1.jpg",
        ];
        availableSpots = 12;
      },
    );

    activities.add(
      4,
      {
        id = 4;
        name = "Temple Tour";
        destinationCity = "Tokyo";
        country = "Japan";
        description = "Guided tour of Tokyo's historic temples.";
        price = 32.0;
        durationHours = 2.5;
        category = "Culture";
        rating = 4.3;
        imageUrls = [
          "https://example.com/activity4_1.jpg",
        ];
        availableSpots = 9;
      },
    );

    activities.add(
      5,
      {
        id = 5;
        name = "Safari Adventure";
        destinationCity = "Nairobi";
        country = "Kenya";
        description = "Full day safari adventure in Nairobi National Park.";
        price = 160.0;
        durationHours = 8.0;
        category = "Adventure";
        rating = 4.9;
        imageUrls = [
          "https://example.com/activity5_1.jpg",
        ];
        availableSpots = 6;
      },
    );

    activities.add(
      6,
      {
        id = 6;
        name = "Hiking Tour";
        destinationCity = "Queenstown";
        country = "New Zealand";
        description = "Scenic hiking tour in Queenstown's beautiful landscapes.";
        price = 70.0;
        durationHours = 4.0;
        category = "Wellness";
        rating = 4.5;
        imageUrls = [
          "https://example.com/activity6_1.jpg",
        ];
        availableSpots = 8;
      },
    );

    destinations.add(
      1,
      {
        id = 1;
        city = "La Paz";
        country = "Bolivia";
        altitude = 3640;
        oxygenLevel = 60.0;
        lat = -16.5;
        lon = -68.12;
        description = "La Paz is known for its high altitude and stunning mountain views.";
        timezone = "America/La_Paz";
      },
    );

    destinations.add(
      2,
      {
        id = 2;
        city = "Cusco";
        country = "Peru";
        altitude = 3400;
        oxygenLevel = 66.0;
        lat = -13.52;
        lon = -71.97;
        description = "Cusco is the gateway to Machu Picchu and the Inca Trail.";
        timezone = "America/Lima";
      },
    );

    destinations.add(
      3,
      {
        id = 3;
        city = "Kathmandu";
        country = "Nepal";
        altitude = 1400;
        oxygenLevel = 78.0;
        lat = 27.71;
        lon = 85.32;
        description = "Kathmandu is a vibrant city with a rich cultural heritage.";
        timezone = "Asia/Kathmandu";
      },
    );

    destinations.add(
      4,
      {
        id = 4;
        city = "Quito";
        country = "Ecuador";
        altitude = 2850;
        oxygenLevel = 71.0;
        lat = -0.22;
        lon = -78.52;
        description = "Quito is a city at high altitude, surrounded by volcanic mountains.";
        timezone = "America/Guayaquil";
      },
    );

    destinations.add(
      5,
      {
        id = 5;
        city = "Mexico City";
        country = "Mexico";
        altitude = 2240;
        oxygenLevel = 76.0;
        lat = 19.43;
        lon = -99.13;
        description = "Mexico City is a vibrant metropolis with a rich cultural history.";
        timezone = "America/Mexico_City";
      },
    );
  };

  // Core Functionality - Public queries (no auth needed for viewing listings)

  public query func getAllHotels() : async [Hotel] {
    hotels.values().toArray();
  };

  public query func getAllFlights() : async [Flight] {
    flights.values().toArray();
  };

  public query func getAllDorms() : async [Dorm] {
    dorms.values().toArray();
  };

  public query func getAllActivities() : async [Activity] {
    activities.values().toArray();
  };

  public query func getAllDestinations() : async [Destination] {
    destinations.values().toArray();
  };

  public query func getHotel(id : Nat) : async ?Hotel {
    hotels.get(id);
  };

  public query func getFlight(id : Nat) : async ?Flight {
    flights.get(id);
  };

  public query func getDorm(id : Nat) : async ?Dorm {
    dorms.get(id);
  };

  public query func getActivity(id : Nat) : async ?Activity {
    activities.get(id);
  };

  public query func getDestination(id : Nat) : async ?Destination {
    destinations.get(id);
  };

  // Booking Management - Requires user permission

  public shared ({ caller }) func createBooking(listingType : ListingType, listingId : Nat, checkInDate : ?Int, checkOutDate : ?Int, activityDate : ?Int, numGuestsOrSeats : Nat, totalPrice : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    let newBooking : Booking = {
      id = nextBookingId;
      user = caller;
      listingType;
      listingId;
      bookingDate = Time.now();
      checkInDate;
      checkOutDate;
      activityDate;
      numGuestsOrSeats;
      totalPrice;
      status = "pending";
    };

    bookings.add(nextBookingId, newBooking);
    nextBookingId += 1;
    newBooking.id;
  };

  public query ({ caller }) func getCallerBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.entries().toArray().filter(func((_, booking)) { booking.user == caller }).map(func((_, booking)) { booking });
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?existing) {
        bookings.add(
          bookingId,
          {
            id = existing.id;
            user = existing.user;
            listingType = existing.listingType;
            listingId = existing.listingId;
            bookingDate = existing.bookingDate;
            checkInDate = existing.checkInDate;
            checkOutDate = existing.checkOutDate;
            activityDate = existing.activityDate;
            numGuestsOrSeats = existing.numGuestsOrSeats;
            totalPrice = existing.totalPrice;
            status;
          },
        );
      };
    };
  };

  // Trip Management - Requires user permission

  public shared ({ caller }) func createTrip(tripName : Text, destination : Text, startDate : Int, endDate : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trips");
    };

    let newTrip : Trip = {
      id = nextTripId;
      user = caller;
      tripName;
      destination;
      startDate;
      endDate;
      itineraryDays = [];
    };

    trips.add(nextTripId, newTrip);
    nextTripId += 1;
    newTrip.id;
  };

  public shared ({ caller }) func addItineraryDay(tripId : Nat, dayNumber : Nat, date : Int, activities : [Text], notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add itinerary days");
    };

    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existing) {
        if (existing.user != caller) {
          Runtime.trap("Unauthorized: Only the trip creator can add itinerary days");
        };
        let newDay : ItineraryDay = {
          dayNumber;
          date;
          activities;
          notes;
        };
        let currentDays = List.fromArray<ItineraryDay>(existing.itineraryDays);
        currentDays.add(newDay);
        let updatedDays = currentDays.values().toArray();
        trips.add(
          tripId,
          {
            id = existing.id;
            user = existing.user;
            tripName = existing.tripName;
            destination = existing.destination;
            startDate = existing.startDate;
            endDate = existing.endDate;
            itineraryDays = updatedDays;
          },
        );
      };
    };
  };

  public query ({ caller }) func getTravelerTrips() : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    trips.entries().toArray().filter(func((_, trip)) { trip.user == caller }).map(func((_, trip)) { trip });
  };

  public shared ({ caller }) func updateTrip(tripId : Nat, tripName : Text, destination : Text, startDate : Int, endDate : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trips");
    };

    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existing) {
        if (existing.user != caller) {
          Runtime.trap("Unauthorized: Only the trip creator can update the trip");
        };
        trips.add(
          tripId,
          {
            id = existing.id;
            user = existing.user;
            tripName;
            destination;
            startDate;
            endDate;
            itineraryDays = existing.itineraryDays;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trips");
    };

    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?existing) {
        if (existing.user != caller) {
          Runtime.trap("Unauthorized: Only the trip creator can delete the trip");
        };
        trips.remove(tripId);
      };
    };
  };

  // Admin Functions - Hotel Management

  public shared ({ caller }) func createHotel(name : Text, location : Text, country : Text, description : Text, pricePerNight : Float, rating : Float, amenities : [Text], imageUrls : [Text], availableRooms : Nat, roomTypes : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create hotels");
    };

    let newHotel : Hotel = {
      id = nextHotelId;
      name;
      location;
      country;
      description;
      pricePerNight;
      rating;
      amenities;
      imageUrls;
      availableRooms;
      roomTypes;
    };

    hotels.add(nextHotelId, newHotel);
    nextHotelId += 1;
    newHotel.id;
  };

  public shared ({ caller }) func updateHotel(id : Nat, name : Text, location : Text, country : Text, description : Text, pricePerNight : Float, rating : Float, amenities : [Text], imageUrls : [Text], availableRooms : Nat, roomTypes : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update hotels");
    };

    switch (hotels.get(id)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (_) {
        let updatedHotel : Hotel = {
          id;
          name;
          location;
          country;
          description;
          pricePerNight;
          rating;
          amenities;
          imageUrls;
          availableRooms;
          roomTypes;
        };
        hotels.add(id, updatedHotel);
      };
    };
  };

  public shared ({ caller }) func deleteHotel(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete hotels");
    };

    switch (hotels.get(id)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (_) {
        hotels.remove(id);
      };
    };
  };

  // Admin Functions - Flight Management

  public shared ({ caller }) func createFlight(airline : Text, originCity : Text, destinationCity : Text, departureDateTime : Int, arrivalDateTime : Int, price : Float, flightClass : Text, availableSeats : Nat, flightNumber : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create flights");
    };

    let newFlight : Flight = {
      id = nextFlightId;
      airline;
      originCity;
      destinationCity;
      departureDateTime;
      arrivalDateTime;
      price;
      flightClass;
      availableSeats;
      flightNumber;
    };

    flights.add(nextFlightId, newFlight);
    nextFlightId += 1;
    newFlight.id;
  };

  public shared ({ caller }) func updateFlight(id : Nat, airline : Text, originCity : Text, destinationCity : Text, departureDateTime : Int, arrivalDateTime : Int, price : Float, flightClass : Text, availableSeats : Nat, flightNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update flights");
    };

    switch (flights.get(id)) {
      case (null) { Runtime.trap("Flight not found") };
      case (_) {
        let updatedFlight : Flight = {
          id;
          airline;
          originCity;
          destinationCity;
          departureDateTime;
          arrivalDateTime;
          price;
          flightClass;
          availableSeats;
          flightNumber;
        };
        flights.add(id, updatedFlight);
      };
    };
  };

  public shared ({ caller }) func deleteFlight(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete flights");
    };

    switch (flights.get(id)) {
      case (null) { Runtime.trap("Flight not found") };
      case (_) {
        flights.remove(id);
      };
    };
  };

  // Admin Functions - Dorm Management

  public shared ({ caller }) func createDorm(name : Text, location : Text, country : Text, description : Text, pricePerNight : Float, rating : Float, bedTypes : [Text], amenities : [Text], imageUrls : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create dorms");
    };

    let newDorm : Dorm = {
      id = nextDormId;
      name;
      location;
      country;
      description;
      pricePerNight;
      rating;
      bedTypes;
      amenities;
      imageUrls;
    };

    dorms.add(nextDormId, newDorm);
    nextDormId += 1;
    newDorm.id;
  };

  public shared ({ caller }) func updateDorm(id : Nat, name : Text, location : Text, country : Text, description : Text, pricePerNight : Float, rating : Float, bedTypes : [Text], amenities : [Text], imageUrls : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update dorms");
    };

    switch (dorms.get(id)) {
      case (null) { Runtime.trap("Dorm not found") };
      case (_) {
        let updatedDorm : Dorm = {
          id;
          name;
          location;
          country;
          description;
          pricePerNight;
          rating;
          bedTypes;
          amenities;
          imageUrls;
        };
        dorms.add(id, updatedDorm);
      };
    };
  };

  public shared ({ caller }) func deleteDorm(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete dorms");
    };

    switch (dorms.get(id)) {
      case (null) { Runtime.trap("Dorm not found") };
      case (_) {
        dorms.remove(id);
      };
    };
  };

  // Admin Functions - Activity Management

  public shared ({ caller }) func createActivity(name : Text, destinationCity : Text, country : Text, description : Text, price : Float, durationHours : Float, category : Text, rating : Float, imageUrls : [Text], availableSpots : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create activities");
    };

    let newActivity : Activity = {
      id = nextActivityId;
      name;
      destinationCity;
      country;
      description;
      price;
      durationHours;
      category;
      rating;
      imageUrls;
      availableSpots;
    };

    activities.add(nextActivityId, newActivity);
    nextActivityId += 1;
    newActivity.id;
  };

  public shared ({ caller }) func updateActivity(id : Nat, name : Text, destinationCity : Text, country : Text, description : Text, price : Float, durationHours : Float, category : Text, rating : Float, imageUrls : [Text], availableSpots : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update activities");
    };

    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (_) {
        let updatedActivity : Activity = {
          id;
          name;
          destinationCity;
          country;
          description;
          price;
          durationHours;
          category;
          rating;
          imageUrls;
          availableSpots;
        };
        activities.add(id, updatedActivity);
      };
    };
  };

  public shared ({ caller }) func deleteActivity(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete activities");
    };

    switch (activities.get(id)) {
      case (null) { Runtime.trap("Activity not found") };
      case (_) {
        activities.remove(id);
      };
    };
  };

  // Admin Functions - Get All Data

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.entries().toArray();
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    var totalBookings = 0;
    var hotelBookings = 0;
    var flightBookings = 0;
    var dormBookings = 0;
    var activityBookings = 0;
    var totalRevenue = 0.0;

    for ((_, booking) in bookings.entries()) {
      totalBookings += 1;
      totalRevenue += booking.totalPrice;
      switch (booking.listingType) {
        case (#hotel) { hotelBookings += 1 };
        case (#flight) { flightBookings += 1 };
        case (#dorm) { dormBookings += 1 };
        case (#activity) { activityBookings += 1 };
      };
    };

    {
      totalBookings;
      hotelBookings;
      flightBookings;
      dormBookings;
      activityBookings;
      totalRevenue;
    };
  };

  // News Outcalls - Requires user permission

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchNews(city : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch news");
    };

    let apiKey = "[demo api key]";
    let url = "https://gnews.io/api/v4/search?q=" # city # "&apikey=" # apiKey # "&topic=travel&lang=en";
    let response = await OutCall.httpGetRequest(url, [], transform);
    ?response;
  };

  // User Profile Management

  public query ({ caller : Principal }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller) and user != caller) {
      Runtime.trap("Unauthorized: Can only access your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};

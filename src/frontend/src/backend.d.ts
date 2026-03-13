import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Trip {
    id: bigint;
    destination: string;
    tripName: string;
    endDate: bigint;
    user: Principal;
    itineraryDays: Array<ItineraryDay>;
    startDate: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Flight {
    id: bigint;
    arrivalDateTime: bigint;
    flightClass: string;
    flightNumber: string;
    destinationCity: string;
    availableSeats: bigint;
    airline: string;
    price: number;
    departureDateTime: bigint;
    originCity: string;
}
export interface Destination {
    id: bigint;
    lat: number;
    lon: number;
    timezone: string;
    country: string;
    oxygenLevel: number;
    city: string;
    altitude: bigint;
    description: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ItineraryDay {
    date: bigint;
    activities: Array<string>;
    dayNumber: bigint;
    notes: string;
}
export interface Activity {
    id: bigint;
    country: string;
    imageUrls: Array<string>;
    name: string;
    durationHours: number;
    description: string;
    destinationCity: string;
    availableSpots: bigint;
    category: string;
    rating: number;
    price: number;
}
export interface Analytics {
    dormBookings: bigint;
    hotelBookings: bigint;
    totalBookings: bigint;
    flightBookings: bigint;
    totalRevenue: number;
    activityBookings: bigint;
}
export interface Hotel {
    id: bigint;
    roomTypes: Array<string>;
    availableRooms: bigint;
    country: string;
    imageUrls: Array<string>;
    pricePerNight: number;
    name: string;
    description: string;
    amenities: Array<string>;
    rating: number;
    location: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: bigint;
    status: string;
    activityDate?: bigint;
    listingId: bigint;
    user: Principal;
    checkInDate?: bigint;
    listingType: ListingType;
    bookingDate: bigint;
    checkOutDate?: bigint;
    totalPrice: number;
    numGuestsOrSeats: bigint;
}
export interface Dorm {
    id: bigint;
    country: string;
    imageUrls: Array<string>;
    pricePerNight: number;
    name: string;
    description: string;
    amenities: Array<string>;
    rating: number;
    location: string;
    bedTypes: Array<string>;
}
export interface UserProfile {
    displayName: string;
    role: UserRole;
    email: string;
    avatarUrl: string;
}
export enum ListingType {
    hotel = "hotel",
    flight = "flight",
    dorm = "dorm",
    activity = "activity"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItineraryDay(tripId: bigint, dayNumber: bigint, date: bigint, activities: Array<string>, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivity(name: string, destinationCity: string, country: string, description: string, price: number, durationHours: number, category: string, rating: number, imageUrls: Array<string>, availableSpots: bigint): Promise<bigint>;
    createBooking(listingType: ListingType, listingId: bigint, checkInDate: bigint | null, checkOutDate: bigint | null, activityDate: bigint | null, numGuestsOrSeats: bigint, totalPrice: number): Promise<bigint>;
    createDorm(name: string, location: string, country: string, description: string, pricePerNight: number, rating: number, bedTypes: Array<string>, amenities: Array<string>, imageUrls: Array<string>): Promise<bigint>;
    createFlight(airline: string, originCity: string, destinationCity: string, departureDateTime: bigint, arrivalDateTime: bigint, price: number, flightClass: string, availableSeats: bigint, flightNumber: string): Promise<bigint>;
    createHotel(name: string, location: string, country: string, description: string, pricePerNight: number, rating: number, amenities: Array<string>, imageUrls: Array<string>, availableRooms: bigint, roomTypes: Array<string>): Promise<bigint>;
    createTrip(tripName: string, destination: string, startDate: bigint, endDate: bigint): Promise<bigint>;
    deleteActivity(id: bigint): Promise<void>;
    deleteDorm(id: bigint): Promise<void>;
    deleteFlight(id: bigint): Promise<void>;
    deleteHotel(id: bigint): Promise<void>;
    deleteTrip(tripId: bigint): Promise<void>;
    fetchNews(city: string): Promise<string | null>;
    getActivity(id: bigint): Promise<Activity | null>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllDestinations(): Promise<Array<Destination>>;
    getAllDorms(): Promise<Array<Dorm>>;
    getAllFlights(): Promise<Array<Flight>>;
    getAllHotels(): Promise<Array<Hotel>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getAnalytics(): Promise<Analytics>;
    getCallerBookings(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDestination(id: bigint): Promise<Destination | null>;
    getDorm(id: bigint): Promise<Dorm | null>;
    getFlight(id: bigint): Promise<Flight | null>;
    getHotel(id: bigint): Promise<Hotel | null>;
    getTravelerTrips(): Promise<Array<Trip>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateActivity(id: bigint, name: string, destinationCity: string, country: string, description: string, price: number, durationHours: number, category: string, rating: number, imageUrls: Array<string>, availableSpots: bigint): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: string): Promise<void>;
    updateDorm(id: bigint, name: string, location: string, country: string, description: string, pricePerNight: number, rating: number, bedTypes: Array<string>, amenities: Array<string>, imageUrls: Array<string>): Promise<void>;
    updateFlight(id: bigint, airline: string, originCity: string, destinationCity: string, departureDateTime: bigint, arrivalDateTime: bigint, price: number, flightClass: string, availableSeats: bigint, flightNumber: string): Promise<void>;
    updateHotel(id: bigint, name: string, location: string, country: string, description: string, pricePerNight: number, rating: number, amenities: Array<string>, imageUrls: Array<string>, availableRooms: bigint, roomTypes: Array<string>): Promise<void>;
    updateTrip(tripId: bigint, tripName: string, destination: string, startDate: bigint, endDate: bigint): Promise<void>;
}

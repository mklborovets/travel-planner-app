# Travel Planner & Places Explorer

A modern mobile application for trip planning, saving favorite locations, and building tourist itineraries, built with **React Native CLI**, **TypeScript**, and **Feature-Sliced Design (FSD)** architecture.

---

## Key Features

### 1. Interactive Map and Street Routing
- **Custom Categories & Markers:** 12 categorized place types with native bitmap caching (`tracksViewChanges` auto-disabled after 150ms for smooth map panning and zooming).
- **Street Routing (OSRM API):** Automatic route geometry generation along actual streets with in-memory segment caching and seamless offline fallback to straight lines.
- **3-State Route Polyline:**
  - **Completed Segment (`completed`):** Solid emerald line connecting visited stops.
  - **Active Next Stop (`active_next`):** Accent dashed amber line pointing to the nearest upcoming stop.
  - **Remaining Route (`upcoming`):** Subtle blue dashed line for the rest of the planned itinerary.
- **Controls & POI Handling:** Map zoom buttons, compass button to reset north orientation (`heading: 0`), location centering, and tap-to-add support for arbitrary coordinates or points of interest (POI) with reverse geocoding.
- **Viewport Culling:** Intelligent marker virtualization based on visible map bounds for optimal performance when rendering large collections of places.

### 2. Places Collection and Filtering
- **Place Categories:** Coffee, Restaurants, Museums, Parks, Sightseeing, Hotels, Shopping, Nature, Entertainment, Bars, Transport, and Others.
- **Offline Persistence:** Places, trips, and application settings are persisted locally via Zustand with `@react-native-async-storage/async-storage`.
- **Search & Sorting:** Debounced search query matching titles, addresses, and notes; sorting by distance, alphabetical name (A-Z), or date added.
- **Dynamic Distance Anchor:** Haversine distance calculations relative to current GPS or a custom city anchor (Lviv, Kyiv, Warsaw, Rome, Paris, or custom search).
- **Pull-to-Refresh:** Instant GPS and distance refresh via swipe down.

### 3. Spatial Search (Nominatim OpenStreetMap)
- **4 Search Modes:**
  1. **Worldwide:** Global queries without bounding constraints.
  2. **By Country:** Search restricted by 2-letter ISO country codes (UA, PL, IT, FR, DE, etc.).
  3. **City + Radius:** Bounded rectangular `viewbox` and exact radial distance (2, 5, 10, 25 km) around a city center.
  4. **Near Me:** Proximity search within radius from current location or active distance anchor.
- **Query Optimization:** 450ms debounce delay (`useDebounce`) and 5-minute request caching via **TanStack React Query v5**.
- **Result Actions:** Instant save to collection ("Save Place") or save with direct itinerary insertion ("Save + Add to Trip").

### 4. Multi-Trip Itinerary Planner
- **Multiple Trips Management:** Create, switch, and delete independent itineraries.
- **Progress Tracking:** Check-off visited locations with automatic progress percentage and progress bar updates.
- **Drag & Drop Reordering (60 FPS Native Driver):** Native spring animations on gesture drag handle (`GripVertical`) with smooth neighboring card shifts without intermediate store mutations.
- **Smart Route Builder:** Optimize stop order using a greedy nearest-neighbor algorithm starting from your current location or a selected stop without backtracking.
- **Clipboard Import/Export:** Formatted text export with Google Maps links and safe JSON payload parser for importing shared travel routes.

### 5. Add Place Form & Smart Input
- **Bidirectional Coordinate & Address Resolution:** Entering an address auto-fills coordinates via geocoding; entering or picking coordinates auto-resolves street address and category via reverse geocoding.
- **Smart Coordinate Pasting:** Automatically parses coordinate pairs like `49.84166, 24.03533` pasted into either coordinate field.
- **In-Memory Draft with 20-min TTL:** Form fields are preserved when switching tabs and safely cleared upon save or reset.

---

## Architecture (Feature-Sliced Design)

The codebase strictly adheres to **Feature-Sliced Design (FSD)** principles and the **"Zero Logic in UI"** rule: presentation components focus entirely on layout and view rendering, while business logic, store access, mathematical formulas, and asynchronous side-effects reside within dedicated hooks.

```text
src/
├── app/                        # Application bootstrap, providers, root navigation
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # NativeStack Navigator (MainTabs, PlaceDetails, AddPlace)
│   │   └── BottomTabNavigator.tsx  # BottomTab Navigator (Places, Map, Search, Trip)
│   └── App.tsx
│
├── screens/                    # Application screens (pure UI composition and feature hook invocation)
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── SearchScreen.tsx
│   ├── PlaceDetailsScreen.tsx
│   ├── AddPlaceScreen.tsx
│   └── TripScreen.tsx
│
├── widgets/                    # Composite self-contained UI blocks and modal sheets
│   ├── category-picker-modal/  # 12-category selection modal
│   ├── home-filter-modal/      # Filter and distance anchor selection modal
│   ├── map-place-preview/      # Bottom preview card for selected map marker
│   ├── map-tapped-point-card/  # Tapped coordinate card with Quick Save option
│   ├── route-builder-modal/    # Smart Route Builder modal
│   ├── search-filter-modal/    # Spatial search settings modal
│   ├── search-result-card/     # OpenStreetMap search result card
│   ├── trip-item-card/         # Itinerary stop row with drag-and-drop handle
│   └── trip-selector-modal/    # Modal for switching, creating, and importing trips
│
├── features/                   # Screen-level business scenarios and custom hooks
│   ├── add-place/              # Form hook (useAddPlaceForm), Zod schema, draft store
│   ├── filter-places/          # Filter, sort, and distance calculation hook (useFilteredPlaces)
│   ├── map-explorer/           # Camera control, marker tracking, and OSRM hook (useMapExplorer)
│   ├── place-details/          # Place details, sharing, and clipboard hook (usePlaceDetails)
│   ├── search-places/          # TanStack Query search hook (usePlacesSearch)
│   └── trip-planner/           # Multi-trip and drag coordinator hook (useTripPlanner)
│
├── entities/                   # Business entities, types, and Zustand stores
│   ├── place/                  # types.ts, placesStore.ts, placesApi.ts, PlaceCard, PlaceMarker
│   ├── trip/                   # types.ts, tripStore.ts, TripProgressBar
│   └── settings/               # types.ts, settingsStore.ts
│
└── shared/                     # Reusable infrastructure, utilities, configurations, and atomic UI
    ├── api/                    # apiClient (Axios), queryClient (TanStack Query)
    ├── config/                 # categories.ts, mapStyles.ts, searchOptions.ts
    ├── lib/                    # location.ts, share.ts, useCurrentLocation.ts, useDebounce.ts, etc.
    ├── storage/                # zustandStorage (AsyncStorage adapter)
    ├── types/                  # navigation.ts (type-safe navigation routes)
    └── ui/                     # CategoryChip, EmptyState, SearchInput, BottomSheetModal
```

---

## Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | React Native 0.76.7, React 18.3.1, TypeScript 5.0.4 |
| **Styling** | NativeWind 2.0 (Tailwind CSS 3.3), StyleSheet |
| **Client State** | Zustand 5.0 + Persist Middleware (`@react-native-async-storage/async-storage`) |
| **Server State** | TanStack React Query 5.62 + Axios 1.7 |
| **Navigation** | React Navigation 6 (Native Stack, Bottom Tabs), React Native Screens 4, Safe Area Context |
| **Mapping & Location** | React Native Maps 1.18, React Native Geolocation Service 5.3, React Native Permissions 5.2 |
| **Animations & Forms** | React Native Reanimated 3.16, Animated API (Native Driver), React Hook Form 7.54, Zod 3.24 |
| **Icons** | Lucide React Native 0.469, React Native SVG 15.9 |

---

## Getting Started

### Prerequisites
- **Node.js** (`>= 18`)
- **JDK 17** (for Android)
- **Xcode** & **CocoaPods** (for iOS on macOS)
- Configured Android SDK or iOS Simulator

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mklborovets/travel-planner-app.git
cd travel-planner-app
npm install
```

### 2. Install CocoaPods (iOS)
```bash
cd ios
pod install
cd ..
```

### 3. Start Metro Bundler
```bash
npm start
```

### 4. Run Application
```bash
# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## Code Quality & Verification

The project includes strict static analysis and testing scripts:

```bash
# TypeScript type check
npm run typecheck

# ESLint inspection
npm run lint

# Run unit tests
npm test
```

---

## Permissions & Native Configuration

- **iOS (`Info.plist`):** `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription` configured for device location access.
- **Android (`AndroidManifest.xml`):** Permissions configured for `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `INTERNET`, and Google Maps API metadata.
- **Android Lifecycle (`MainActivity.kt`):** `super.onCreate(null)` configured for crash-free screen recreation in `react-native-screens`.

---

## License

This project is developed for educational and demonstration purposes under the [MIT](LICENSE) License.

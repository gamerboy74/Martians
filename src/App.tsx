import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AdminLayout from "./components/layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Registrations from "./pages/Registrations";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import FeaturedGames from "./pages/FeaturedGames";
import AllMatches from "./pages/pastTournamentsCard";
import TournamentView from "./pages/TournamentView";
import TournamentResults from "./pages/TournamentResults";
import Schedule from "./pages/viewScheduleCard";
import ResultsManagement from "./pages/ResultsManagement";
import Notifications from "./components/Notifications";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import TournamentRegistration from "./components/TournamentSection";
import MatchesSection from "./components/MatchesSection";
import LeaderboardSection from "./components/Leaderboard";
import Footer from "./components/Footer";
import BGMIRegistration from "./components/Registeration/BGMIRegistration"; // Updated import path
import PastMatches from "./pages/PastMatches";
import { useSettingsStore } from "./stores/settingsStore";

function MaintenanceMode() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
        <div className="relative text-center px-4">
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-purple-500 animate-spin-slow"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Under Maintenance
          </h1>
          <p className="text-xl text-purple-400 mb-8">
            We're currently updating our systems to serve you better.
          </p>
          <p className="text-gray-400">Please check back later.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

function App() {
  const { maintenanceMode } = useSettingsStore();

  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Notifications />
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                maintenanceMode ? (
                  <MaintenanceMode />
                ) : (
                  <>
                    <Navbar />
                    <main>
                      <HomeSection />
                      <TournamentRegistration />
                      <MatchesSection />
                      <LeaderboardSection />
                    </main>
                    <Footer />
                  </>
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/bgmi-registration" element={<BGMIRegistration />} />
            <Route path="/all-matches" element={<AllMatches />} />
            <Route path="/tournament/:id" element={<TournamentView />} />
            <Route
              path="/tournament/:id/results"
              element={<TournamentResults />}
            />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/past-matches" element={<PastMatches />} />

            {/* Admin routes - all wrapped in ProtectedRoute */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tournaments" element={<Tournaments />} />
              <Route path="tournaments/:id" element={<TournamentDetails />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="matches" element={<Matches />} />
              <Route path="teams" element={<Teams />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="results" element={<ResultsManagement />} />
              <Route path="featured-games" element={<FeaturedGames />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

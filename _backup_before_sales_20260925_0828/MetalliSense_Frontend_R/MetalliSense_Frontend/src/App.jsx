import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { OPCProvider } from "./context/OPCContext";
import { GradeProvider } from "./context/GradeContext";
import { MeltFlowProvider } from "./context/MeltFlowContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import AnomalyDetection from "./pages/AnomalyDetection";
import Recommendation from "./pages/Recommendation";
import RLOptimizer from "./pages/RLOptimizer";
import AIAgent from "./pages/AIAgent";
import GradeSpecs from "./pages/GradeSpecs";
import SyntheticData from "./pages/SyntheticData";
import Spectrometer from "./pages/Spectrometer";
import TrainingData from "./pages/TrainingData";
import SemanticSearch from "./pages/SemanticSearch";
import CostAnalysis from "./pages/CostAnalysis";
import FullAnalysis from "./pages/FullAnalysis";
import RawMaterialStock from "./pages/RawMaterialStock";
import YardInspection from "./pages/YardInspection";
import PreMeltGate from "./pages/PreMeltGate";
import SupplierScorecard from "./pages/SupplierScorecard";
import EnergyDashboard from "./pages/EnergyDashboard";
import InventoryForecast from "./pages/InventoryForecast";
import MechanicalProperties from "./pages/MechanicalProperties";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <OPCProvider>
          <MeltFlowProvider>
      <GradeProvider>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="anomaly" element={<AnomalyDetection />} />
                  <Route path="recommendation" element={<Recommendation />} />
                  <Route path="rl-optimizer" element={<RLOptimizer />} />
                  <Route path="agent" element={<AIAgent />} />
                  <Route path="grades" element={<GradeSpecs />} />
                  <Route path="synthetic" element={<SyntheticData />} />
                  <Route path="spectrometer" element={<Spectrometer />} />
                  <Route path="training-data" element={<TrainingData />} />
                  <Route path="semantic-search" element={<SemanticSearch />} />
                  <Route path="cost-analysis" element={<CostAnalysis />} />
                  <Route path="full-analysis" element={<FullAnalysis />} />
                  <Route path="mechanical-properties" element={<MechanicalProperties />} />
                  <Route path="raw-material-stock" element={<RawMaterialStock />} />
                  <Route path="yard-inspection" element={<YardInspection />} />
                  <Route path="premelt-gate" element={<PreMeltGate />} />
                  <Route path="supplier-scorecard" element={<SupplierScorecard />} />
                  <Route path="energy" element={<EnergyDashboard />} />
                  <Route path="inventory-forecast" element={<InventoryForecast />} />
                </Route>
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#fff",
                    color: "#0f172a",
                    border: "1px solid #e2e8f0",
                  },
                  success: {
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </GradeProvider>
      </MeltFlowProvider>
        </OPCProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

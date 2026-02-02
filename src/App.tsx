import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Auth pages
import LoginPage from "@/pages/auth/Login"

// Dashboard
import Dashboard from "@/pages/dashboard/Dashboard"

// Products
import Products from "@/pages/products/Products"
import AddProduct from "@/pages/products/AddProduct"

// Brands
import Brands from "@/pages/brands/Brands"
import AddBrand from "@/pages/brands/AddBrand"

// Phone Models
import PhoneModels from "@/pages/phone-models/PhoneModels"
import AddPhoneModel from "@/pages/phone-models/AddPhoneModel"

// Categories
import Categories from "@/pages/categories/Categories"
import AddCategory from "@/pages/categories/AddCategory"

// Analytics
import Analytics from "@/pages/analytics/Analytics"

// Settings
import Settings from "@/pages/settings/Settings"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Products */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/add"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          {/* Brands */}
          <Route
            path="/brands"
            element={
              <ProtectedRoute>
                <Brands />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brands/add"
            element={
              <ProtectedRoute>
                <AddBrand />
              </ProtectedRoute>
            }
          />

          {/* Phone Models */}
          <Route
            path="/phone-models"
            element={
              <ProtectedRoute>
                <PhoneModels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phone-models/add"
            element={
              <ProtectedRoute>
                <AddPhoneModel />
              </ProtectedRoute>
            }
          />

          {/* Categories */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/add"
            element={
              <ProtectedRoute>
                <AddCategory />
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

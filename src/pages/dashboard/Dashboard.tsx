import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, MousePointerClick, TrendingUp, Package } from "lucide-react"
import { apiGet } from "@/utils/api"
import { PRODUCTS } from "@/utils/constants"

interface Product {
  _id: string
  name: string
  price: number
  isActive: boolean
  featured: boolean
  clickCount: number
  phoneBrand: { _id: string; name: string; logo?: string } | string
  phoneModel: { _id: string; name: string } | string
  createdAt: string
}

interface Stats {
  totalProducts: number
  totalClicks: number
  activeProducts: number
  featuredProducts: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalClicks: 0,
    activeProducts: 0,
    featuredProducts: 0,
  })
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Product[] }>(`${PRODUCTS}?limit=100`)
      if (response.success) {
        const products = response.data

        setStats({
          totalProducts: products.length,
          totalClicks: products.reduce((sum, p) => sum + (p.clickCount || 0), 0),
          activeProducts: products.filter((p) => p.isActive).length,
          featuredProducts: products.filter((p) => p.featured).length,
        })

        // Top 5 products by click count
        const sorted = [...products].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
        setTopProducts(sorted.slice(0, 5))

        // Recent 5 products by creation date
        const recent = [...products].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecentProducts(recent.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Phone covers listed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">Amazon redirects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : stats.activeProducts}</div>
              <p className="text-xs text-muted-foreground">Currently visible</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : stats.featuredProducts}</div>
              <p className="text-xs text-muted-foreground">Featured products</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : topProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No products yet. Add your first product to see analytics.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium text-muted-foreground w-5">{index + 1}.</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{typeof product.phoneBrand === 'object' ? product.phoneBrand.name : product.phoneBrand} {typeof product.phoneModel === 'object' ? product.phoneModel.name : product.phoneModel}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium ml-2">{product.clickCount || 0} clicks</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently Added</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : recentProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{typeof product.phoneBrand === 'object' ? product.phoneBrand.name : product.phoneBrand} {typeof product.phoneModel === 'object' ? product.phoneModel.name : product.phoneModel}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm text-muted-foreground">
                          ₹{product.price}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { useStore } from "@/store/useStore"
import { apiGet, apiDelete } from "@/utils/api"
import { PRODUCTS, getProductPath } from "@/utils/constants"

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  category: { _id: string; name: string } | string
  phoneBrand: { _id: string; name: string; logo?: string } | string
  phoneModel: { _id: string; name: string } | string
  amazonLink: string
  isActive: boolean
  featured: boolean
  clickCount: number
  images: string[]
}

export default function Products() {
  const { doc, loading, setDoc, setLoading, resetApiJson } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    resetApiJson() // Clear form data when coming to list page
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{ success: boolean; data: Product[] }>(`${PRODUCTS}?limit=100`)
      if (response.success) {
        setDoc(response.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await apiDelete<{ success: boolean }>(getProductPath(id))
      if (response.success) {
        setDoc(doc.filter((p: Product) => p._id !== id))
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleEdit = (product: Product) => {
    navigate(`/products/add?id=${product._id}`)
  }

  const products = doc as Product[]

  return (
    <AdminLayout title="Products" breadcrumbs={[{ label: "Products" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <Link to="/products/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link to="/products/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">
                        ₹{product.discountPrice || product.price}
                        {product.discountPrice && (
                          <span className="text-muted-foreground line-through ml-2">
                            ₹{product.price}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span>{typeof product.phoneBrand === 'object' ? product.phoneBrand.name : product.phoneBrand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span>{typeof product.phoneModel === 'object' ? product.phoneModel.name : product.phoneModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{typeof product.category === 'object' ? product.category.name : product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clicks:</span>
                      <span>{product.clickCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <a
                      href={product.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline mt-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Amazon
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

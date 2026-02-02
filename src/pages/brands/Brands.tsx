import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { apiGet, apiDelete } from "@/utils/api"
import { BRANDS, getBrandPath } from "@/utils/constants"

interface Brand {
  _id: string
  name: string
  logo: string
  isActive: boolean
}

export default function Brands() {
  const { doc, loading, setDoc, setLoading } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{ success: boolean; data: Brand[] }>(BRANDS)
      if (response.success) {
        setDoc(response.data)
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    try {
      const response = await apiDelete<{ success: boolean }>(getBrandPath(id))
      if (response.success) {
        setDoc(doc.filter((b: Brand) => b._id !== id))
      }
    } catch (error) {
      console.error("Error deleting brand:", error)
    }
  }

  const brands = doc as Brand[]

  return (
    <AdminLayout title="Brands" breadcrumbs={[{ label: "Brands" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Brands</h1>
          <Button onClick={() => navigate("/brands/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : brands.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No brands found</p>
              <Button onClick={() => navigate("/brands/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Brand
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brands.map((brand) => (
              <Card key={brand._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{brand.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/brands/add?id=${brand._id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(brand._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No logo
                      </div>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        brand.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
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

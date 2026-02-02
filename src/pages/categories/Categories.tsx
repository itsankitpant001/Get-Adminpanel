import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { apiGet, apiDelete } from "@/utils/api"
import { CATEGORIES, getCategoryPath } from "@/utils/constants"

interface Category {
  _id: string
  name: string
  description: string
  isActive: boolean
}

export default function Categories() {
  const { doc, loading, setDoc, setLoading } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{ success: boolean; data: Category[] }>(CATEGORIES)
      if (response.success) {
        setDoc(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await apiDelete<{ success: boolean }>(getCategoryPath(id))
      if (response.success) {
        setDoc(doc.filter((c: Category) => c._id !== id))
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const categories = doc as Category[]

  return (
    <AdminLayout title="Categories" breadcrumbs={[{ label: "Categories" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => navigate("/categories/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No categories found</p>
              <Button onClick={() => navigate("/categories/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Card key={category._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/categories/add?id=${category._id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      category.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { apiGet, apiPost, apiPut } from "@/utils/api"
import { CATEGORIES, getCategoryPath } from "@/utils/constants"

interface CategoryResponse {
  success: boolean
  data: {
    _id: string
    name: string
    description: string
    isActive: boolean
  }
}

export default function AddCategory() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get("id")
  const isEditMode = !!categoryId

  const navigate = useNavigate()
  const { apiJson, updateApiJson, setApiJson, loading, setLoading, error, setError, resetApiJson } = useStore()

  useEffect(() => {
    if (isEditMode) {
      fetchCategory()
    } else {
      setApiJson({
        name: "",
        description: "",
        isActive: true,
      })
    }

    return () => {
      resetApiJson()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    setLoading(true)
    try {
      const response = await apiGet<CategoryResponse>(getCategoryPath(categoryId!))
      if (response.success) {
        const category = response.data
        setApiJson({
          name: category.name,
          description: category.description || "",
          isActive: category.isActive,
        })
      }
    } catch (err) {
      console.error("Error fetching category:", err)
      setError("Failed to load category")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    updateApiJson(name, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const categoryData = {
        name: apiJson.name,
        description: apiJson.description,
        isActive: apiJson.isActive,
      }

      let response
      if (isEditMode) {
        response = await apiPut<{ success: boolean; message?: string }>(getCategoryPath(categoryId!), categoryData)
      } else {
        response = await apiPost<{ success: boolean; message?: string }>(CATEGORIES, categoryData)
      }

      if (response.success) {
        navigate("/categories")
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? "update" : "create"} category`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading && !apiJson.name) {
    return (
      <AdminLayout title="Edit Category">
        <p>Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isEditMode ? "Edit Category" : "Add Category"}
      breadcrumbs={[
        { label: "Categories", href: "/categories" },
        { label: isEditMode ? "Edit" : "Add New" },
      ]}
    >
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={apiJson.name || ""}
                  onChange={handleChange}
                  placeholder="Clear, Rugged, Slim..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={apiJson.description || ""}
                  onChange={handleChange}
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={apiJson.isActive ?? true}
                    onChange={handleChange}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                      ? "Save Changes"
                      : "Create Category"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/categories")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

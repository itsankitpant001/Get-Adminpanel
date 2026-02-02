import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { useStore } from "@/store/useStore"
import { apiGet, apiPost, apiPut } from "@/utils/api"
import { BRANDS, getBrandPath } from "@/utils/constants"

interface BrandResponse {
  success: boolean
  data: {
    _id: string
    name: string
    logo: string
    isActive: boolean
  }
}

export default function AddBrand() {
  const [searchParams] = useSearchParams()
  const brandId = searchParams.get("id")
  const isEditMode = !!brandId

  const navigate = useNavigate()
  const { apiJson, updateApiJson, setApiJson, loading, setLoading, error, setError, resetApiJson } = useStore()

  useEffect(() => {
    if (isEditMode) {
      fetchBrand()
    } else {
      setApiJson({
        name: "",
        logo: [],
        isActive: true,
      })
    }

    return () => {
      resetApiJson()
    }
  }, [brandId])

  const fetchBrand = async () => {
    setLoading(true)
    try {
      const response = await apiGet<BrandResponse>(getBrandPath(brandId!))
      if (response.success) {
        const brand = response.data
        setApiJson({
          name: brand.name,
          logo: brand.logo ? [brand.logo] : [],
          isActive: brand.isActive,
        })
      }
    } catch (err) {
      console.error("Error fetching brand:", err)
      setError("Failed to load brand")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    updateApiJson(name, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const brandData = {
        name: apiJson.name,
        logo: Array.isArray(apiJson.logo) && apiJson.logo.length > 0 ? apiJson.logo[0] : "",
        isActive: apiJson.isActive,
      }

      let response
      if (isEditMode) {
        response = await apiPut<{ success: boolean; message?: string }>(getBrandPath(brandId!), brandData)
      } else {
        response = await apiPost<{ success: boolean; message?: string }>(BRANDS, brandData)
      }

      if (response.success) {
        navigate("/brands")
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? "update" : "create"} brand`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading && !apiJson.name) {
    return (
      <AdminLayout title="Edit Brand">
        <p>Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isEditMode ? "Edit Brand" : "Add Brand"}
      breadcrumbs={[
        { label: "Brands", href: "/brands" },
        { label: isEditMode ? "Edit" : "Add New" },
      ]}
    >
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Brand" : "Add New Brand"}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Brand Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={apiJson.name || ""}
                  onChange={handleChange}
                  placeholder="Apple, Samsung, OnePlus..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Logo (SVG/Image)</Label>
                <FileUpload
                  fieldName="logo"
                  multiple={false}
                  accept="image/*,.svg"
                  placeholder="Drop brand logo here or Browse"
                  description="SVG or PNG recommended"
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
                      : "Create Brand"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/brands")}>
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

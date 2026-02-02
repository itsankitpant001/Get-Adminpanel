import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchSelect } from "@/components/ui/search-select"
import { FileUpload } from "@/components/FileUpload"
import { useStore } from "@/store/useStore"
import { apiGet, apiPost, apiPut } from "@/utils/api"
import { BRANDS, PHONE_MODELS, getPhoneModelPath } from "@/utils/constants"

interface Brand {
  _id: string
  name: string
  logo: string
  isActive: boolean
}

interface PhoneModelResponse {
  success: boolean
  data: {
    _id: string
    name: string
    brand: string | { _id: string; name: string; logo?: string }
    image: string
    isActive: boolean
  }
}

export default function AddPhoneModel() {
  const [searchParams] = useSearchParams()
  const phoneModelId = searchParams.get("id")
  const isEditMode = !!phoneModelId

  const navigate = useNavigate()
  const {
    apiJson,
    updateApiJson,
    setApiJson,
    loading,
    setLoading,
    error,
    setError,
    resetApiJson,
  } = useStore()
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetchBrands()
    if (isEditMode) {
      fetchPhoneModel()
    } else {
      resetApiJson() // Clear form for new entry
      setApiJson({
        name: "",
        brand: "", // Expecting brand _id
        image: [],
        isActive: true,
      })
    }

    return () => {
      resetApiJson()
    }
  }, [phoneModelId])

  const fetchBrands = async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Brand[] }>(
        BRANDS
      )
      if (response.success) {
        setBrands(response.data)
      }
    } catch (err) {
      console.error("Error fetching brands:", err)
      setError("Failed to load brands")
    }
  }

  const fetchPhoneModel = async () => {
    setLoading(true)
    try {
      const response = await apiGet<PhoneModelResponse>(
        getPhoneModelPath(phoneModelId!)
      )
      if (response.success) {
        const phoneModel = response.data
        const brandId = typeof phoneModel.brand === 'object' ? phoneModel.brand._id : phoneModel.brand
        setApiJson({
          name: phoneModel.name,
          brand: brandId,
          image: phoneModel.image ? [phoneModel.image] : [],
          isActive: phoneModel.isActive,
        })
      }
    } catch (err) {
      console.error("Error fetching phone model:", err)
      setError("Failed to load phone model")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    updateApiJson(name, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const phoneModelData = {
        name: apiJson.name,
        brand: apiJson.brand,
        image: Array.isArray(apiJson.image) && apiJson.image.length > 0 ? apiJson.image[0] : "",
        isActive: apiJson.isActive,
      }

      let response
      if (isEditMode) {
        response = await apiPut<{ success: boolean; message?: string }>(
          getPhoneModelPath(phoneModelId!),
          phoneModelData
        )
      } else {
        response = await apiPost<{ success: boolean; message?: string }>(
          PHONE_MODELS,
          phoneModelData
        )
      }

      if (response.success) {
        navigate("/phone-models")
      } else {
        throw new Error(
          response.message ||
            `Failed to ${isEditMode ? "update" : "create"} phone model`
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading && !apiJson.name) {
    return (
      <AdminLayout title="Edit Phone Model">
        <p>Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isEditMode ? "Edit Phone Model" : "Add Phone Model"}
      breadcrumbs={[
        { label: "Phone Models", href: "/phone-models" },
        { label: isEditMode ? "Edit" : "Add New" },
      ]}
    >
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Phone Model" : "Add New Phone Model"}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Phone Model Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={apiJson.name || ""}
                  onChange={handleChange}
                  placeholder="iPhone 15 Pro, Galaxy S24, Pixel 8"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Brand *</Label>
                <SearchSelect
                  options={brands.map((brand) => ({
                    value: brand._id,
                    label: brand.name,
                    icon: brand.logo || undefined,
                  }))}
                  value={apiJson.brand || ""}
                  onValueChange={(value) => updateApiJson("brand", value)}
                  placeholder="Select a brand"
                  searchPlaceholder="Search brands..."
                  emptyText="No brands found."
                />
              </div>

              <div className="space-y-2">
                <Label>Model Image (SVG/Image)</Label>
                <FileUpload
                  fieldName="image"
                  multiple={false}
                  accept="image/*,.svg"
                  placeholder="Drop phone model image here or Browse"
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
                      : "Create Phone Model"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/phone-models")}
                >
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

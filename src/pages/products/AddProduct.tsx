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
import { BRANDS, PRODUCTS, getProductPath, getPhoneModelsByBrand, PHONE_MODELS, CATEGORIES } from "@/utils/constants"

interface ProductResponse {
  success: boolean
  data: {
    _id: string
    name: string
    description: string
    price: number
    discountPrice?: number
    category: string | { _id: string; name: string }
    phoneBrand: string | { _id: string; name: string; logo?: string }
    phoneModel: string | { _id: string; name: string }
    amazonLink: string
    images: string[]
    isActive: boolean
    featured: boolean
  }
}

interface Brand {
  _id: string
  name: string
  logo: string
  isActive: boolean
}

interface PhoneModel {
  _id: string
  name: string
  brand: string
  image: string
  isActive: boolean
}

interface Category {
  _id: string
  name: string
  description: string
  isActive: boolean
}

export default function AddProduct() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get("id")
  const isEditMode = !!productId

  const navigate = useNavigate()
  const { apiJson, updateApiJson, setApiJson, loading, setLoading, error, setError, resetApiJson } = useStore()
  const [brands, setBrands] = useState<Brand[]>([])
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch all active brands and categories on component mount
  useEffect(() => {
    fetchBrands()
    fetchCategories()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Brand[] }>(BRANDS)
      if (response.success) {
        setBrands(response.data.filter((b) => b.isActive))
      }
    } catch (err) {
      console.error("Error fetching brands:", err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Category[] }>(CATEGORIES)
      if (response.success) {
        setCategories(response.data.filter((c) => c.isActive))
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  // Effect to fetch phone models when brand changes
  useEffect(() => {
    const selectedBrandId = apiJson.phoneBrand;
    if (selectedBrandId) {
      const fetchFilteredPhoneModels = async () => {
        try {
          // Find brand by _id to get its name for the API query
          const selectedBrand = brands.find(b => b._id === selectedBrandId);
          if (selectedBrand) {
            const response = await apiGet<{ success: boolean; data: PhoneModel[] }>(
              getPhoneModelsByBrand(selectedBrand.name)
            );
            if (response.success) {
              setPhoneModels(response.data.filter(pm => pm.isActive));
              // If in edit mode and a phoneModel was set from product, ensure it's still valid
              if (!(isEditMode && apiJson.phoneModel && response.data.some(pm => pm._id === apiJson.phoneModel))) {
                  updateApiJson("phoneModel", "");
              }
            }
          }
        } catch (err) {
          console.error("Error fetching phone models for brand:", err);
          setPhoneModels([]);
          updateApiJson("phoneModel", "");
        }
      };
      fetchFilteredPhoneModels();
    } else {
      setPhoneModels([]);
      updateApiJson("phoneModel", "");
    }
  }, [apiJson.phoneBrand, brands, isEditMode]);

  // Fetch product data for edit mode or reset for add mode
  useEffect(() => {
    if (isEditMode) {
      fetchProduct()
    } else {
      // Set default values for new product
      setApiJson({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        phoneBrand: "",
        phoneModel: "",
        amazonLink: "",
        images: [],
        isActive: true,
        featured: false,
      })
    }

    return () => {
      resetApiJson()
    }
  }, [productId])


  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await apiGet<ProductResponse>(getProductPath(productId!))
      if (response.success) {
        const product = response.data
        // phoneBrand/phoneModel/category may be populated objects or plain strings
        const brandId = typeof product.phoneBrand === 'object' ? product.phoneBrand._id : product.phoneBrand
        const modelId = typeof product.phoneModel === 'object' ? product.phoneModel._id : product.phoneModel
        const categoryId = typeof product.category === 'object' ? product.category._id : product.category
        setApiJson({
          name: product.name,
          description: product.description,
          price: String(product.price),
          discountPrice: product.discountPrice ? String(product.discountPrice) : "",
          category: categoryId,
          phoneBrand: brandId,
          phoneModel: modelId,
          amazonLink: product.amazonLink,
          images: product.images || [],
          isActive: product.isActive,
          featured: product.featured,
        })
      }
    } catch (err) {
      console.error("Error fetching product:", err)
      setError("Failed to load product")
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
      const productData = {
        name: apiJson.name,
        description: apiJson.description,
        price: Number(apiJson.price),
        discountPrice: apiJson.discountPrice ? Number(apiJson.discountPrice) : undefined,
        category: apiJson.category,
        phoneBrand: apiJson.phoneBrand,
        phoneModel: apiJson.phoneModel,
        amazonLink: apiJson.amazonLink,
        images: apiJson.images || [],
        isActive: apiJson.isActive,
        featured: apiJson.featured,
      }

      let response
      if (isEditMode) {
        response = await apiPut<{ success: boolean; message?: string }>(getProductPath(productId!), productData)
      } else {
        response = await apiPost<{ success: boolean; message?: string }>(PRODUCTS, productData)
      }

      if (response.success) {
        navigate("/products")
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? "update" : "create"} product`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading && !apiJson.name) {
    return (
      <AdminLayout title="Edit Product">
        <p>Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isEditMode ? "Edit Product" : "Add Product"}
      breadcrumbs={[
        { label: "Products", href: "/products" },
        { label: isEditMode ? "Edit" : "Add New" },
      ]}
    >
      <div>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={apiJson.name || ""}
                  onChange={handleChange}
                  placeholder="iPhone 15 Pro Clear Case"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={apiJson.description || ""}
                  onChange={handleChange}
                  placeholder="Product description..."
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={apiJson.price || ""}
                    onChange={handleChange}
                    placeholder="499"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    value={apiJson.discountPrice || ""}
                    onChange={handleChange}
                    placeholder="399"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Brand *</Label>
                  <SearchSelect
                    options={brands.map((brand) => ({
                      value: brand._id,
                      label: brand.name,
                      icon: brand.logo || undefined,
                    }))}
                    value={apiJson.phoneBrand || ""}
                    onValueChange={(value) => updateApiJson("phoneBrand", value)}
                    placeholder="Select a brand"
                    searchPlaceholder="Search brands..."
                    emptyText="No brands found."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Model *</Label>
                  <SearchSelect
                    options={phoneModels.map((pm) => ({
                      value: pm._id,
                      label: pm.name,
                      icon: pm.image || undefined,
                    }))}
                    value={apiJson.phoneModel || ""}
                    onValueChange={(value) => updateApiJson("phoneModel", value)}
                    placeholder={apiJson.phoneBrand ? "Select a model" : "Select brand first"}
                    searchPlaceholder="Search models..."
                    emptyText="No models found."
                    disabled={!apiJson.phoneBrand}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <SearchSelect
                  options={categories.map((cat) => ({
                    value: cat._id,
                    label: cat.name,
                  }))}
                  value={apiJson.category || ""}
                  onValueChange={(value) => updateApiJson("category", value)}
                  placeholder="Select a category"
                  searchPlaceholder="Search categories..."
                  emptyText="No categories found."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazonLink">Amazon Link *</Label>
                <Input
                  id="amazonLink"
                  name="amazonLink"
                  value={apiJson.amazonLink || ""}
                  onChange={handleChange}
                  placeholder="https://amazon.in/dp/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <FileUpload
                  fieldName="images"
                  multiple={true}
                  accept="image/*"
                  placeholder="Drop product images here or Browse"
                  description="Upload multiple product images (Max 10MB each)"
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={apiJson.featured ?? false}
                    onChange={handleChange}
                  />
                  <span className="text-sm">Featured</span>
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
                      : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/products")}>
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

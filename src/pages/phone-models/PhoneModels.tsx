import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { apiGet, apiDelete } from "@/utils/api"
import { PHONE_MODELS, getPhoneModelPath } from "@/utils/constants"

interface PhoneModel {
  _id: string
  name: string
  brand: {
    _id: string
    name: string
  }
  image: string
  isActive: boolean
}

export default function PhoneModels() {
  const { doc, loading, setDoc, setLoading } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPhoneModels()
  }, [])

  const fetchPhoneModels = async () => {
    setLoading(true)
    try {
      const response = await apiGet<{ success: boolean; data: PhoneModel[] }>(PHONE_MODELS)
      if (response.success) {
        setDoc(response.data)
      }
    } catch (error) {
      console.error("Error fetching phone models:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this phone model?")) return

    try {
      const response = await apiDelete<{ success: boolean }>(getPhoneModelPath(id))
      if (response.success) {
        setDoc(doc.filter((pm: PhoneModel) => pm._id !== id))
      }
    } catch (error) {
      console.error("Error deleting phone model:", error)
    }
  }

  const phoneModels = doc as PhoneModel[]

  return (
    <AdminLayout title="Phone Models" breadcrumbs={[{ label: "Phone Models" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Phone Models</h1>
          <Button onClick={() => navigate("/phone-models/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Phone Model
          </Button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : phoneModels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No phone models found</p>
              <Button onClick={() => navigate("/phone-models/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Phone Model
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {phoneModels.map((phoneModel) => (
              <Card key={phoneModel._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{phoneModel.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/phone-models/add?id=${phoneModel._id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(phoneModel._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {phoneModel.image ? (
                      <img
                        src={phoneModel.image}
                        alt={phoneModel.name}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Brand: {phoneModel.brand?.name || "N/A"}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          phoneModel.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {phoneModel.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
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

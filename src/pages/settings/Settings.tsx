import { AdminLayout } from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export default function Settings() {
  const { user } = useAuth()

  return (
    <AdminLayout title="Settings" breadcrumbs={[{ label: "Settings" }]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name || "Admin"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{user?.role || "admin"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About GetGrip Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This admin panel allows you to manage phone cover products.</p>
            <p>Products are linked to Amazon for purchases - when users click "Buy Now", they are redirected to Amazon.</p>
            <p>You can track clicks and see which products are performing best in the Analytics section.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

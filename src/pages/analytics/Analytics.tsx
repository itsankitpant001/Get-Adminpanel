import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStoredAuth } from "@/hooks/useStoredAuth"
import { Smartphone, MousePointerClick, TrendingUp, Package, Users, Eye, Globe, ChevronDown, ChevronUp } from "lucide-react"
import { apiGet } from "@/utils/api"
import { PRODUCTS_ADMIN_STATS, VISITORS_STATS, getVisitorByIpPath } from "@/utils/constants"
import { useVisitorPagination, createPaginationStore } from "@/store/usePaginationStore"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

// Separate store for detail pagination
const useDetailPagination = createPaginationStore(10)

interface Stats {
  totalProducts: number
  activeProducts: number
  featuredProducts: number
  totalClicks: number
  topProducts: { name: string; clickCount: number; amazonLink: string }[]
}

interface UniqueVisitor {
  ip: string
  totalVisits: number
  lastVisit: string
  firstVisit: string
  lastPage: string
  lastUserAgent: string
}

interface VisitorStats {
  totalVisits: number
  uniqueVisitors: number
  todayVisits: number
  visitsPerDay: { _id: string; count: number }[]
  recentVisitors: UniqueVisitor[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface VisitorDetail {
  ip: string
  totalVisits: number
  firstVisit: string
  lastVisit: string
  visits: {
    _id: string
    page: string
    referrer: string
    userAgent: string
    createdAt: string
  }[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIp, setSelectedIp] = useState<string | null>(null)
  const [visitorDetail, setVisitorDetail] = useState<VisitorDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { getToken } = useStoredAuth()

  // Outer pagination (unique visitors list)
  const {
    page: outerPage,
    limit: outerLimit,
    totalPages: outerTotalPages,
    setPage: setOuterPage,
    setTotalItems: setOuterTotalItems,
    reset: resetOuterPagination,
  } = useVisitorPagination()

  // Inner pagination (visit history detail)
  const {
    page: detailPage,
    limit: detailLimit,
    totalPages: detailTotalPages,
    setPage: setDetailPage,
    setTotalItems: setDetailTotalItems,
    reset: resetDetailPagination,
  } = useDetailPagination()

  useEffect(() => {
    fetchStats()
    return () => {
      resetOuterPagination()
      resetDetailPagination()
    }
  }, [])

  useEffect(() => {
    fetchVisitorStats()
  }, [outerPage])

  // Re-fetch detail when detail page changes
  useEffect(() => {
    if (selectedIp) {
      fetchVisitorDetailPage(selectedIp, detailPage)
    }
  }, [detailPage])

  const fetchStats = async () => {
    try {
      const data = await apiGet<{ success: boolean; data: Stats }>(PRODUCTS_ADMIN_STATS)
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVisitorStats = useCallback(async () => {
    try {
      const data = await apiGet<{ success: boolean; data: VisitorStats }>(
        `${VISITORS_STATS}?page=${outerPage}&limit=${outerLimit}`
      )
      if (data.success) {
        setVisitorStats(data.data)
        if (data.data.pagination) {
          setOuterTotalItems(data.data.pagination.total)
        }
      }
    } catch (error) {
      console.error("Error fetching visitor stats:", error)
    }
  }, [outerPage, outerLimit, setOuterTotalItems])

  const fetchVisitorDetailPage = async (ip: string, page: number) => {
    setDetailLoading(true)
    try {
      const data = await apiGet<{ success: boolean; data: VisitorDetail }>(
        `${getVisitorByIpPath(ip)}?page=${page}&limit=${detailLimit}`
      )
      if (data.success) {
        setVisitorDetail(data.data)
        if (data.data.pagination) {
          setDetailTotalItems(data.data.pagination.total)
        }
      }
    } catch (error) {
      console.error("Error fetching visitor detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleIpClick = (ip: string) => {
    if (selectedIp === ip) {
      setSelectedIp(null)
      setVisitorDetail(null)
      resetDetailPagination()
      return
    }
    setSelectedIp(ip)
    resetDetailPagination()
    fetchVisitorDetailPage(ip, 1)
  }

  const handleOuterPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > outerTotalPages) return
    setSelectedIp(null)
    setVisitorDetail(null)
    resetDetailPagination()
    setOuterPage(newPage)
  }

  const handleDetailPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > detailTotalPages) return
    setDetailPage(newPage)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateUA = (ua: string) => {
    if (ua.length <= 60) return ua
    return ua.substring(0, 60) + "..."
  }

  const getPageNumbers = (currentPage: number, total: number) => {
    const pages: (number | "ellipsis")[] = []
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("ellipsis")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < total - 2) pages.push("ellipsis")
      pages.push(total)
    }
    return pages
  }

  const renderPagination = (
    currentPage: number,
    totalPagesCount: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPagesCount <= 1) return null
    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers(currentPage, totalPagesCount).map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={currentPage === p}
                    onClick={() => onPageChange(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className={currentPage >= totalPagesCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  return (
    <AdminLayout title="Analytics" breadcrumbs={[{ label: "Analytics" }]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Product Stats */}
            {stats && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalClicks}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeProducts}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Featured</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.featuredProducts}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Products by Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.topProducts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No click data yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {stats.topProducts.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b pb-2 last:border-0"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <a
                                href={product.amazonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View on Amazon
                              </a>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{product.clickCount}</p>
                              <p className="text-xs text-muted-foreground">clicks</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Visitor Stats */}
            {visitorStats && (
              <>
                <h2 className="text-2xl font-bold mt-8">Site Visitors</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{visitorStats.totalVisits}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{visitorStats.uniqueVisitors}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today&apos;s Visits</CardTitle>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{visitorStats.todayVisits}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visits Per Day */}
                {visitorStats.visitsPerDay.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Visits Per Day (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {visitorStats.visitsPerDay.map((day) => (
                          <div
                            key={day._id}
                            className="flex items-center justify-between border-b pb-2 last:border-0"
                          >
                            <p className="text-sm font-medium">{day._id}</p>
                            <p className="font-bold">{day.count}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Unique Visitors List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Unique Visitors</CardTitle>
                    {visitorStats.pagination && (
                      <p className="text-sm text-muted-foreground">
                        Page {outerPage} of {outerTotalPages || 1} ({visitorStats.pagination.total} visitors)
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {visitorStats.recentVisitors.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No visitors yet.</p>
                    ) : (
                      <div className="space-y-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 py-2 border-b text-sm font-medium text-muted-foreground">
                          <div className="col-span-3">IP Address</div>
                          <div className="col-span-2 text-center">Visits</div>
                          <div className="col-span-3">Last Page</div>
                          <div className="col-span-3">Last Visit</div>
                          <div className="col-span-1"></div>
                        </div>

                        {visitorStats.recentVisitors.map((visitor) => (
                          <div key={visitor.ip}>
                            {/* Visitor Row */}
                            <div
                              className={`grid grid-cols-12 gap-2 py-3 border-b last:border-0 items-center cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedIp === visitor.ip ? "bg-muted/50" : ""
                              }`}
                              onClick={() => handleIpClick(visitor.ip)}
                            >
                              <div className="col-span-3">
                                <span className="font-mono text-xs text-primary hover:underline font-medium">
                                  {visitor.ip || "\u2014"}
                                </span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                  {visitor.totalVisits}
                                </span>
                              </div>
                              <div className="col-span-3 text-sm truncate">{visitor.lastPage}</div>
                              <div className="col-span-3 text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(visitor.lastVisit)}
                              </div>
                              <div className="col-span-1 flex justify-end">
                                {selectedIp === visitor.ip ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            {/* Expanded Detail */}
                            {selectedIp === visitor.ip && (
                              <div className="border-b bg-muted/30 px-4 py-4">
                                {detailLoading ? (
                                  <p className="text-sm text-muted-foreground">Loading visitor details...</p>
                                ) : visitorDetail ? (
                                  <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">IP: </span>
                                        <span className="font-mono font-medium">{visitorDetail.ip}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Total Visits: </span>
                                        <span className="font-bold">{visitorDetail.totalVisits}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">First Seen: </span>
                                        <span>{formatDate(visitorDetail.firstVisit)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Last Seen: </span>
                                        <span>{formatDate(visitorDetail.lastVisit)}</span>
                                      </div>
                                    </div>

                                    {/* Visit History Table */}
                                    <div className="overflow-x-auto">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-muted-foreground">
                                          Showing {visitorDetail.visits.length} of {visitorDetail.totalVisits} visits
                                          {detailTotalPages > 1 && ` (Page ${detailPage} of ${detailTotalPages})`}
                                        </p>
                                      </div>
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-b">
                                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">#</th>
                                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Referrer</th>
                                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">User Agent</th>
                                            <th className="text-left py-2 font-medium text-muted-foreground">Time</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {visitorDetail.visits.map((visit, idx) => (
                                            <tr key={visit._id} className="border-b last:border-0">
                                              <td className="py-2 pr-4 text-muted-foreground">
                                                {(detailPage - 1) * detailLimit + idx + 1}
                                              </td>
                                              <td className="py-2 pr-4">{visit.page}</td>
                                              <td className="py-2 pr-4 text-xs">{visit.referrer || "\u2014"}</td>
                                              <td className="py-2 pr-4 text-xs text-muted-foreground" title={visit.userAgent}>
                                                {truncateUA(visit.userAgent)}
                                              </td>
                                              <td className="py-2 text-xs whitespace-nowrap">{formatDate(visit.createdAt)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Detail Pagination */}
                                    {renderPagination(detailPage, detailTotalPages, handleDetailPageChange)}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Failed to load details.</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Outer Pagination */}
                    {renderPagination(outerPage, outerTotalPages, handleOuterPageChange)}
                  </CardContent>
                </Card>
              </>
            )}

            {!stats && !visitorStats && (
              <p className="text-muted-foreground">Failed to load analytics.</p>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

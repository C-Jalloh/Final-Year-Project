"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Pill,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  Calendar,
  Loader2,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MedicationsSkeleton } from "@/components/ui/skeleton-loader"
import { useToast } from "@/hooks/use-toast"
import { apiHelpers } from "@/lib/api-client"
import { MedicationForm, Medication } from "@/components/medications/medication-form"
import { MedicationDetails } from "@/components/medications/medication-details"
import { MedicationCategories } from "@/components/medications/medication-categories"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock medication data - will be replaced with API data
const mockMedications = [
  {
    id: "1",
    name: "Lisinopril",
    genericName: "Lisinopril",
    dosage: "10mg",
    form: "Tablet",
    category: "ACE Inhibitor",
    stock: 150,
    minStock: 20,
    price: 15.99,
    manufacturer: "Generic Labs",
    expiryDate: "2025-06-15",
    status: "in-stock"
  },
  {
    id: "2",
    name: "Metformin",
    genericName: "Metformin HCl",
    dosage: "500mg",
    form: "Tablet",
    category: "Antidiabetic",
    stock: 8,
    minStock: 15,
    price: 12.50,
    manufacturer: "PharmaCorp",
    expiryDate: "2025-08-22",
    status: "low-stock"
  },
  {
    id: "3",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    dosage: "500mg",
    form: "Capsule",
    category: "Antibiotic",
    stock: 75,
    minStock: 10,
    price: 8.99,
    manufacturer: "MediPharm",
    expiryDate: "2025-03-10",
    status: "in-stock"
  },
  {
    id: "4",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    dosage: "200mg",
    form: "Tablet",
    category: "NSAID",
    stock: 0,
    minStock: 25,
    price: 5.99,
    manufacturer: "PainRelief Inc",
    expiryDate: "2025-12-01",
    status: "out-of-stock"
  },
]

const getStatusBadge = (status: string, stock: number, minStock: number) => {
  if (stock === 0) return "destructive"
  if (stock <= minStock) return "secondary"
  return "default"
}

const getStatusText = (status: string, stock: number, minStock: number) => {
  if (stock === 0) return "Out of Stock"
  if (stock <= minStock) return "Low Stock"
  return "In Stock"
}

export default function MedicationsPage() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null)
  const [deleting, setDeleting] = useState(false)

  const medicationsArray = Array.isArray(medications) ? medications : []
  console.log('Medications state:', medications)
  console.log('Medications array:', medicationsArray)

  const filteredMedications = medicationsArray.filter(medication => {
    if (searchTerm && !medication?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !medication?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (categoryFilter !== "all" && medication?.category !== categoryFilter) return false
    return true
  })

  console.log('Filtered medications:', filteredMedications)

  const lowStockMedications = medicationsArray.filter(med => med?.stock <= med?.min_stock && med?.stock > 0)
  const outOfStockMedications = medicationsArray.filter(med => med?.stock === 0)
  const totalValue = medicationsArray.reduce((sum, med) => sum + ((med?.stock || 0) * (med?.price || 0)), 0)

  // Load medications on component mount
  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading medications...')
      const response = await apiHelpers.getMedications()
      console.log('API Response:', response)

      // Ensure we have an array
      let medicationsData = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          medicationsData = response.data
        } else if (response.data.results) {
          // Handle paginated response
          medicationsData = response.data.results
        } else if (typeof response.data === 'object') {
          // Handle single object response
          medicationsData = [response.data]
        }
      }

      console.log('Setting medications data:', medicationsData)
      setMedications(medicationsData)
    } catch (error: any) {
      console.error('Error loading medications:', error)
      setError(error.response?.data?.message || 'Failed to load medications')

      // Fallback to properly formatted mock data
      const fallbackData: Medication[] = mockMedications.map(med => ({
        id: med.id,
        name: med.name,
        generic_name: med.genericName,
        dosage: med.dosage,
        form: med.form,
        category: med.category,
        stock: med.stock,
        min_stock: med.minStock,
        price: med.price,
        manufacturer: med.manufacturer,
        expiry_date: med.expiryDate,
        description: "",
        side_effects: "",
        instructions: ""
      }))

      console.log('Using fallback data:', fallbackData)
      setMedications(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMedication = () => {
    setEditingMedication(null)
    setShowForm(true)
  }

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleViewDetails = (medication: Medication) => {
    setSelectedMedication(medication)
    setShowDetails(true)
  }

  const handleDeleteMedication = (medication: Medication) => {
    setMedicationToDelete(medication)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!medicationToDelete?.id) return

    try {
      setDeleting(true)
      await apiHelpers.deleteMedication(medicationToDelete.id)
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      })
      loadMedications() // Reload the list
    } catch (error: any) {
      console.error('Error deleting medication:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete medication",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setMedicationToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    loadMedications() // Reload the list after create/update
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
            <p className="text-muted-foreground">
              Manage medication inventory and prescriptions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadMedications} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateMedication}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medicationsArray.length}</div>
              <p className="text-xs text-muted-foreground">
                Active in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockMedications.length}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockMedications.length}</div>
              <p className="text-xs text-muted-foreground">
                Unavailable items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total stock value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Medications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Inventory</CardTitle>
            <CardDescription>View and manage medication stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ACE Inhibitor">ACE Inhibitor</SelectItem>
                  <SelectItem value="Antidiabetic">Antidiabetic</SelectItem>
                  <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="NSAID">NSAID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <MedicationsSkeleton />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{medication?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{medication?.generic_name || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{medication?.dosage || 'N/A'}</div>
                            <div className="text-muted-foreground">{medication?.form || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>{medication?.category || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{medication?.stock || 0} units</div>
                            <div className="text-muted-foreground">Min: {medication?.min_stock || 0}</div>
                          </div>
                        </TableCell>
                        <TableCell>${(medication?.price || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {medication?.expiry_date ? new Date(medication.expiry_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge("", medication?.stock || 0, medication?.min_stock || 0)}>
                            {getStatusText("", medication?.stock || 0, medication?.min_stock || 0)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(medication)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditMedication(medication)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteMedication(medication)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && filteredMedications.length === 0 && (
              <div className="text-center py-8">
                <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No medications found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medication Form Dialog */}
      <MedicationForm
        medication={editingMedication}
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleFormSuccess}
      />

      {/* Medication Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medication Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected medication
            </DialogDescription>
          </DialogHeader>
          {selectedMedication && <MedicationDetails medication={selectedMedication} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{medicationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

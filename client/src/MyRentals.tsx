import { useState, useEffect } from 'react'
import './MyRentals.css'
import PickupInstructions from './PickupInstructions'

interface User {
  id: number
  full_name: string
  email: string
}

interface Reservation {
  id: number
  user_id: number
  car_id: number
  start_datetime: string
  end_datetime: string
  status: string
  daily_rate_cents: number
  created_at: string
  make: string
  model: string
  year: number
  color: string
  transmission: string
  image_url: string
}

interface MyRentalsProps {
  currentUser: User | null
}

const api = {
  async getUserReservations(userId: number): Promise<Reservation[]> {
    const response = await fetch(`http://localhost:3001/api/reservations/user/${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch reservations: ${response.statusText}`)
    }
    return response.json()
  },

  async updateReservation(reservationId: number, startDate: string, endDate: string): Promise<void> {
    const response = await fetch(`http://localhost:3001/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_datetime: startDate,
        end_datetime: endDate,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update reservation')
    }
  },

  async cancelReservation(reservationId: number): Promise<void> {
    const response = await fetch(`http://localhost:3001/api/reservations/${reservationId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to cancel reservation')
    }
  },
}

function MyRentals({ currentUser }: MyRentalsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    start_datetime: '',
    end_datetime: '',
  })
  const [showPickupInstructions, setShowPickupInstructions] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    if (currentUser) {
      loadReservations()
    }
  }, [currentUser])

  const loadReservations = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      setError(null)
      const data = await api.getUserReservations(currentUser.id)
      setReservations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reservation: Reservation) => {
    setEditingId(reservation.id)
    setEditForm({
      start_datetime: reservation.start_datetime,
      end_datetime: reservation.end_datetime,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ start_datetime: '', end_datetime: '' })
  }

  const handleSaveEdit = async (reservationId: number) => {
    try {
      await api.updateReservation(reservationId, editForm.start_datetime, editForm.end_datetime)
      await loadReservations()
      setEditingId(null)
      setEditForm({ start_datetime: '', end_datetime: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reservation')
    }
  }

  const handleCancel = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    try {
      await api.cancelReservation(reservationId)
      await loadReservations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation')
    }
  }

  const handleViewPickupInstructions = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowPickupInstructions(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = (reservation: Reservation) => {
    const days = calculateDays(reservation.start_datetime, reservation.end_datetime)
    return (reservation.daily_rate_cents * days) / 100
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'status-badge status-confirmed'
      case 'pending':
        return 'status-badge status-pending'
      case 'cancelled':
        return 'status-badge status-cancelled'
      case 'completed':
        return 'status-badge status-completed'
      default:
        return 'status-badge'
    }
  }

  const isActive = (endDate: string) => {
    return new Date(endDate) > new Date()
  }

  const upcomingReservations = reservations.filter(
    (r) => r.status !== 'cancelled' && isActive(r.end_datetime)
  )
  const pastReservations = reservations.filter(
    (r) => r.status === 'cancelled' || !isActive(r.end_datetime)
  )

  if (!currentUser) {
    return (
      <div className="my-rentals">
        <div className="no-user">
          <h2>Please log in to view your rentals</h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="my-rentals">
        <div className="loading">Loading your rentals...</div>
      </div>
    )
  }

  return (
    <div className="my-rentals">
      <div className="my-rentals-header">
        <h1>My Rentals</h1>
        <p>Welcome back, {currentUser.full_name}!</p>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Upcoming/Active Rentals */}
      <section className="rentals-section">
        <h2>Upcoming & Active Rentals</h2>
        {upcomingReservations.length === 0 ? (
          <div className="no-rentals">
            <p>You have no upcoming rentals.</p>
          </div>
        ) : (
          <div className="rentals-list">
            {upcomingReservations.map((reservation) => (
              <div key={reservation.id} className="rental-card">
                <div className="rental-image">
                  <img
                    src={
                      reservation.image_url
                        ? `http://localhost:3001${reservation.image_url}`
                        : 'https://placehold.co/400x300/png?text=No+Image'
                    }
                    alt={`${reservation.make} ${reservation.model}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x300/png?text=No+Image'
                    }}
                  />
                </div>
                <div className="rental-content">
                  <div className="rental-header-row">
                    <h3>
                      {reservation.make} {reservation.model} ({reservation.year})
                    </h3>
                    <span className={getStatusBadgeClass(reservation.status)}>
                      {reservation.status}
                    </span>
                  </div>

                  <div className="rental-details">
                    <div className="detail-row">
                      <strong>Color:</strong> {reservation.color}
                    </div>
                    <div className="detail-row">
                      <strong>Transmission:</strong> {reservation.transmission}
                    </div>

                    {editingId === reservation.id ? (
                      <div className="edit-form">
                        <div className="form-group">
                          <label>Start Date & Time:</label>
                          <input
                            type="datetime-local"
                            value={editForm.start_datetime}
                            onChange={(e) =>
                              setEditForm({ ...editForm, start_datetime: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>End Date & Time:</label>
                          <input
                            type="datetime-local"
                            value={editForm.end_datetime}
                            onChange={(e) =>
                              setEditForm({ ...editForm, end_datetime: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="detail-row">
                          <strong>Pick-up:</strong> {formatDate(reservation.start_datetime)}
                        </div>
                        <div className="detail-row">
                          <strong>Return:</strong> {formatDate(reservation.end_datetime)}
                        </div>
                      </>
                    )}

                    <div className="detail-row">
                      <strong>Duration:</strong>{' '}
                      {calculateDays(reservation.start_datetime, reservation.end_datetime)} days
                    </div>
                    <div className="detail-row rental-price">
                      <strong>Total Cost:</strong> ${calculateTotal(reservation).toFixed(2)}
                    </div>
                  </div>

                  <div className="rental-actions">
                    {editingId === reservation.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(reservation.id)}
                          className="btn-primary"
                        >
                          Save Changes
                        </button>
                        <button onClick={handleCancelEdit} className="btn-secondary">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {reservation.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleViewPickupInstructions(reservation)}
                              className="btn-pickup"
                            >
                              View Pickup Instructions
                            </button>
                            <button
                              onClick={() => handleEdit(reservation)}
                              className="btn-secondary"
                            >
                              Edit Dates
                            </button>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="btn-cancel"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rental History */}
      <section className="rentals-section">
        <h2>Rental History</h2>
        {pastReservations.length === 0 ? (
          <div className="no-rentals">
            <p>No rental history yet.</p>
          </div>
        ) : (
          <div className="rentals-list">
            {pastReservations.map((reservation) => (
              <div key={reservation.id} className="rental-card rental-card-past">
                <div className="rental-image">
                  <img
                    src={
                      reservation.image_url
                        ? `http://localhost:3001${reservation.image_url}`
                        : 'https://placehold.co/400x300/png?text=No+Image'
                    }
                    alt={`${reservation.make} ${reservation.model}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x300/png?text=No+Image'
                    }}
                  />
                </div>
                <div className="rental-content">
                  <div className="rental-header-row">
                    <h3>
                      {reservation.make} {reservation.model} ({reservation.year})
                    </h3>
                    <span className={getStatusBadgeClass(reservation.status)}>
                      {reservation.status}
                    </span>
                  </div>

                  <div className="rental-details">
                    <div className="detail-row">
                      <strong>Color:</strong> {reservation.color}
                    </div>
                    <div className="detail-row">
                      <strong>Pick-up:</strong> {formatDate(reservation.start_datetime)}
                    </div>
                    <div className="detail-row">
                      <strong>Return:</strong> {formatDate(reservation.end_datetime)}
                    </div>
                    <div className="detail-row">
                      <strong>Duration:</strong>{' '}
                      {calculateDays(reservation.start_datetime, reservation.end_datetime)} days
                    </div>
                    <div className="detail-row rental-price">
                      <strong>Total Cost:</strong> ${calculateTotal(reservation).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showPickupInstructions && selectedReservation && (
        <PickupInstructions
          reservation={{
            id: selectedReservation.id,
            start_datetime: selectedReservation.start_datetime,
            end_datetime: selectedReservation.end_datetime,
            make: selectedReservation.make,
            model: selectedReservation.model,
            year: selectedReservation.year,
          }}
          onClose={() => {
            setShowPickupInstructions(false)
            setSelectedReservation(null)
          }}
        />
      )}
    </div>
  )
}

export default MyRentals


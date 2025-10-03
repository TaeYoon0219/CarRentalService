import { useState, useEffect } from 'react'
import './App.css'
// import '../assets'

// Types based on the backend API
interface Car {
  id: number
  vin: string
  make: string
  model: string
  year: number
  transmission: string
  seats: number
  doors: number
  color: string
  daily_rate_cents: number
  status: string
}

interface User {
  id: number
  full_name: string
  email: string
}

interface NewUser {
  full_name: string
  email: string
  password_hash: string
}

interface NewReservation {
  user_id: number
  car_id: number
  start_datetime: string
  end_datetime: string
}



// API configuration
const API_BASE_URL = 'http://localhost:3001'

// API functions
const api = {
  async getCars(): Promise<Car[]> {
    const response = await fetch(`${API_BASE_URL}/api/cars`)
    if (!response.ok) throw new Error('Failed to fetch cars')
    return response.json()
  },

  async createUser(user: NewUser): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  },

  async createReservation(reservation: NewReservation): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation)
    })
    if (!response.ok) throw new Error('Failed to create reservation')
    return response.json()
  }
}

function App() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [showReservationForm, setShowReservationForm] = useState(false)

  // Form states
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    password_hash: ''
  })

  const [reservationForm, setReservationForm] = useState({
    start_datetime: '',
    end_datetime: ''
  })

  // Load cars on component mount
  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      setLoading(true)
      const carsData = await api.getCars()
      setCars(carsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cars')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await api.createUser(userForm)
      setCurrentUser(user)
      setShowUserForm(false)
      setUserForm({ full_name: '', email: '', password_hash: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedCar) return

    try {
      await api.createReservation({
        user_id: currentUser.id,
        car_id: selectedCar.id,
        start_datetime: reservationForm.start_datetime,
        end_datetime: reservationForm.end_datetime
      })
      alert('Reservation created successfully!')
      setShowReservationForm(false)
      setSelectedCar(null)
      setReservationForm({ start_datetime: '', end_datetime: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation')
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (loading) {
    return <div className="app"><div className="loading">Loading cars...</div></div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Car Rental Service Halo</h1>
        {currentUser ? (
          <div className="user-info">
            Welcome, {currentUser.full_name}!
            <button onClick={() => setCurrentUser(null)} className="btn-secondary">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => setShowUserForm(true)} className="btn-primary">
            Login / Sign Up
          </button>
        )}
      </header>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showUserForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Account</h2>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Full Name"
                value={userForm.full_name}
                onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={userForm.password_hash}
                onChange={(e) => setUserForm({...userForm, password_hash: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Create Account</button>
                <button type="button" onClick={() => setShowUserForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReservationForm && selectedCar && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reserve {selectedCar.make} {selectedCar.model}</h2>
            <p>Daily Rate: {formatPrice(selectedCar.daily_rate_cents)}</p>
            <form onSubmit={handleCreateReservation}>
              <input
                type="datetime-local"
                placeholder="Start Date & Time"
                value={reservationForm.start_datetime}
                onChange={(e) => setReservationForm({...reservationForm, start_datetime: e.target.value})}
                required
              />
              <input
                type="datetime-local"
                placeholder="End Date & Time"
                value={reservationForm.end_datetime}
                onChange={(e) => setReservationForm({...reservationForm, end_datetime: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Create Reservation</button>
                <button type="button" onClick={() => setShowReservationForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="main">
        <div className="cars-header">
          <h2>Available Cars</h2>
          <button onClick={loadCars} className="btn-secondary">
            Refresh
          </button>
        </div>

        {cars.length === 0 ? (
          <div className="no-cars">
            No cars available. The database might be empty.
          </div>
        ) : (
          <div className="cars-grid">
            {cars.filter(car => car.status === 'available').map(car => (
              <div key={car.id} className="car-card">
                <div className="car-header">
                  <h3>{car.make} {car.model}</h3>
                  <span className="car-year">{car.year}</span>
                </div>
                <div className="car-details">
                  <p><strong>Color:</strong> {car.color || 'Not specified'}</p>
                  <p><strong>Transmission:</strong> {car.transmission}</p>
                  <p><strong>Seats:</strong> {car.seats}</p>
                  <p><strong>Doors:</strong> {car.doors}</p>
                  <div className="car-price">
                    <strong>{formatPrice(car.daily_rate_cents)}/day</strong>
                  </div>
                </div>
                <div className="car-actions">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        setSelectedCar(car)
                        setShowReservationForm(true)
                      }}
                      className="btn-primary"
                    >
                      Reserve Now
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowUserForm(true)}
                      className="btn-secondary"
                    >
                      Login to Reserve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import './App.css'
import MyRentals from './MyRentals'
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
  image_url: string  
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

interface UserLogin {
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

  /*async createUser(user: NewUser): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  }, */
  async loginUser(credentials: UserLogin): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  
    if (!response.ok) {
      let msg = `Failed to login (HTTP ${response.status})`;
      try {
        const data = await response.json();
        if (typeof data?.detail === 'string') msg = data.detail;
        else if (Array.isArray(data?.detail)) msg = data.detail.map((d: any) => d.msg || d.loc?.join('.') ).join('; ');
        else msg = JSON.stringify(data);
      } catch {}
      throw new Error(msg);
    }
    return response.json();
  },

  async createUser(user: NewUser): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: user.full_name,
        email: user.email,
        password_hash: user.password_hash,
      }),
    });
  
    if (!response.ok) {
      let msg = `Failed to create user (HTTP ${response.status})`;
      try {
        const data = await response.json();
        if (typeof data?.detail === 'string') msg = data.detail;
        else if (Array.isArray(data?.detail)) msg = data.detail.map((d: any) => d.msg || d.loc?.join('.') ).join('; ');
        else msg = JSON.stringify(data);
      } catch {}
      throw new Error(msg);
    }
    return response.json();
  },
  

  /*async createReservation(reservation: NewReservation): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation)
    })
    if (!response.ok) throw new Error('Failed to create reservation')
    return response.json()
  }*/
  async createReservation(reservation: NewReservation): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation)
    })
    if (!response.ok) {
      let msg = `Failed to create reservation (HTTP ${response.status})`
      try {
        const data = await response.json()
        if (typeof data?.detail === 'string') msg = data.detail
        else if (Array.isArray(data?.detail)) msg = data.detail.map((d: any) => d.msg || d.loc?.join('.')).join('; ')
        else msg = JSON.stringify(data)
      } catch {}
      throw new Error(msg)
    }
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
  const [currentPage, setCurrentPage] = useState<'home' | 'rentals'>('home')
  const [isSignUpMode, setIsSignUpMode] = useState(false)

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await api.loginUser({
        email: userForm.email,
        password_hash: userForm.password_hash
      })
      setCurrentUser(user)
      setShowUserForm(false)
      setUserForm({ full_name: '', email: '', password_hash: '' })
      setIsSignUpMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await api.createUser(userForm)
      setCurrentUser(user)
      setShowUserForm(false)
      setUserForm({ full_name: '', email: '', password_hash: '' })
      setIsSignUpMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  /*const handleCreateReservation = async (e: React.FormEvent) => {
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
  }*/

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedCar) return
    
    // helper: ensure ISO-ish string for FastAPI (YYYY-MM-DDTHH:MM:SS)
    const toIsoForApi = (s: string) => {
      // If it's a datetime-local like "2025-10-03T13:10", append seconds.
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`
      // If it's a locale string like "10/03/2025, 01:10 PM", parse then format.
      const d = new Date(s)
      const pad = (n: number) => String(n).padStart(2, '0')
      const y = d.getFullYear()
      const m = pad(d.getMonth() + 1)
      const day = pad(d.getDate())
      const hh = pad(d.getHours())
      const mm = pad(d.getMinutes())
      const ss = pad(d.getSeconds())
      return `${y}-${m}-${day}T${hh}:${mm}:${ss}`
    }
    
    const startISO = toIsoForApi(reservationForm.start_datetime)
    const endISO   = toIsoForApi(reservationForm.end_datetime)
    
    // client-side check: end must be after start
    if (new Date(endISO) <= new Date(startISO)) {
      setError('End date/time must be after start date/time.')
      return
    }
    
    try {
      await api.createReservation({
        user_id: currentUser.id,
        car_id: selectedCar.id,
        start_datetime: startISO,
        end_datetime: endISO
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
        <div className="header-left">
          <h1>Halo Car Rental</h1>
          <nav className="main-nav">
            <button 
              onClick={() => setCurrentPage('home')} 
              className={currentPage === 'home' ? 'nav-btn nav-btn-active' : 'nav-btn'}
            >
              Browse Cars
            </button>
            {currentUser && (
              <button 
                onClick={() => setCurrentPage('rentals')} 
                className={currentPage === 'rentals' ? 'nav-btn nav-btn-active' : 'nav-btn'}
              >
                My Rentals
              </button>
            )}
          </nav>
        </div>
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
        <h2>{isSignUpMode ? 'Create Account' : 'Login'}</h2>

        <form onSubmit={isSignUpMode ? handleCreateUser : handleLogin}>
          {isSignUpMode && (
            <input
              type="text"
              placeholder="Full Name"
              value={userForm.full_name}
              onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={userForm.password_hash}
            onChange={(e) => setUserForm({ ...userForm, password_hash: e.target.value })}
            required
          />

          <div className="modal-buttons">
            <button type="submit" className="btn-primary">
              {isSignUpMode ? 'Create Account' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setShowUserForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3182ce', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {isSignUpMode 
              ? 'Already have an account? Login' 
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )}


      {showReservationForm && selectedCar && (
        <div className="modal">
          <div className="modal-content">
            <h2>Reserve {selectedCar.make} {selectedCar.model}</h2>
            <p>Daily Rate: {formatPrice(selectedCar.daily_rate_cents)}</p>
            <form onSubmit={handleCreateReservation}>
              <label htmlFor="start_dt" className="field-label">Start Date & Time</label>
                <input
                  id="start_dt"
                  type="datetime-local"
                  placeholder="Start Date & Time"
                  value={reservationForm.start_datetime}
                  onChange={(e) =>
                    setReservationForm({ ...reservationForm, start_datetime: e.target.value })
                  }
                required
              />

              <label htmlFor="end_dt" className="field-label">End Date & Time</label>
                <input
                  id="end_dt"
                    type="datetime-local"
                    placeholder="End Date & Time"
                    value={reservationForm.end_datetime}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, end_datetime: e.target.value })
                    }
                required
              />

            <div className="modal-buttons">
              <button type="submit" className="btn-primary">Create Reservation</button>
              <button
                type="button"
                onClick={() => setShowReservationForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

    <main className="main">
      {currentPage === 'home' ? (
        <div className="content-layout">
          <div className="cars-section">
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
              <div className="cars-list">
                {cars.filter(car => car.status === 'available').map(car => (
                  <div key={car.id} className="car-card">
                    <div className="car-image">
                      <img 
                        src={car.image_url ? `http://localhost:3001${car.image_url}` : '/placeholder-car.jpg'}
                        alt={`${car.make} ${car.model}`}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x300/png?text=No+Image'
                        }}
                      />
                    </div>
                  
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
          </div>

          <div className="map-section">
            <h2>Rental Locations</h2>
            <div className="map-container">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-76.1180%2C43.1080%2C-76.0980%2C43.1280&marker=43.1180%2C-76.1080"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                title="Rental Location Map"
              />
            </div>
            <div className="location-info">
              <h3>📍 Syracuse Hancock International Airport</h3>
            </div>
          </div>
        </div>
      ) : (
        <MyRentals currentUser={currentUser} />
      )}
      </main>
    </div>
  )
}

export default App

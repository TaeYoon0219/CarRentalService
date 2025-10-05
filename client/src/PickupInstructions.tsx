import './PickupInstructions.css'

interface PickupInstructionsProps {
  reservation: {
    id: number
    start_datetime: string
    end_datetime: string
    make: string
    model: string
    year: number
  }
  onClose: () => void
}

function PickupInstructions({ reservation, onClose }: PickupInstructionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="pickup-modal">
      <div className="pickup-content">
        <div className="pickup-header">
          <h2>Pickup Instructions</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="pickup-body">
          <div className="confirmation-badge">
            <div className="check-icon">✓</div>
            <h3>Reservation Confirmed!</h3>
            <p>Confirmation #{reservation.id}</p>
          </div>

          <div className="vehicle-info">
            <h4>Your Vehicle</h4>
            <p className="vehicle-name">
              {reservation.make} {reservation.model} ({reservation.year})
            </p>
          </div>

          <div className="instruction-section">
            <div className="instruction-card">
              <div className="instruction-icon"></div>
              <div className="instruction-details">
                <h4>Where to Pick Up</h4>
                <p className="location-name">Syracuse Hancock International Airport</p>
                <p className="address">1000 Col. Eileen Collins Blvd</p>
                <p className="address">Syracuse, NY 13212</p>
                <p className="directions">
                  <strong>Directions:</strong> Follow signs to "Rental Car Center" 
                  after baggage claim. Our counter is located in the main rental car facility.
                </p>
              </div>
            </div>

            <div className="instruction-card">
              <div className="instruction-icon"></div>
              <div className="instruction-details">
                <h4>When to Pick Up</h4>
                <p className="pickup-time">{formatDate(reservation.start_datetime)}</p>
                <p className="note">
                  Please arrive 15 minutes before your pickup time to complete the paperwork.
                </p>
                <p className="hours">
                  <strong>Operating Hours:</strong><br />
                  Monday - Sunday: 6:00 AM - 11:00 PM
                </p>
              </div>
            </div>

            <div className="instruction-card">
              <div className="instruction-icon"></div>
              <div className="instruction-details">
                <h4>What to Bring</h4>
                <ul className="requirements-list">
                  <li>Valid driver's license (held for at least 1 year)</li>
                  <li>Credit card in driver's name</li>
                  <li>Confirmation number: <strong>#{reservation.id}</strong></li>
                  <li>Proof of insurance (if not purchasing rental coverage)</li>
                </ul>
              </div>
            </div>

            <div className="instruction-card">
              <div className="instruction-icon"></div>
              <div className="instruction-details">
                <h4>Pickup Process</h4>
                <ol className="process-list">
                  <li>Visit the Halo Car Rental counter in the rental facility</li>
                  <li>Present your ID, credit card, and confirmation number</li>
                  <li>Review and sign the rental agreement</li>
                  <li>Complete a walk-around inspection of the vehicle</li>
                  <li>Receive keys and parking location</li>
                </ol>
              </div>
            </div>

            <div className="instruction-card">
              <div className="instruction-icon"></div>
              <div className="instruction-details">
                <h4>Return Information</h4>
                <p className="return-time">{formatDate(reservation.end_datetime)}</p>
                <p className="return-location">
                  <strong>Return Location:</strong> Same location - Syracuse Hancock 
                  International Airport Rental Car Center
                </p>
                <p className="note">
                  Return the vehicle to the designated parking area and drop keys at our counter.
                  Late returns may incur additional charges.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h4>Need Help?</h4>
            <div className="contact-info">
              <p><strong>Phone:</strong> (315) 555-0123</p>
              <p><strong>Email:</strong> support@halocarrental.com</p>
              <p><strong>Website:</strong> www.halocarrental.com</p>
            </div>
          </div>

          <div className="pickup-actions">
            <button onClick={onClose} className="btn-done">
              Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PickupInstructions


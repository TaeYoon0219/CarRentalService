import { useState } from 'react'
import './Payment.css'

interface PaymentProps {
  reservationId: number
  totalAmount: number
  carInfo: {
    make: string
    model: string
    year: number
  }
  rentalDates: {
    start: string
    end: string
  }
  onPaymentSuccess: () => void
  onCancel: () => void
}

interface PaymentForm {
  card_number: string
  card_holder: string
  expiry_date: string
  cvv: string
}

const api = {
  async processPayment(paymentData: {
    reservation_id: number
    amount_cents: number
    card_number: string
    card_holder: string
    expiry_date: string
    cvv: string
  }): Promise<{ id: number; reservation_id: number; status: string }> {
    const response = await fetch('http://localhost:3001/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Payment processing failed')
    }

    return response.json()
  },
}

function Payment({
  reservationId,
  totalAmount,
  carInfo,
  rentalDates,
  onPaymentSuccess,
  onCancel,
}: PaymentProps) {
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm({ ...paymentForm, card_number: e.target.value })
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm({ ...paymentForm, expiry_date: e.target.value })
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm({ ...paymentForm, cvv: e.target.value })
  }

  const validateForm = (): boolean => {
    // No validation - allow dummy numbers
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setProcessing(true)

    try {
      await api.processPayment({
        reservation_id: reservationId,
        amount_cents: totalAmount,
        card_number: paymentForm.card_number.replace(/-/g, ''),
        card_holder: paymentForm.card_holder,
        expiry_date: paymentForm.expiry_date,
        cvv: paymentForm.cvv,
      })

      onPaymentSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Payment Details</h2>
          <p>Complete your reservation</p>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span className="label">Vehicle:</span>
            <span className="value">
              {carInfo.make} {carInfo.model} ({carInfo.year})
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Pick-up:</span>
            <span className="value">{formatDate(rentalDates.start)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Return:</span>
            <span className="value">{formatDate(rentalDates.end)}</span>
          </div>
          <div className="summary-item total">
            <span className="label">Total Amount:</span>
            <span className="value">${(totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="payment-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="card_holder">Cardholder Name</label>
            <input
              type="text"
              id="card_holder"
              placeholder="John Doe"
              value={paymentForm.card_holder}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, card_holder: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="card_number">Card Number</label>
            <input
              type="text"
              id="card_number"
              placeholder="1234567890123456"
              value={paymentForm.card_number}
              onChange={handleCardNumberChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiry_date">Expiry Date</label>
              <input
                type="text"
                id="expiry_date"
                placeholder="12/25"
                value={paymentForm.expiry_date}
                onChange={handleExpiryChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                placeholder="123"
                value={paymentForm.cvv}
                onChange={handleCvvChange}
              />
            </div>
          </div>

          <div className="payment-actions">
            <button
              type="submit"
              className="btn-pay"
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay $${(totalAmount / 100).toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={processing}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="payment-security">
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}

export default Payment


import { useState, useEffect } from 'react'
import './CarCalendar.css'

interface Booking {
  id: number
  start_datetime: string
  end_datetime: string
  status: string
}

interface CarCalendarProps {
  carId: number
  selectedStartDate: string
  selectedEndDate: string
  onDateSelect: (start: string, end: string) => void
}

export default function CarCalendar({ carId, selectedStartDate, selectedEndDate, onDateSelect }: CarCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectingStart, setSelectingStart] = useState(true)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    selectedStartDate ? new Date(selectedStartDate) : null
  )
  const [tempEndDate, setTempEndDate] = useState<Date | null>(
    selectedEndDate ? new Date(selectedEndDate) : null
  )

  useEffect(() => {
    loadBookings()
  }, [carId])

  const loadBookings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/cars/${carId}/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to load bookings:', error)
    }
  }

  const isDateBooked = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.some(booking => {
      const start = booking.start_datetime.split('T')[0]
      const end = booking.end_datetime.split('T')[0]
      return dateStr >= start && dateStr <= end
    })
  }

  const isDateSelected = (date: Date): boolean => {
    if (!tempStartDate && !tempEndDate) return false
    const dateStr = date.toISOString().split('T')[0]
    
    if (tempStartDate && tempEndDate) {
      const startStr = tempStartDate.toISOString().split('T')[0]
      const endStr = tempEndDate.toISOString().split('T')[0]
      return dateStr >= startStr && dateStr <= endStr
    }
    
    if (tempStartDate) {
      const startStr = tempStartDate.toISOString().split('T')[0]
      return dateStr === startStr
    }
    
    return false
  }

  const isDateInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false
    const dateStr = date.toISOString().split('T')[0]
    const startStr = tempStartDate.toISOString().split('T')[0]
    const endStr = tempEndDate.toISOString().split('T')[0]
    return dateStr > startStr && dateStr < endStr
  }

  const handleDateClick = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today || isDateBooked(date)) {
      return
    }

    if (selectingStart) {
      setTempStartDate(date)
      setTempEndDate(null)
      setSelectingStart(false)
    } else {
      if (date > tempStartDate!) {
        // Check if any dates in range are booked
        const start = tempStartDate!
        let hasBookedDates = false
        for (let d = new Date(start); d <= date; d.setDate(d.getDate() + 1)) {
          if (isDateBooked(new Date(d))) {
            hasBookedDates = true
            break
          }
        }
        
        if (!hasBookedDates) {
          setTempEndDate(date)
          const startStr = tempStartDate!.toISOString().split('T')[0] + 'T12:00:00'
          const endStr = date.toISOString().split('T')[0] + 'T12:00:00'
          onDateSelect(startStr, endStr)
          setSelectingStart(true)
        }
      } else {
        setTempStartDate(date)
        setTempEndDate(null)
      }
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="car-calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">&lt;</button>
        <h3>{monthName}</h3>
        <button onClick={goToNextMonth} className="calendar-nav-btn">&gt;</button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected</span>
        </div>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-days">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>
          }

          const isBooked = isDateBooked(day)
          const isPast = day < today
          const isSelected = isDateSelected(day)
          const inRange = isDateInRange(day)
          const isDisabled = isPast || isBooked

          let className = 'calendar-day'
          if (isDisabled) className += ' disabled'
          if (isBooked) className += ' booked'
          if (isSelected && !isBooked) className += ' selected'
          if (inRange && !isBooked) className += ' in-range'
          if (isPast && !isBooked) className += ' past'

          return (
            <div
              key={index}
              className={className}
              onClick={() => !isDisabled && handleDateClick(day)}
            >
              {day.getDate()}
            </div>
          )
        })}
      </div>

      <div className="calendar-instructions">
        {selectingStart ? (
          <p>Click a date to select pickup date</p>
        ) : (
          <p>Click a date to select return date</p>
        )}
      </div>
    </div>
  )
}


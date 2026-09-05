"use client";
import { useState, useEffect } from 'react';
import { getAvailability } from '../utils/api';

export default function Calendar({ checkIn, checkOut, setCheckIn, setCheckOut }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [bookedDates, setBookedDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await getAvailability(currentMonth, currentYear);
        setBookedDates(new Set(data.bookedDates));
      } catch (err) {
        console.error('Failed to fetch availability', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [currentMonth, currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDateClick = (dateStr) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      const d1 = new Date(checkIn);
      const d2 = new Date(dateStr);
      if (d2 <= d1) {
        setCheckIn(dateStr);
      } else {
        // Check if any booked dates are in between
        let hasOverlap = false;
        for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
           if (bookedDates.has(d.toISOString().split('T')[0])) {
             hasOverlap = true;
             break;
           }
        }
        if (!hasOverlap) {
          setCheckOut(dateStr);
        } else {
           alert("Selected range includes unavailable dates.");
           setCheckIn(dateStr);
           setCheckOut('');
        }
      }
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderDays = () => {
    const days = [];
    // Empty slots before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar__day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
      const isBooked = bookedDates.has(dateStr);
      const isCheckIn = checkIn === dateStr;
      const isCheckOut = checkOut === dateStr;
      
      let isInRange = false;
      if (checkIn && checkOut) {
        isInRange = dateObj > new Date(checkIn) && dateObj < new Date(checkOut);
      }

      let classes = "calendar__day";
      if (isPast || isBooked) classes += " disabled";
      if (isCheckIn) classes += " selected check-in";
      if (isCheckOut) classes += " selected check-out";
      if (isInRange) classes += " in-range";

      days.push(
        <button
          key={i}
          className={classes}
          disabled={isPast || isBooked}
          onClick={(e) => {
            e.preventDefault();
            handleDateClick(dateStr);
          }}
          type="button"
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" onClick={handlePrevMonth} disabled={currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1}>&lt;</button>
        <div className="calendar__title">{monthNames[currentMonth - 1]} {currentYear} {loading && <small>(...)</small>}</div>
        <button type="button" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar__weekdays">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      <div className="calendar__grid">
        {renderDays()}
      </div>
    </div>
  );
}

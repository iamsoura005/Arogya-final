import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import appointmentService, { 
  Doctor, 
  Appointment, 
  TimeSlot 
} from '../services/appointmentService';

interface AppointmentSchedulerProps {
  userId: string;
  userName: string;
  userEmail: string;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ 
  userId, 
  userName, 
  userEmail 
}) => {
  const [step, setStep] = useState<'doctors' | 'slots' | 'confirm' | 'success'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load doctors and user appointments on mount
  useEffect(() => {
    const allDoctors = appointmentService.getAllDoctors();
    setDoctors(allDoctors);
    
    const appointments = appointmentService.getUserAppointments(userId);
    setUserAppointments(appointments);
  }, [userId]);

  // Load available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const slots = appointmentService.getAvailableSlots(selectedDoctor.id, selectedDate);
      setAvailableSlots(slots);
    }
  }, [selectedDoctor, selectedDate]);

  // Auto-match doctor based on symptoms
  const handleSymptomMatch = () => {
    if (symptoms.length > 0) {
      const matchedDoctors = appointmentService.getRecommendedDoctors(symptoms);
      if (matchedDoctors.length > 0) {
        setSelectedDoctor(matchedDoctors[0]);
        setStep('slots');
      } else {
        setError('No specific doctor matched. Please select manually.');
      }
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('slots');
    setError(null);
  };

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
    setError(null);
  };

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointment = appointmentService.bookAppointment({
        doctorId: selectedDoctor.id,
        userId,
        patientName: userName,
        patientEmail: userEmail,
        patientPhone: '',
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot.time,
        type: 'video',
        symptoms,
        specialization: selectedDoctor.specialization[0],
        consultationFee: selectedDoctor.consultationFee,
        notes: reason
      });

      setBookedAppointment(appointment);
      setStep('success');
      
      // Refresh user appointments
      const updated = appointmentService.getUserAppointments(userId);
      setUserAppointments(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = (appointmentId: string) => {
    const success = appointmentService.cancelAppointment(appointmentId);
    if (success) {
      const updated = appointmentService.getUserAppointments(userId);
      setUserAppointments(updated);
    }
  };

  // Reset form
  const handleReset = () => {
    setStep('doctors');
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setReason('');
    setSymptoms([]);
    setBookedAppointment(null);
    setError(null);
  };

  // Generate date options (next 30 days)
  const getDateOptions = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Appointment Scheduler
          </h1>
          <p className="text-gray-600 mt-2">Book video consultations with our expert doctors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Doctor Selection */}
            {step === 'doctors' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Select a Doctor
                </h2>

                {/* Symptom Matcher */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Tell us your symptoms for automatic doctor matching
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter symptoms (e.g., chest pain, headache)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setSymptoms([...symptoms, e.currentTarget.value]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={handleSymptomMatch}
                      disabled={symptoms.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Match Doctor
                    </button>
                  </div>
                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1"
                        >
                          {symptom}
                          <button
                            onClick={() => setSymptoms(symptoms.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Doctor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800">{doctor.name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                          <p className="text-xs text-gray-500 mt-1">{doctor.experience} years experience</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium">{doctor.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{doctor.hospitalAffiliation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Slot Selection */}
            {step === 'slots' && selectedDoctor && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Select Date & Time
                  </h2>
                  <button
                    onClick={() => setStep('doctors')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Change Doctor
                  </button>
                </div>

                {/* Selected Doctor Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <User className="w-12 h-12 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedDoctor.name}</h3>
                      <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    </div>
                  </div>
                </div>

                {/* Date Selector */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Select Date</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {getDateOptions().slice(0, 14).map((date, idx) => {
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg text-center transition-all ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-bold">
                            {date.getDate()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Available Time Slots - {formatDate(selectedDate)}
                  </h3>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date. Please select another date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!slot.available}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            slot.available 
                              ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50' 
                              : 'border-gray-100 bg-gray-100 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700">
                            <Clock className="w-4 h-4" />
                            {slot.time}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirm' && selectedDoctor && selectedSlot && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Confirm Appointment
                </h2>

                {/* Appointment Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Doctor</p>
                      <p className="font-semibold text-gray-800">{selectedDoctor.name}</p>
                      <p className="text-sm text-blue-600">{selectedDoctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800">{formatDate(selectedDate)}</p>
                      <p className="text-sm text-gray-700">{selectedSlot.time}</p>
                    </div>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe your health concern..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('slots')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={loading || !reason}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && bookedAppointment && selectedDoctor && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Appointment Confirmed!
                  </h2>
                  <p className="text-gray-600">
                    Your appointment has been successfully booked
                  </p>
                </div>

                {/* Appointment Details */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium text-gray-800">{selectedDoctor.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Date & Time</p>
                        <p className="font-medium text-gray-800">
                          {bookedAppointment.date} at {bookedAppointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Video className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Video Consultation Link</p>
                        <a 
                          href={bookedAppointment.videoLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 underline break-all"
                        >
                          {bookedAppointment.videoLink}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Reminders Enabled</p>
                        <p className="text-sm text-gray-700 mt-1">
                          You'll receive reminders via email and SMS before your appointment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - My Appointments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                My Appointments
              </h3>

              {userAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No appointments yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userAppointments
                    .sort((a, b) => {
                      const dateA = new Date(`${a.date} ${a.time}`).getTime();
                      const dateB = new Date(`${b.date} ${b.time}`).getTime();
                      return dateB - dateA;
                    })
                    .map((apt) => {
                      const doctor = doctors.find(d => d.id === apt.doctorId);
                      return (
                        <div 
                          key={apt.id}
                          className={`border-2 rounded-lg p-3 ${
                            apt.status === 'confirmed' || apt.status === 'scheduled'
                              ? 'border-green-200 bg-green-50' 
                              : apt.status === 'cancelled'
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">
                                {doctor?.name || 'Unknown Doctor'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {doctor?.specialization[0] || apt.specialization}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'confirmed' || apt.status === 'scheduled'
                                ? 'bg-green-100 text-green-700' 
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 mb-1">
                            📅 {apt.date}
                          </p>
                          <p className="text-xs text-gray-700 mb-2">
                            🕒 {apt.time}
                          </p>
                          {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                            <div className="flex gap-2">
                              {apt.videoLink && (
                                <a
                                  href={apt.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded text-center hover:bg-blue-700"
                                >
                                  Join Call
                                </a>
                              )}
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;

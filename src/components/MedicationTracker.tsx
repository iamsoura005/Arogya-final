import React, { useState, useEffect } from 'react';
import { Pill, Clock, Calendar, AlertTriangle, CheckCircle, XCircle, TrendingUp, Package, Bell } from 'lucide-react';
import medicationService, {
  MedicationSchedule,
  MedicationLog,
  AdherenceStats,
  DrugInteraction
} from '../services/medicationService';

interface MedicationTrackerProps {
  userId: string;
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({ userId }) => {
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [adherenceStats, setAdherenceStats] = useState<AdherenceStats | null>(null);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [refillNeeded, setRefillNeeded] = useState<MedicationSchedule[]>([]);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Once daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    duration: '30 days',
    category: 'prescription' as 'prescription' | 'over-the-counter' | 'supplement',
    purpose: '',
    foodInstructions: '',
    reminderEnabled: true
  });

  // Load data
  useEffect(() => {
    loadMedications();
    loadTodayLogs();
    loadAdherenceStats();
    checkInteractions();
    checkRefills();
  }, [userId]);

  const loadMedications = () => {
    const meds = medicationService.getUserMedications(userId);
    setMedications(meds);
  };

  const loadTodayLogs = () => {
    const todayData = medicationService.getTodaysMedications(userId);
    setTodayLogs(todayData.flatMap(item => item.logs));
  };

  const loadAdherenceStats = () => {
    const stats = medicationService.calculateAdherence(userId);
    setAdherenceStats(stats);
  };

  const checkInteractions = () => {
    const interactionList = medicationService.getUserDrugInteractionWarnings(userId);
    setInteractions(interactionList);
  };

  const checkRefills = () => {
    const needsRefill = medicationService.getMedicationsNeedingRefill(userId);
    setRefillNeeded(needsRefill);
  };

  // Add medication
  const handleAddMedication = () => {
    if (!newMedication.medicineName || !newMedication.dosage) {
      alert('Please fill in required fields');
      return;
    }

    // Adjust times based on frequency
    let times = newMedication.times;
    if (newMedication.frequency === 'Twice daily') {
      times = ['08:00', '20:00'];
    } else if (newMedication.frequency === '3 times daily') {
      times = ['08:00', '14:00', '20:00'];
    } else if (newMedication.frequency === 'Every 6 hours') {
      times = ['06:00', '12:00', '18:00', '00:00'];
    }

    const startDate = new Date(newMedication.startDate);
    const durationDays = parseInt(newMedication.duration.match(/\d+/)?.[0] || '30');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const medication = medicationService.createMedicationSchedule(userId, {
      medicine: {} as any, // Mock medicine object
      medicineName: newMedication.medicineName,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      times,
      duration: newMedication.duration,
      startDate: newMedication.startDate,
      endDate: endDate.toISOString().split('T')[0],
      category: newMedication.category,
      purpose: newMedication.purpose,
      foodInstructions: newMedication.foodInstructions,
      reminderEnabled: newMedication.reminderEnabled,
      refillReminder: true,
      pillsRemaining: durationDays * times.length
    });

    if (medication) {
      loadMedications();
      checkInteractions();
      setShowAddForm(false);
      // Reset form
      setNewMedication({
        medicineName: '',
        dosage: '',
        frequency: 'Once daily',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        duration: '30 days',
        category: 'prescription',
        purpose: '',
        foodInstructions: '',
        reminderEnabled: true
      });
    }
  };

  // Log medication taken
  const handleLogMedication = (scheduleId: string, scheduledTime: string, status: 'taken' | 'missed' | 'skipped') => {
    if (status === 'taken') {
      medicationService.logMedicationTaken(scheduleId, scheduledTime);
    } else if (status === 'missed') {
      medicationService.logMedicationMissed(scheduleId, scheduledTime);
    } else if (status === 'skipped') {
      medicationService.logMedicationSkipped(scheduleId, scheduledTime);
    }
    loadTodayLogs();
    loadAdherenceStats();
  };

  // Delete medication
  const handleDeleteMedication = (medicationId: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      medicationService.deleteMedicationSchedule(medicationId);
      loadMedications();
      loadTodayLogs();
      checkInteractions();
    }
  };

  // Get color for adherence percentage
  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Calculate adherence percentage
  const adherencePercentage = adherenceStats
    ? (adherenceStats.takenDoses / (adherenceStats.totalDoses || 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Pill className="w-8 h-8 text-purple-600" />
                Medication Tracker
              </h1>
              <p className="text-gray-600 mt-2">Manage your medications and track adherence</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Pill className="w-5 h-5" />
              {showAddForm ? 'Cancel' : 'Add Medication'}
            </button>
          </div>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Medication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={newMedication.medicineName}
                  onChange={(e) => setNewMedication({ ...newMedication, medicineName: e.target.value })}
                  placeholder="e.g., Lisinopril"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Once daily">Once Daily</option>
                  <option value="Twice daily">Twice Daily</option>
                  <option value="3 times daily">Three Times Daily</option>
                  <option value="Every 6 hours">Every 6 Hours</option>
                  <option value="As needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                  placeholder="e.g., 30 days, 2 weeks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newMedication.category}
                  onChange={(e) => setNewMedication({ ...newMedication, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="prescription">Prescription</option>
                  <option value="over-the-counter">Over-the-Counter</option>
                  <option value="supplement">Supplement</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={newMedication.purpose}
                  onChange={(e) => setNewMedication({ ...newMedication, purpose: e.target.value })}
                  placeholder="e.g., Blood pressure control"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Instructions
                </label>
                <input
                  type="text"
                  value={newMedication.foodInstructions}
                  onChange={(e) => setNewMedication({ ...newMedication, foodInstructions: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddMedication}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adherence Stats */}
            {adherenceStats && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Adherence Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Overall</p>
                    <p className={`text-3xl font-bold ${getAdherenceColor(adherenceStats.adherenceRate)}`}>
                      {adherenceStats.adherenceRate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Taken</p>
                    <p className="text-3xl font-bold text-blue-600">{adherenceStats.takenDoses}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Missed</p>
                    <p className="text-3xl font-bold text-red-600">{adherenceStats.missedDoses}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Streak</p>
                    <p className="text-3xl font-bold text-purple-600">{adherenceStats.currentStreak}</p>
                    <p className="text-xs text-gray-500">Best: {adherenceStats.longestStreak}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                Today's Medications
              </h2>
              {todayLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No medications scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayLogs.map((log) => {
                    const med = medications.find(m => m.id === log.scheduleId);
                    if (!med) return null;

                    return (
                      <div
                        key={log.id}
                        className={`border-2 rounded-lg p-4 ${
                          log.status === 'taken'
                            ? 'border-green-200 bg-green-50'
                            : log.status === 'missed'
                            ? 'border-red-200 bg-red-50'
                            : log.status === 'skipped'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-purple-200 bg-purple-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">{med.medicineName}</h3>
                            <p className="text-sm text-gray-600">{med.dosage}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-700 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(log.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {med.foodInstructions && (
                                <span className="text-sm text-gray-600 italic">
                                  {med.foodInstructions}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {log.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleLogMedication(log.scheduleId, log.scheduledTime, 'taken')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Taken
                                </button>
                                <button
                                  onClick={() => handleLogMedication(log.scheduleId, log.scheduledTime, 'skipped')}
                                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 flex items-center gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Skip
                                </button>
                              </>
                            ) : (
                              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                log.status === 'taken'
                                  ? 'bg-green-100 text-green-700'
                                  : log.status === 'missed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Medications List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Medications</h2>
              {medications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No medications added yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                  >
                    Add Your First Medication
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div key={med.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-800">{med.medicineName}</h3>
                          <p className="text-sm text-gray-600">{med.dosage} - {med.frequency.replace('_', ' ')}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {med.times.map((time, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {time}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {med.startDate} to {med.endDate}
                          </p>
                          {med.pillsRemaining !== undefined && (
                            <p className="text-xs text-gray-500">
                              Pills remaining: {med.pillsRemaining}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMedication(med.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Drug Interactions */}
            {interactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Drug Interactions
                </h3>
                <div className="space-y-3">
                  {interactions.map((interaction, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg p-3 ${getSeverityColor(interaction.severity)}`}
                    >
                      <p className="font-semibold text-sm mb-1">
                        {interaction.drugs.join(' + ')}
                      </p>
                      <p className="text-xs mb-2">
                        <span className="font-medium">Severity:</span> {interaction.severity.toUpperCase()}
                      </p>
                      <p className="text-xs mb-2">{interaction.description}</p>
                      <p className="text-xs text-gray-700 italic">{interaction.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refill Alerts */}
            {refillNeeded.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  Refill Needed
                </h3>
                <div className="space-y-3">
                  {refillNeeded.map((med) => (
                    <div key={med.id} className="border-2 border-orange-200 bg-orange-50 rounded-lg p-3">
                      <p className="font-semibold text-sm text-gray-800">{med.medicineName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {med.pillsRemaining !== undefined ? `Only ${med.pillsRemaining} pills remaining` : 'Refill needed soon'}
                      </p>
                      {med.refillDate && (
                        <p className="text-xs text-orange-700 mt-2 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Refill by: {new Date(med.refillDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Medication Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Set phone alarms for medication times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Use a pill organizer for weekly planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Take medications with food unless directed otherwise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Never share prescribed medications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Keep medications in a cool, dry place</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationTracker;

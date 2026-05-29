import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Video,
  Heart,
  Clock,
  Shield,
  ArrowLeft,
  AlertCircle,
  Navigation,
  User,
  Mail,
  Star,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  CheckCircle
} from 'lucide-react';
import {
  EmergencyContact,
  emergencyHotlines,
  redFlagSymptoms,
  firstAidResources,
  detectRedFlags,
  addEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  findNearbyHospitals,
  createEmergencyAlert
} from '../services/emergencyService';

interface EmergencyResponseProps {
  onBack?: () => void;
}

const EmergencyResponse: React.FC<EmergencyResponseProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'panic' | 'contacts' | 'hospitals' | 'firstaid' | 'hotlines'>('panic');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false
  });
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [firstAidResources, setFirstAidResources] = useState<any[]>([]);

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadEmergencyContacts();
    getUserLocation();
    loadFirstAidResources();
  }, []);

  const loadEmergencyContacts = () => {
    const contacts = getEmergencyContacts(userId);
    setEmergencyContacts(contacts);
  };

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          // Load nearby hospitals
          const nearbyHospitals = await findNearbyHospitals(location.lat, location.lng, 10000);
          setHospitals(nearbyHospitals);
        },
        async (error) => {
          console.error('Location error:', error);
          // Use default location (e.g., city center)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
          setUserLocation(defaultLocation);
          const nearbyHospitals = await findNearbyHospitals(defaultLocation.lat, defaultLocation.lng, 10000);
          setHospitals(nearbyHospitals);
        }
      );
    }
  };

  const loadFirstAidResources = () => {
    setFirstAidResources(firstAidResources);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = addEmergencyContact(userId, newContact);
      setEmergencyContacts([...emergencyContacts, contact]);
      setNewContact({ name: '', relationship: '', phone: '', email: '', isPrimary: false });
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('Are you sure you want to delete this emergency contact?')) {
      deleteEmergencyContact(contactId);
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== contactId));
    }
  };

  const handleEmergencyAlert = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select your symptoms');
      return;
    }

    const redFlags = detectRedFlags(selectedSymptoms);
    
    if (redFlags.length > 0 && userLocation) {
      const emergencyAlert = createEmergencyAlert(userId, {
        type: 'symptom',
        severity: redFlags[0].severity as 'critical' | 'urgent' | 'moderate',
        symptoms: selectedSymptoms,
        location: userLocation,
        contactsNotified: emergencyContacts.map(c => c.id)
      });
      setAlertSent(true);
      
      // Show critical alert
      const criticalFlag = redFlags[0];
      alert(
        `🚨 EMERGENCY DETECTED!\n\n` +
        `Symptom: ${criticalFlag.symptom}\n` +
        `Action: ${criticalFlag.action}\n\n` +
        `Emergency contacts have been notified.\n` +
        `Your location has been shared.`
      );

      setTimeout(() => setAlertSent(false), 5000);
    }
  };

  const handleCallHotline = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </motion.button>
          
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={32} />
            <h1 className="text-3xl font-bold">Emergency Response</h1>
          </div>
          <p className="text-red-100">24/7 Emergency Support & Resources</p>
        </div>
      </div>

      {/* Emergency Banner */}
      <AnimatePresence>
        {alertSent && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-red-600 text-white p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={24} />
              <span className="text-lg font-semibold">Emergency Alert Sent Successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'panic', label: 'Panic Button', icon: AlertTriangle },
            { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
            { id: 'hospitals', label: 'Nearby Hospitals', icon: MapPin },
            { id: 'firstaid', label: 'First Aid', icon: Heart },
            { id: 'hotlines', label: 'Hotlines', icon: Shield }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={20} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'panic' && (
            <motion.div
              key="panic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Red Flag Symptoms */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="text-red-600" />
                  Select Your Symptoms
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose any symptoms you're experiencing. We'll detect critical conditions.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {redFlagSymptoms.map((flag, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedSymptoms.includes(flag.symptom)
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                      onClick={() => {
                        if (selectedSymptoms.includes(flag.symptom)) {
                          setSelectedSymptoms(selectedSymptoms.filter(s => s !== flag.symptom));
                        } else {
                          setSelectedSymptoms([...selectedSymptoms, flag.symptom]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{flag.symptom}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          flag.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {flag.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{flag.action}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Emergency Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmergencyAlert}
                disabled={selectedSymptoms.length === 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-6 rounded-xl font-bold text-xl shadow-2xl hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <AlertTriangle size={32} />
                SEND EMERGENCY ALERT
              </motion.button>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>Important:</strong> This will notify all your emergency contacts and share your location.
                  For immediate life-threatening emergencies, call 112 (India) or your local emergency number.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Emergency Contacts</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddContact(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus size={20} />
                    Add Contact
                  </motion.button>
                </div>

                {emergencyContacts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Phone size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No emergency contacts added yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {emergencyContacts.map(contact => (
                      <motion.div
                        key={contact.id}
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="text-red-600" size={20} />
                            <h3 className="font-semibold text-lg">{contact.name}</h3>
                          </div>
                          {contact.isPrimary && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{contact.relationship}</p>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <Phone size={16} className="text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <Mail size={16} className="text-gray-400" />
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCallHotline(contact.phone)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Phone size={16} />
                            Call
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Contact Modal */}
              <AnimatePresence>
                {showAddContact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddContact(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-xl p-6 max-w-md w-full"
                    >
                      <h3 className="text-2xl font-bold mb-4">Add Emergency Contact</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name *</label>
                          <input
                            type="text"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Relationship</label>
                          <input
                            type="text"
                            value={newContact.relationship}
                            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                            placeholder="Father, Mother, Spouse, etc."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                          <input
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                            placeholder="john@example.com"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newContact.isPrimary}
                            onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">Set as primary contact</label>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowAddContact(false)}
                          className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddContact}
                          className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 rounded-lg hover:shadow-lg"
                        >
                          Add Contact
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'hospitals' && (
            <motion.div
              key="hospitals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="text-red-600" />
                  Nearby Hospitals ({hospitals.length})
                </h2>
                {userLocation && (
                  <p className="text-gray-600 mb-6">
                    📍 Showing hospitals within 10km of your location
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {hospitals.map(hospital => (
                    <motion.div
                      key={hospital.id}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{hospital.name}</h3>
                        {hospital.hasEmergency && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            ER
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin size={16} />
                        <span>{hospital.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Navigation size={16} />
                        <span>{hospital.distance.toFixed(1)} km away</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span>{hospital.rating.toFixed(1)} / 5.0</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hospital.specialties.slice(0, 3).map((specialty: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <a
                          href={`tel:${hospital.phone}`}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Navigation size={16} />
                          Directions
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'firstaid' && (
            <motion.div
              key="firstaid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="text-red-600" />
                  First Aid Resources
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {firstAidResources.map(resource => (
                    <motion.div
                      key={resource.id}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{resource.title}</h3>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {resource.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{resource.condition}</p>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-2">Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          {resource.steps.slice(0, 3).map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      {resource.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mb-3">
                          <p className="text-xs text-yellow-800">
                            ⚠️ {resource.warnings[0]}
                          </p>
                        </div>
                      )}
                      
                      {resource.videoUrl && (
                        <a
                          href={resource.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Video size={16} />
                          Watch Video Guide
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotlines' && (
            <motion.div
              key="hotlines"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="text-red-600" />
                  Emergency Hotlines by Country
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {emergencyHotlines.map((hotline, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all"
                    >
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <span className="text-2xl">{hotline.countryCode === 'IN' ? '🇮🇳' : hotline.countryCode === 'US' ? '🇺🇸' : '🌍'}</span>
                        {hotline.country}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Emergency:</span>
                          <a
                            href={`tel:${hotline.emergency}`}
                            className="font-bold text-red-600 hover:underline"
                          >
                            {hotline.emergency}
                          </a>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ambulance:</span>
                          <a
                            href={`tel:${hotline.ambulance}`}
                            className="font-bold text-red-600 hover:underline"
                          >
                            {hotline.ambulance}
                          </a>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Police:</span>
                          <a
                            href={`tel:${hotline.police}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {hotline.police}
                          </a>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fire:</span>
                          <a
                            href={`tel:${hotline.fire}`}
                            className="font-bold text-orange-600 hover:underline"
                          >
                            {hotline.fire}
                          </a>
                        </div>
                        
                        {hotline.poisonControl && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Poison Control:</span>
                            <a
                              href={`tel:${hotline.poisonControl}`}
                              className="font-bold text-purple-600 hover:underline"
                            >
                              {hotline.poisonControl}
                            </a>
                          </div>
                        )}
                        
                        {hotline.mentalHealth && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Mental Health:</span>
                            <a
                              href={`tel:${hotline.mentalHealth}`}
                              className="font-bold text-green-600 hover:underline"
                            >
                              {hotline.mentalHealth}
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmergencyResponse;

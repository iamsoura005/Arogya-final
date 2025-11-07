import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Activity,
  Pill,
  FileText,
  Heart,
  User,
  Phone,
  AlertCircle,
  Download,
  Baby,
  UserCircle
} from 'lucide-react';
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getFamilyHealthSummary,
  getMemberHealthData,
  calculateAge,
  getRelationshipDisplay,
  getDefaultAvatar,
  exportFamilyHealthData,
  FamilyMember
} from '../services/familyHealthService';

interface FamilyHealthHubProps {
  onBack?: () => void;
  onStartConsultation?: (memberId: string) => void;
  onViewAppointments?: (memberId: string) => void;
  onViewMedications?: (memberId: string) => void;
}

const FamilyHealthHub: React.FC<FamilyHealthHubProps> = ({
  onBack,
  onStartConsultation,
  onViewAppointments,
  onViewMedications
}) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: 'child' as FamilyMember['relationship'],
    dateOfBirth: '',
    sex: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    emergencyContact: '',
    allergies: [] as string[],
    chronicConditions: [] as string[],
    notes: ''
  });

  const userId = localStorage.getItem('currentUserId') || 'user_default';

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = () => {
    const familyMembers = getFamilyMembers(userId);
    setMembers(familyMembers);
    const familySummary = getFamilyHealthSummary(userId);
    setSummary(familySummary);
    
    if (familyMembers.length > 0 && !selectedMember) {
      setSelectedMember(familyMembers[0]);
    }
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.dateOfBirth) {
      alert('Please fill in name and date of birth');
      return;
    }

    addFamilyMember(userId, newMember);
    loadFamilyData();
    setShowAddModal(false);
    setNewMember({
      name: '',
      relationship: 'child',
      dateOfBirth: '',
      sex: 'male',
      bloodGroup: '',
      emergencyContact: '',
      allergies: [],
      chronicConditions: [],
      notes: ''
    });
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    updateFamilyMember(userId, selectedMember.id, newMember);
    loadFamilyData();
    setShowEditModal(false);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this family member? All their health data will be deleted.')) {
      deleteFamilyMember(userId, memberId);
      loadFamilyData();
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
      }
    }
  };

  const openEditModal = (member: FamilyMember) => {
    setNewMember({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth,
      sex: member.sex,
      bloodGroup: member.bloodGroup || '',
      emergencyContact: member.emergencyContact || '',
      allergies: member.allergies || [],
      chronicConditions: member.chronicConditions || [],
      notes: member.notes || ''
    });
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const healthData = getMemberHealthData(member.id);
    const age = calculateAge(member.dateOfBirth);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedMember(member)}
        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
          selectedMember?.id === member.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">
              {member.photo || getDefaultAvatar(member.sex, member.relationship)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className="text-gray-600 text-sm">{getRelationshipDisplay(member.relationship)}</p>
              <p className="text-gray-500 text-xs">{age} years old</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(member);
              }}
              className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMember(member.id);
              }}
              className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-purple-600">{healthData.consultations.length}</p>
            <p className="text-xs text-gray-600">Consultations</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-blue-600">{healthData.appointments.length}</p>
            <p className="text-xs text-gray-600">Appointments</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-green-600">{healthData.medications.length}</p>
            <p className="text-xs text-gray-600">Medications</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const MemberModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-2xl font-bold mb-6">
          {isEdit ? 'Edit' : 'Add'} Family Member
        </h3>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Relationship *</label>
              <select
                value={newMember.relationship}
                onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date of Birth *</label>
              <input
                type="date"
                value={newMember.dateOfBirth}
                onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Sex *</label>
              <select
                value={newMember.sex}
                onChange={(e) => setNewMember({ ...newMember, sex: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Blood Group</label>
              <select
                value={newMember.bloodGroup}
                onChange={(e) => setNewMember({ ...newMember, bloodGroup: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Emergency Contact</label>
              <input
                type="tel"
                value={newMember.emergencyContact}
                onChange={(e) => setNewMember({ ...newMember, emergencyContact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={newMember.notes}
              onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={isEdit ? handleUpdateMember : handleAddMember}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              {isEdit ? 'Update' : 'Add'} Member
            </button>
            <button
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
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

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users size={32} />
                <h1 className="text-3xl font-bold">Family Health Hub</h1>
              </div>
              <p className="text-purple-100">Manage health records for your entire family</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportFamilyHealthData(userId)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={20} />
              <span>Export Data</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6"
            >
              <Users size={32} className="mb-2" />
              <p className="text-3xl font-bold">{summary.totalMembers}</p>
              <p className="text-purple-100">Family Members</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6"
            >
              <Activity size={32} className="mb-2" />
              <p className="text-3xl font-bold">{summary.totalConsultations}</p>
              <p className="text-blue-100">Total Consultations</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6"
            >
              <Calendar size={32} className="mb-2" />
              <p className="text-3xl font-bold">{summary.totalAppointments}</p>
              <p className="text-green-100">Total Appointments</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6"
            >
              <Pill size={32} className="mb-2" />
              <p className="text-3xl font-bold">{summary.totalMedications}</p>
              <p className="text-orange-100">Total Medications</p>
            </motion.div>
          </div>
        )}

        {/* Add Member Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Add Family Member
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold mb-4">Family Members</h2>
            {members.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <UserCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No family members added yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  Add your first family member
                </button>
              </div>
            ) : (
              members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MemberCard member={member} />
                </motion.div>
              ))
            )}
          </div>

          {/* Member Details */}
          <div className="lg:col-span-2">
            {selectedMember ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">
                      {selectedMember.photo || getDefaultAvatar(selectedMember.sex, selectedMember.relationship)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedMember.name}</h2>
                      <p className="text-gray-600">{getRelationshipDisplay(selectedMember.relationship)}</p>
                      <p className="text-gray-500 text-sm">{calculateAge(selectedMember.dateOfBirth)} years old</p>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Date of Birth:</span> {new Date(selectedMember.dateOfBirth).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Sex:</span> {selectedMember.sex}</p>
                      {selectedMember.bloodGroup && (
                        <p><span className="font-semibold">Blood Group:</span> {selectedMember.bloodGroup}</p>
                      )}
                      {selectedMember.emergencyContact && (
                        <p><span className="font-semibold">Emergency Contact:</span> {selectedMember.emergencyContact}</p>
                      )}
                    </div>
                  </div>
                  {selectedMember.notes && (
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Notes</h3>
                      <p className="text-sm text-gray-600">{selectedMember.notes}</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartConsultation?.(selectedMember.id)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Activity size={24} />
                    <span className="font-semibold">Start Consultation</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewAppointments?.(selectedMember.id)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Calendar size={24} />
                    <span className="font-semibold">Appointments</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewMedications?.(selectedMember.id)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg flex flex-col items-center gap-2"
                  >
                    <Pill size={24} />
                    <span className="font-semibold">Medications</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Users size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Member Selected</h3>
                <p className="text-gray-500">Select a family member to view their details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <MemberModal />}
        {showEditModal && <MemberModal isEdit />}
      </AnimatePresence>
    </div>
  );
};

export default FamilyHealthHub;

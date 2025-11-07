export interface Translation {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    backToDashboard: string;
    submit: string;
    reset: string;
    close: string;
    download: string;
    upload: string;
    search: string;
    filter: string;
    yes: string;
    no: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    symptoms: string;
    appointments: string;
    medications: string;
    emergency: string;
    profile: string;
    settings: string;
    logout: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    welcomeBack: string;
    yourHealthHub: string;
    quickActions: string;
    checkSymptoms: string;
    bookAppointment: string;
    trackMedications: string;
    emergencyHelp: string;
    voiceConsultation: string;
    imageAnalysis: string;
    healthMetrics: string;
    recentActivity: string;
    upcomingAppointments: string;
    medicationReminders: string;
  };

  // Symptom Checker
  symptomChecker: {
    title: string;
    subtitle: string;
    enterSymptoms: string;
    placeholder: string;
    analyze: string;
    analyzing: string;
    results: string;
    detectedSymptoms: string;
    possibleConditions: string;
    recommendations: string;
    severity: string;
    confidence: string;
    chatWithAI: string;
    typeMessage: string;
    bertAnalysis: string;
    emotionalState: string;
    contextualInsights: string;
    comparisonChart: string;
    bertVsTraditional: string;
  };

  // Appointments
  appointments: {
    title: string;
    subtitle: string;
    selectDoctor: string;
    selectDate: string;
    selectTime: string;
    bookAppointment: string;
    yourAppointments: string;
    upcoming: string;
    past: string;
    canceled: string;
    doctor: string;
    specialization: string;
    date: string;
    time: string;
    status: string;
    reason: string;
    symptoms: string;
    joinVideoCall: string;
    cancelAppointment: string;
    reschedule: string;
  };

  // Medications
  medications: {
    title: string;
    subtitle: string;
    addMedication: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    startDate: string;
    endDate: string;
    refillDate: string;
    yourMedications: string;
    todaySchedule: string;
    adherenceStats: string;
    interactions: string;
    refillReminders: string;
    takeDose: string;
    skipDose: string;
    markTaken: string;
  };

  // Voice Consultation
  voiceConsultation: {
    title: string;
    subtitle: string;
    startListening: string;
    stopListening: string;
    listening: string;
    processing: string;
    speak: string;
    transcript: string;
    aiResponse: string;
    language: string;
    selectLanguage: string;
  };

  // Emergency
  emergency: {
    title: string;
    subtitle: string;
    callEmergency: string;
    nearbyHospitals: string;
    firstAid: string;
    emergencyContacts: string;
    symptoms: string;
    urgentCare: string;
    ambulance: string;
  };

  // Authentication
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    name: string;
    forgotPassword: string;
    rememberMe: string;
    noAccount: string;
    haveAccount: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    selectLanguage: string;
    notifications: string;
    privacy: string;
    theme: string;
    account: string;
    help: string;
    about: string;
  };
}

export const translations: Record<'en' | 'hi' | 'bn', Translation> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      backToDashboard: 'Back to Dashboard',
      submit: 'Submit',
      reset: 'Reset',
      close: 'Close',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      yes: 'Yes',
      no: 'No',
    },
    nav: {
      dashboard: 'Dashboard',
      symptoms: 'Symptoms',
      appointments: 'Appointments',
      medications: 'Medications',
      emergency: 'Emergency',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    dashboard: {
      welcome: 'Welcome',
      welcomeBack: 'Welcome back',
      yourHealthHub: 'Your Health Hub',
      quickActions: 'Quick Actions',
      checkSymptoms: 'Check Symptoms',
      bookAppointment: 'Book Appointment',
      trackMedications: 'Track Medications',
      emergencyHelp: 'Emergency Help',
      voiceConsultation: 'Voice Consultation',
      imageAnalysis: 'Image Analysis',
      healthMetrics: 'Health Metrics',
      recentActivity: 'Recent Activity',
      upcomingAppointments: 'Upcoming Appointments',
      medicationReminders: 'Medication Reminders',
    },
    symptomChecker: {
      title: 'AI Symptom Checker',
      subtitle: 'Describe your symptoms for instant AI-powered analysis',
      enterSymptoms: 'Enter your symptoms',
      placeholder: 'Describe what you\'re feeling...',
      analyze: 'Analyze Symptoms',
      analyzing: 'Analyzing...',
      results: 'Analysis Results',
      detectedSymptoms: 'Detected Symptoms',
      possibleConditions: 'Possible Conditions',
      recommendations: 'Recommendations',
      severity: 'Severity',
      confidence: 'Confidence',
      chatWithAI: 'Chat with AI',
      typeMessage: 'Type your message...',
      bertAnalysis: 'BERT AI Analysis',
      emotionalState: 'Emotional State',
      contextualInsights: 'Contextual Insights',
      comparisonChart: 'AI Comparison',
      bertVsTraditional: 'BERT AI vs Traditional',
    },
    appointments: {
      title: 'Appointment Scheduler',
      subtitle: 'Book video consultations with our expert doctors',
      selectDoctor: 'Select a Doctor',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      bookAppointment: 'Book Appointment',
      yourAppointments: 'Your Appointments',
      upcoming: 'Upcoming',
      past: 'Past',
      canceled: 'Canceled',
      doctor: 'Doctor',
      specialization: 'Specialization',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      reason: 'Reason',
      symptoms: 'Symptoms',
      joinVideoCall: 'Join Video Call',
      cancelAppointment: 'Cancel Appointment',
      reschedule: 'Reschedule',
    },
    medications: {
      title: 'Medication Tracker',
      subtitle: 'Manage your medications and track adherence',
      addMedication: 'Add Medication',
      medicineName: 'Medicine Name',
      dosage: 'Dosage',
      frequency: 'Frequency',
      timing: 'Timing',
      startDate: 'Start Date',
      endDate: 'End Date',
      refillDate: 'Refill Date',
      yourMedications: 'Your Medications',
      todaySchedule: 'Today\'s Schedule',
      adherenceStats: 'Adherence Statistics',
      interactions: 'Drug Interactions',
      refillReminders: 'Refill Reminders',
      takeDose: 'Take Dose',
      skipDose: 'Skip Dose',
      markTaken: 'Mark as Taken',
    },
    voiceConsultation: {
      title: 'Voice Consultation',
      subtitle: 'Speak with our AI health assistant',
      startListening: 'Start Listening',
      stopListening: 'Stop Listening',
      listening: 'Listening...',
      processing: 'Processing...',
      speak: 'Speak',
      transcript: 'Transcript',
      aiResponse: 'AI Response',
      language: 'Language',
      selectLanguage: 'Select Language',
    },
    emergency: {
      title: 'Emergency Response',
      subtitle: 'Get immediate help in medical emergencies',
      callEmergency: 'Call Emergency',
      nearbyHospitals: 'Nearby Hospitals',
      firstAid: 'First Aid',
      emergencyContacts: 'Emergency Contacts',
      symptoms: 'Emergency Symptoms',
      urgentCare: 'Urgent Care',
      ambulance: 'Ambulance',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      selectLanguage: 'Select Language',
      notifications: 'Notifications',
      privacy: 'Privacy',
      theme: 'Theme',
      account: 'Account',
      help: 'Help',
      about: 'About',
    },
  },

  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      back: 'पीछे',
      backToDashboard: 'डैशबोर्ड पर वापस जाएं',
      submit: 'जमा करें',
      reset: 'रीसेट करें',
      close: 'बंद करें',
      download: 'डाउनलोड करें',
      upload: 'अपलोड करें',
      search: 'खोजें',
      filter: 'फ़िल्टर करें',
      yes: 'हाँ',
      no: 'नहीं',
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      symptoms: 'लक्षण',
      appointments: 'अपॉइंटमेंट',
      medications: 'दवाइयाँ',
      emergency: 'आपातकालीन',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट',
    },
    dashboard: {
      welcome: 'स्वागत है',
      welcomeBack: 'वापसी पर स्वागत है',
      yourHealthHub: 'आपका स्वास्थ्य केंद्र',
      quickActions: 'त्वरित क्रियाएं',
      checkSymptoms: 'लक्षण जांचें',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      trackMedications: 'दवाइयों को ट्रैक करें',
      emergencyHelp: 'आपातकालीन सहायता',
      voiceConsultation: 'वॉइस परामर्श',
      imageAnalysis: 'चित्र विश्लेषण',
      healthMetrics: 'स्वास्थ्य मेट्रिक्स',
      recentActivity: 'हालिया गतिविधि',
      upcomingAppointments: 'आगामी अपॉइंटमेंट',
      medicationReminders: 'दवा अनुस्मारक',
    },
    symptomChecker: {
      title: 'एआई लक्षण जांचकर्ता',
      subtitle: 'तुरंत एआई-संचालित विश्लेषण के लिए अपने लक्षणों का वर्णन करें',
      enterSymptoms: 'अपने लक्षण दर्ज करें',
      placeholder: 'आप कैसा महसूस कर रहे हैं बताएं...',
      analyze: 'लक्षणों का विश्लेषण करें',
      analyzing: 'विश्लेषण हो रहा है...',
      results: 'विश्लेषण परिणाम',
      detectedSymptoms: 'पहचाने गए लक्षण',
      possibleConditions: 'संभावित स्थितियाँ',
      recommendations: 'सिफारिशें',
      severity: 'गंभीरता',
      confidence: 'विश्वास',
      chatWithAI: 'एआई से बात करें',
      typeMessage: 'अपना संदेश टाइप करें...',
      bertAnalysis: 'BERT एआई विश्लेषण',
      emotionalState: 'भावनात्मक स्थिति',
      contextualInsights: 'प्रासंगिक अंतर्दृष्टि',
      comparisonChart: 'एआई तुलना',
      bertVsTraditional: 'BERT एआई बनाम पारंपरिक',
    },
    appointments: {
      title: 'अपॉइंटमेंट शेड्यूलर',
      subtitle: 'हमारे विशेषज्ञ डॉक्टरों के साथ वीडियो परामर्श बुक करें',
      selectDoctor: 'डॉक्टर चुनें',
      selectDate: 'तारीख चुनें',
      selectTime: 'समय चुनें',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      yourAppointments: 'आपकी अपॉइंटमेंट',
      upcoming: 'आगामी',
      past: 'पिछला',
      canceled: 'रद्द किया गया',
      doctor: 'डॉक्टर',
      specialization: 'विशेषज्ञता',
      date: 'तारीख',
      time: 'समय',
      status: 'स्थिति',
      reason: 'कारण',
      symptoms: 'लक्षण',
      joinVideoCall: 'वीडियो कॉल में शामिल हों',
      cancelAppointment: 'अपॉइंटमेंट रद्द करें',
      reschedule: 'पुनर्निर्धारित करें',
    },
    medications: {
      title: 'दवा ट्रैकर',
      subtitle: 'अपनी दवाओं का प्रबंधन करें और पालन को ट्रैक करें',
      addMedication: 'दवा जोड़ें',
      medicineName: 'दवा का नाम',
      dosage: 'खुराक',
      frequency: 'आवृत्ति',
      timing: 'समय',
      startDate: 'शुरू होने की तारीख',
      endDate: 'समाप्ति तिथि',
      refillDate: 'रिफिल तारीख',
      yourMedications: 'आपकी दवाइयाँ',
      todaySchedule: 'आज का शेड्यूल',
      adherenceStats: 'पालन सांख्यिकी',
      interactions: 'दवा अंतःक्रियाएं',
      refillReminders: 'रिफिल अनुस्मारक',
      takeDose: 'खुराक लें',
      skipDose: 'खुराक छोड़ें',
      markTaken: 'लिया गया के रूप में चिह्नित करें',
    },
    voiceConsultation: {
      title: 'वॉइस परामर्श',
      subtitle: 'हमारे एआई स्वास्थ्य सहायक से बात करें',
      startListening: 'सुनना शुरू करें',
      stopListening: 'सुनना बंद करें',
      listening: 'सुन रहे हैं...',
      processing: 'प्रोसेस हो रहा है...',
      speak: 'बोलें',
      transcript: 'प्रतिलिपि',
      aiResponse: 'एआई प्रतिक्रिया',
      language: 'भाषा',
      selectLanguage: 'भाषा चुनें',
    },
    emergency: {
      title: 'आपातकालीन प्रतिक्रिया',
      subtitle: 'चिकित्सा आपात स्थिति में तत्काल सहायता प्राप्त करें',
      callEmergency: 'आपातकालीन कॉल करें',
      nearbyHospitals: 'निकटतम अस्पताल',
      firstAid: 'प्राथमिक चिकित्सा',
      emergencyContacts: 'आपातकालीन संपर्क',
      symptoms: 'आपातकालीन लक्षण',
      urgentCare: 'तत्काल देखभाल',
      ambulance: 'एम्बुलेंस',
    },
    auth: {
      login: 'लॉगिन',
      signup: 'साइन अप',
      logout: 'लॉग आउट',
      email: 'ईमेल',
      password: 'पासवर्ड',
      name: 'नाम',
      forgotPassword: 'पासवर्ड भूल गए?',
      rememberMe: 'मुझे याद रखें',
      noAccount: 'खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
    },
    settings: {
      title: 'सेटिंग्स',
      language: 'भाषा',
      selectLanguage: 'भाषा चुनें',
      notifications: 'सूचनाएं',
      privacy: 'गोपनीयता',
      theme: 'थीम',
      account: 'खाता',
      help: 'सहायता',
      about: 'के बारे में',
    },
  },

  bn: {
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফলতা',
      cancel: 'বাতিল করুন',
      save: 'সংরক্ষণ করুন',
      delete: 'মুছে ফেলুন',
      edit: 'সম্পাদনা করুন',
      back: 'পিছনে',
      backToDashboard: 'ড্যাশবোর্ডে ফিরে যান',
      submit: 'জমা দিন',
      reset: 'রিসেট করুন',
      close: 'বন্ধ করুন',
      download: 'ডাউনলোড করুন',
      upload: 'আপলোড করুন',
      search: 'খুঁজুন',
      filter: 'ফিল্টার করুন',
      yes: 'হ্যাঁ',
      no: 'না',
    },
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      symptoms: 'লক্ষণ',
      appointments: 'অ্যাপয়েন্টমেন্ট',
      medications: 'ওষুধ',
      emergency: 'জরুরী',
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      logout: 'লগ আউট',
    },
    dashboard: {
      welcome: 'স্বাগতম',
      welcomeBack: 'ফিরে আসার জন্য স্বাগতম',
      yourHealthHub: 'আপনার স্বাস্থ্য কেন্দ্র',
      quickActions: 'দ্রুত ক্রিয়া',
      checkSymptoms: 'লক্ষণ পরীক্ষা করুন',
      bookAppointment: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      trackMedications: 'ওষুধ ট্র্যাক করুন',
      emergencyHelp: 'জরুরী সাহায্য',
      voiceConsultation: 'ভয়েস পরামর্শ',
      imageAnalysis: 'চিত্র বিশ্লেষণ',
      healthMetrics: 'স্বাস্থ্য মেট্রিক্স',
      recentActivity: 'সাম্প্রতিক কার্যকলাপ',
      upcomingAppointments: 'আগামী অ্যাপয়েন্টমেন্ট',
      medicationReminders: 'ওষুধের অনুস্মারক',
    },
    symptomChecker: {
      title: 'এআই লক্ষণ পরীক্ষক',
      subtitle: 'তাৎক্ষণিক এআই-চালিত বিশ্লেষণের জন্য আপনার লক্ষণ বর্ণনা করুন',
      enterSymptoms: 'আপনার লক্ষণ প্রবেশ করান',
      placeholder: 'আপনি কেমন অনুভব করছেন তা বর্ণনা করুন...',
      analyze: 'লক্ষণ বিশ্লেষণ করুন',
      analyzing: 'বিশ্লেষণ হচ্ছে...',
      results: 'বিশ্লেষণ ফলাফল',
      detectedSymptoms: 'সনাক্ত করা লক্ষণ',
      possibleConditions: 'সম্ভাব্য অবস্থা',
      recommendations: 'সুপারিশ',
      severity: 'তীব্রতা',
      confidence: 'আস্থা',
      chatWithAI: 'এআই এর সাথে চ্যাট করুন',
      typeMessage: 'আপনার বার্তা টাইপ করুন...',
      bertAnalysis: 'BERT এআই বিশ্লেষণ',
      emotionalState: 'মানসিক অবস্থা',
      contextualInsights: 'প্রাসঙ্গিক অন্তর্দৃষ্টি',
      comparisonChart: 'এআই তুলনা',
      bertVsTraditional: 'BERT এআই বনাম ঐতিহ্যবাহী',
    },
    appointments: {
      title: 'অ্যাপয়েন্টমেন্ট শিডিউলার',
      subtitle: 'আমাদের বিশেষজ্ঞ ডাক্তারদের সাথে ভিডিও পরামর্শ বুক করুন',
      selectDoctor: 'ডাক্তার নির্বাচন করুন',
      selectDate: 'তারিখ নির্বাচন করুন',
      selectTime: 'সময় নির্বাচন করুন',
      bookAppointment: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      yourAppointments: 'আপনার অ্যাপয়েন্টমেন্ট',
      upcoming: 'আসন্ন',
      past: 'অতীত',
      canceled: 'বাতিল করা হয়েছে',
      doctor: 'ডাক্তার',
      specialization: 'বিশেষত্ব',
      date: 'তারিখ',
      time: 'সময়',
      status: 'অবস্থা',
      reason: 'কারণ',
      symptoms: 'লক্ষণ',
      joinVideoCall: 'ভিডিও কলে যোগ দিন',
      cancelAppointment: 'অ্যাপয়েন্টমেন্ট বাতিল করুন',
      reschedule: 'পুনঃনির্ধারণ করুন',
    },
    medications: {
      title: 'ওষুধ ট্র্যাকার',
      subtitle: 'আপনার ওষুধ পরিচালনা করুন এবং আনুগত্য ট্র্যাক করুন',
      addMedication: 'ওষুধ যোগ করুন',
      medicineName: 'ওষুধের নাম',
      dosage: 'ডোজ',
      frequency: 'ফ্রিকোয়েন্সি',
      timing: 'সময়',
      startDate: 'শুরুর তারিখ',
      endDate: 'শেষ তারিখ',
      refillDate: 'রিফিল তারিখ',
      yourMedications: 'আপনার ওষুধ',
      todaySchedule: 'আজকের সূচি',
      adherenceStats: 'আনুগত্য পরিসংখ্যান',
      interactions: 'ওষুধের মিথস্ক্রিয়া',
      refillReminders: 'রিফিল অনুস্মারক',
      takeDose: 'ডোজ নিন',
      skipDose: 'ডোজ এড়িয়ে যান',
      markTaken: 'নেওয়া হিসাবে চিহ্নিত করুন',
    },
    voiceConsultation: {
      title: 'ভয়েস পরামর্শ',
      subtitle: 'আমাদের এআই স্বাস্থ্য সহায়কের সাথে কথা বলুন',
      startListening: 'শোনা শুরু করুন',
      stopListening: 'শোনা বন্ধ করুন',
      listening: 'শুনছে...',
      processing: 'প্রক্রিয়াকরণ হচ্ছে...',
      speak: 'বলুন',
      transcript: 'প্রতিলিপি',
      aiResponse: 'এআই প্রতিক্রিয়া',
      language: 'ভাষা',
      selectLanguage: 'ভাষা নির্বাচন করুন',
    },
    emergency: {
      title: 'জরুরী প্রতিক্রিয়া',
      subtitle: 'চিকিৎসা জরুরী অবস্থায় তাৎক্ষণিক সাহায্য পান',
      callEmergency: 'জরুরী কল করুন',
      nearbyHospitals: 'নিকটবর্তী হাসপাতাল',
      firstAid: 'প্রাথমিক চিকিৎসা',
      emergencyContacts: 'জরুরী যোগাযোগ',
      symptoms: 'জরুরী লক্ষণ',
      urgentCare: 'জরুরী যত্ন',
      ambulance: 'অ্যাম্বুলেন্স',
    },
    auth: {
      login: 'লগইন',
      signup: 'সাইন আপ',
      logout: 'লগ আউট',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      name: 'নাম',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      rememberMe: 'আমাকে মনে রাখুন',
      noAccount: 'অ্যাকাউন্ট নেই?',
      haveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
    },
    settings: {
      title: 'সেটিংস',
      language: 'ভাষা',
      selectLanguage: 'ভাষা নির্বাচন করুন',
      notifications: 'বিজ্ঞপ্তি',
      privacy: 'গোপনীয়তা',
      theme: 'থিম',
      account: 'অ্যাকাউন্ট',
      help: 'সাহায্য',
      about: 'সম্পর্কে',
    },
  },
};

export type Language = 'en' | 'hi' | 'bn';

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
};

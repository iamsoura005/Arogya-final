/**
 * Health Card Generator Service
 * Creates shareable Instagram-style health graphics
 */

// ============= TYPES =============

export interface HealthCard {
  id: string;
  userId: string;
  type: 'achievement' | 'summary' | 'milestone' | 'streak' | 'vitals' | 'story' | 'before-after' | 'quote' | 'stats';
  title: string;
  subtitle?: string;
  data: Record<string, any>;
  theme: 'gradient-purple' | 'gradient-blue' | 'gradient-green' | 'gradient-pink' | 'solid-medical' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest';
  imageUrl?: string;
  createdAt: string;
  format?: 'square' | 'story' | 'post'; // Instagram formats
}

export interface CardTemplate {
  type: HealthCard['type'];
  title: string;
  description: string;
  requiredData: string[];
  previewImage: string;
}

// ============= TEMPLATES =============

export const cardTemplates: CardTemplate[] = [
  {
    type: 'achievement',
    title: 'Health Achievement',
    description: 'Celebrate health milestones and goals reached',
    requiredData: ['achievement', 'icon', 'date'],
    previewImage: '/templates/achievement.png'
  },
  {
    type: 'summary',
    title: 'Weekly Health Summary',
    description: 'Overview of your week in health metrics',
    requiredData: ['consultations', 'medications', 'biomarkers'],
    previewImage: '/templates/summary.png'
  },
  {
    type: 'milestone',
    title: 'Health Milestone',
    description: 'Mark important health milestones',
    requiredData: ['milestone', 'value', 'progress'],
    previewImage: '/templates/milestone.png'
  },
  {
    type: 'streak',
    title: 'Medication Streak',
    description: 'Show your medication adherence streak',
    requiredData: ['days', 'percentage', 'medicine'],
    previewImage: '/templates/streak.png'
  },
  {
    type: 'vitals',
    title: 'Vital Signs Summary',
    description: 'Display your latest vital measurements',
    requiredData: ['bloodPressure', 'heartRate', 'temperature'],
    previewImage: '/templates/vitals.png'
  },
  {
    type: 'story',
    title: 'Instagram Story',
    description: '9:16 vertical format perfect for Instagram Stories',
    requiredData: ['mainText', 'subText', 'emoji'],
    previewImage: '/templates/story.png'
  },
  {
    type: 'before-after',
    title: 'Before & After',
    description: 'Show your health transformation journey',
    requiredData: ['beforeValue', 'afterValue', 'metric', 'timeframe'],
    previewImage: '/templates/before-after.png'
  },
  {
    type: 'quote',
    title: 'Health Motivation Quote',
    description: 'Inspirational health quotes to share',
    requiredData: ['quote', 'author'],
    previewImage: '/templates/quote.png'
  },
  {
    type: 'stats',
    title: 'Health Stats Card',
    description: 'Showcase your health statistics beautifully',
    requiredData: ['stat1', 'stat2', 'stat3', 'stat4'],
    previewImage: '/templates/stats.png'
  }
];

// ============= CARD GENERATION =============

/**
 * Create health card
 */
export function createHealthCard(
  userId: string,
  cardData: Omit<HealthCard, 'id' | 'userId' | 'createdAt' | 'imageUrl'>
): HealthCard {
  const card: HealthCard = {
    id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...cardData,
    createdAt: new Date().toISOString()
  };

  const cards = getStoredCards();
  cards.push(card);
  localStorage.setItem('arogya_health_cards', JSON.stringify(cards));

  return card;
}

/**
 * Get stored health cards
 */
function getStoredCards(): HealthCard[] {
  const stored = localStorage.getItem('arogya_health_cards');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get user's health cards
 */
export function getUserHealthCards(userId: string): HealthCard[] {
  const cards = getStoredCards();
  return cards
    .filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Generate canvas-based health card image
 */
export async function generateCardImage(card: HealthCard): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; // Instagram square
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas not supported');

  // Apply theme gradient
  applyTheme(ctx, canvas, card.theme);

  // Add content based on card type
  switch (card.type) {
    case 'achievement':
      drawAchievementCard(ctx, canvas, card);
      break;
    case 'summary':
      drawSummaryCard(ctx, canvas, card);
      break;
    case 'milestone':
      drawMilestoneCard(ctx, canvas, card);
      break;
    case 'streak':
      drawStreakCard(ctx, canvas, card);
      break;
    case 'vitals':
      drawVitalsCard(ctx, canvas, card);
      break;
  }

  // Add Arogya branding
  drawBranding(ctx, canvas);

  return canvas.toDataURL('image/png');
}

/**
 * Apply theme to canvas
 */
function applyTheme(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, theme: HealthCard['theme']): void {
  const gradients: Record<string, { start: string; end: string }> = {
    'gradient-purple': { start: '#667eea', end: '#764ba2' },
    'gradient-blue': { start: '#4facfe', end: '#00f2fe' },
    'gradient-green': { start: '#43e97b', end: '#38f9d7' },
    'gradient-pink': { start: '#fa709a', end: '#fee140' },
    'solid-medical': { start: '#ffffff', end: '#f0f4f8' }
  };

  const colors = gradients[theme];
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw achievement card
 */
function drawAchievementCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, card: HealthCard): void {
  // Icon/Trophy (emoji or shape)
  ctx.font = 'bold 200px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('🏆', canvas.width / 2, 300);

  // Achievement text
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(card.title, canvas.width / 2, 550);

  // Subtitle
  if (card.subtitle) {
    ctx.font = '50px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(card.subtitle, canvas.width / 2, 650);
  }

  // Achievement details
  ctx.font = '40px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const date = new Date(card.data.date).toLocaleDateString();
  ctx.fillText(date, canvas.width / 2, 750);
}

/**
 * Draw summary card
 */
function drawSummaryCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, card: HealthCard): void {
  // Title
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Weekly Health Summary', canvas.width / 2, 150);

  // Stats grid
  const stats = [
    { label: 'Consultations', value: card.data.consultations || 0, icon: '💬' },
    { label: 'Medications', value: card.data.medications || 0, icon: '💊' },
    { label: 'Biomarkers', value: card.data.biomarkers || 0, icon: '📊' },
    { label: 'Adherence', value: `${card.data.adherence || 0}%`, icon: '✅' }
  ];

  const gridY = 300;
  const gridSpacing = 150;

  stats.forEach((stat, i) => {
    const y = gridY + i * gridSpacing;
    
    // Icon
    ctx.font = '60px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(stat.icon, 200, y);

    // Label
    ctx.font = '45px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(stat.label, 300, y);

    // Value
    ctx.font = 'bold 55px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(String(stat.value), canvas.width - 200, y);
  });
}

/**
 * Draw milestone card
 */
function drawMilestoneCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, card: HealthCard): void {
  // Title
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Health Milestone', canvas.width / 2, 150);

  // Milestone icon
  ctx.font = '150px Arial';
  ctx.fillText('🎯', canvas.width / 2, 350);

  // Milestone name
  ctx.font = 'bold 65px Arial';
  ctx.fillText(card.data.milestone, canvas.width / 2, 550);

  // Progress bar
  const barWidth = 700;
  const barHeight = 50;
  const barX = (canvas.width - barWidth) / 2;
  const barY = 650;

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Progress
  const progress = Math.min(card.data.progress || 0, 100);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);

  // Progress text
  ctx.font = 'bold 50px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${progress}% Complete`, canvas.width / 2, barY + 120);
}

/**
 * Draw streak card
 */
function drawStreakCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, card: HealthCard): void {
  // Fire emoji for streak
  ctx.font = '180px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🔥', canvas.width / 2, 300);

  // Days
  ctx.font = 'bold 140px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(card.data.days), canvas.width / 2, 500);

  // Label
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Day Streak', canvas.width / 2, 600);

  // Medicine name
  ctx.font = '50px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(card.data.medicine, canvas.width / 2, 700);

  // Adherence percentage
  ctx.font = 'bold 50px Arial';
  ctx.fillStyle = '#4ade80';
  ctx.fillText(`${card.data.percentage}% Adherence`, canvas.width / 2, 800);
}

/**
 * Draw vitals card
 */
function drawVitalsCard(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, card: HealthCard): void {
  // Title
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Vital Signs', canvas.width / 2, 150);

  // Vitals
  const vitals = [
    {
      icon: '❤️',
      label: 'Blood Pressure',
      value: card.data.bloodPressure || 'N/A',
      unit: 'mmHg'
    },
    {
      icon: '💓',
      label: 'Heart Rate',
      value: card.data.heartRate || 'N/A',
      unit: 'bpm'
    },
    {
      icon: '🌡️',
      label: 'Temperature',
      value: card.data.temperature || 'N/A',
      unit: '°F'
    },
    {
      icon: '🫁',
      label: 'SpO2',
      value: card.data.spo2 || 'N/A',
      unit: '%'
    }
  ];

  const startY = 300;
  const spacing = 150;

  vitals.forEach((vital, i) => {
    const y = startY + i * spacing;

    // Icon
    ctx.font = '70px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(vital.icon, 150, y);

    // Label
    ctx.font = '50px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(vital.label, 250, y);

    // Value
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${vital.value} ${vital.unit}`, canvas.width - 150, y);
  });
}

/**
 * Draw branding
 */
function drawBranding(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  // Logo/Brand text at bottom
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Arogya Health', canvas.width / 2, canvas.height - 100);

  // Tagline
  ctx.font = '35px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('Your AI Health Companion', canvas.width / 2, canvas.height - 50);
}

/**
 * Download card as image
 */
export async function downloadHealthCard(card: HealthCard): Promise<void> {
  const imageData = await generateCardImage(card);
  
  // Create download link
  const link = document.createElement('a');
  link.download = `arogya-health-card-${card.id}.png`;
  link.href = imageData;
  link.click();
}

/**
 * Share card to social media
 */
export async function shareHealthCard(card: HealthCard, platform: 'instagram' | 'facebook' | 'twitter'): Promise<void> {
  const imageData = await generateCardImage(card);
  
  // Convert to blob
  const blob = await (await fetch(imageData)).blob();
  const file = new File([blob], 'health-card.png', { type: 'image/png' });

  // Use Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: card.title,
        text: card.subtitle || 'Check out my health progress!',
        files: [file]
      });
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to download
      await downloadHealthCard(card);
    }
  } else {
    // Fallback for platforms without Web Share API
    const shareUrls: Record<string, string> = {
      instagram: 'https://www.instagram.com/',
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(card.title)}&url=${encodeURIComponent(window.location.href)}`
    };

    window.open(shareUrls[platform], '_blank');
  }
}

/**
 * Generate quick achievement card
 */
export function generateAchievementCard(
  userId: string,
  achievement: string,
  subtitle: string
): HealthCard {
  return createHealthCard(userId, {
    type: 'achievement',
    title: achievement,
    subtitle,
    data: {
      achievement,
      icon: '🏆',
      date: new Date().toISOString()
    },
    theme: 'gradient-purple'
  });
}

/**
 * Generate weekly summary card
 */
export function generateWeeklySummaryCard(
  userId: string,
  stats: {
    consultations: number;
    medications: number;
    biomarkers: number;
    adherence: number;
  }
): HealthCard {
  return createHealthCard(userId, {
    type: 'summary',
    title: 'Weekly Health Summary',
    subtitle: `Week of ${new Date().toLocaleDateString()}`,
    data: stats,
    theme: 'gradient-blue'
  });
}

/**
 * Generate medication streak card
 */
export function generateStreakCard(
  userId: string,
  medicineName: string,
  days: number,
  percentage: number
): HealthCard {
  return createHealthCard(userId, {
    type: 'streak',
    title: `${days}-Day Streak!`,
    subtitle: medicineName,
    data: {
      medicine: medicineName,
      days,
      percentage
    },
    theme: 'gradient-pink'
  });
}

export default {
  cardTemplates,
  createHealthCard,
  getUserHealthCards,
  generateCardImage,
  downloadHealthCard,
  shareHealthCard,
  generateAchievementCard,
  generateWeeklySummaryCard,
  generateStreakCard
};

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWidget } from '@/lib/firestore';
import ReservationForm from '@/components/ReservationForm';

export default function WidgetPage() {
  const params = useParams();
  const widgetId = params.widgetId;
  
  const [config, setConfig] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWidget();
  }, [widgetId]);

  const loadWidget = async () => {
    console.log('🔍 Chargement du widget:', widgetId);
    
    const result = await getWidget(widgetId);
    
    console.log('📦 Résultat getWidget:', result);
    
    if (result.success) {
      console.log('✅ Widget trouvé:', result.data);
      console.log('👤 userId du widget:', result.data.userId);
      
      setConfig(result.data.config);
      setUserId(result.data.userId);
    } else {
      console.error('❌ Widget non trouvé');
      setError('Widget introuvable');
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">❌ {error || 'Configuration introuvable'}</p>
        </div>
      </div>
    );
  }

  console.log('🚀 Rendu du ReservationForm avec userId:', userId);

  return (
    <div className="min-h-screen" style={{ 
      background: `linear-gradient(to bottom right, ${config.branding?.primaryColor || '#2563eb'}10, ${config.branding?.accentColor || '#3b82f6'}10)`
    }}>
      <ReservationForm 
        config={config} 
        widgetId={widgetId}
        userId={userId}
      />
    </div>
  );
}
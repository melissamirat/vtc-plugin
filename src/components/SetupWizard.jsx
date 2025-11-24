'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Étapes du wizard
import WizardStep0Welcome from './wizard/WizardStep0Welcome';
import WizardStep1Vehicle from './wizard/WizardStep1Vehicle';
import WizardStep2Zone from './wizard/WizardStep2Zone';
import WizardStep3Package from './wizard/WizardStep3Package';
import WizardStep4Education from './wizard/WizardStep4Education';
import WizardStep5Payment from './wizard/WizardStep5Payment';

const TOTAL_STEPS = 6;

export default function SetupWizard({ widgetId, userId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    vehicle: null,
    zone: null,
    package: null,
    payment: {
      methods: ['cash'],
    },
    completedSteps: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charger les données sauvegardées (pour reprendre où on s'est arrêté)
  useEffect(() => {
    loadWizardProgress();
  }, [widgetId]);

  const loadWizardProgress = async () => {
    if (!widgetId) {
      setLoading(false);
      return;
    }

    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      const widgetSnap = await getDoc(widgetRef);

      if (widgetSnap.exists()) {
        const data = widgetSnap.data();
        
        // Vérifier si le wizard est déjà complété
        if (data.setupCompleted) {
          onComplete?.();
          return;
        }

        // Reprendre la progression
        if (data.wizardProgress) {
          setWizardData(data.wizardProgress);
          setCurrentStep(data.wizardProgress.lastStep || 0);
        }
      }
    } catch (error) {
      console.error('Erreur chargement progression wizard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder la progression à chaque étape
  const saveProgress = async (stepData, stepNumber) => {
    if (!widgetId) return;

    setSaving(true);
    try {
      const widgetRef = doc(db, 'widgets', widgetId);
      
      const newWizardData = {
        ...wizardData,
        ...stepData,
        lastStep: stepNumber,
        completedSteps: [...new Set([...wizardData.completedSteps, stepNumber])],
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(widgetRef, {
        wizardProgress: newWizardData,
      });

      setWizardData(newWizardData);
    } catch (error) {
      console.error('Erreur sauvegarde progression:', error);
    } finally {
      setSaving(false);
    }
  };

  // Finaliser le wizard et appliquer la configuration
  const finalizeSetup = async () => {
    console.log('🚀 Finalisation du setup...');
    console.log('Widget ID:', widgetId);
    console.log('Wizard Data:', wizardData);

    if (!widgetId) {
      console.error('❌ Pas de widgetId !');
      alert('Erreur: Widget non trouvé. Veuillez rafraîchir la page.');
      return;
    }

    setSaving(true);
    try {
      const widgetRef = doc(db, 'widgets', widgetId);

      // Construire la configuration finale
      const updateData = {
        setupCompleted: true,
        setupCompletedAt: new Date().toISOString(),
        wizardProgress: null,
        updatedAt: new Date(),
      };

      // Ajouter les véhicules
      if (wizardData.vehicle) {
        updateData['config.vehicleCategories'] = [wizardData.vehicle];
      }

      // Ajouter les zones
      if (wizardData.zone) {
        updateData['config.serviceZones'] = [wizardData.zone];
      }

      // Ajouter les forfaits
      if (wizardData.package) {
        updateData['config.packages'] = [wizardData.package];
      }

      // Ajouter les paiements
      if (wizardData.payment?.methods) {
        updateData['config.paymentModes'] = {
          driver: { enabled: true, label: 'Paiement à bord' },
          methods: wizardData.payment.methods,
          online: { enabled: false, label: 'Paiement en ligne', requiresDeposit: false, depositPercent: 30 },
        };
      }

      console.log('📦 Données à sauvegarder:', updateData);

      await updateDoc(widgetRef, updateData);

      console.log('✅ Setup finalisé avec succès !');
      
      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erreur finalisation setup:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async (stepData) => {
    await saveProgress(stepData, currentStep);
    
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finalizeSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await saveProgress({}, currentStep);
    
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre configuration...</p>
        </div>
      </div>
    );
  }

  // Barre de progression
  const ProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
      />
    </div>
  );

  // Indicateurs d'étapes
  const StepIndicators = () => (
    <div className="flex justify-center gap-2 mb-6">
      {[...Array(TOTAL_STEPS)].map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentStep
              ? 'bg-indigo-600 scale-125'
              : index < currentStep || wizardData.completedSteps.includes(index)
              ? 'bg-green-500'
              : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const stepProps = {
    wizardData,
    onNext: handleNext,
    onBack: handleBack,
    onSkip: handleSkip,
    saving,
    widgetId,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header avec progression */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ProgressBar />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Étape {currentStep + 1} sur {TOTAL_STEPS}
            </p>
            {saving && (
              <p className="text-xs text-indigo-600 flex items-center gap-1">
                <span className="animate-spin">⏳</span> Sauvegarde...
              </p>
            )}
          </div>
          <StepIndicators />
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 0 && <WizardStep0Welcome {...stepProps} />}
        {currentStep === 1 && <WizardStep1Vehicle {...stepProps} />}
        {currentStep === 2 && <WizardStep2Zone {...stepProps} />}
        {currentStep === 3 && <WizardStep3Package {...stepProps} />}
        {currentStep === 4 && <WizardStep4Education {...stepProps} />}
        {currentStep === 5 && <WizardStep5Payment {...stepProps} />}
      </div>
    </div>
  );
}
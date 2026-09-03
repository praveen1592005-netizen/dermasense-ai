import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Globe,
  Sparkles,
  ShieldCheck,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { UnsavedChangesModal } from '../common/UnsavedChangesModal';
import { COMMON_SKIN_CONCERNS, SUPPORTED_LANGUAGES } from '../../utils/constants';
import { profileService } from '../../services/profileService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedData: any) => Promise<void>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const profile = user?.profile || {};
  const skin = profile.skinProfile || {};
  const addr = profile.addressStructured || {};

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [streetAddress, setStreetAddress] = useState(addr.streetAddress || '');
  const [city, setCity] = useState(addr.city || '');
  const [stateName, setStateName] = useState(addr.state || '');
  const [postalCode, setPostalCode] = useState(addr.postalCode || '');
  const [country, setCountry] = useState(addr.country || 'India');
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage || 'en');

  // Skin Profile
  const [skinType, setSkinType] = useState(skin.skinType || profile.skinType || 'combination');
  const [sensitivity, setSensitivity] = useState(skin.sensitivity || 'moderate');
  const [primaryConcerns, setPrimaryConcerns] = useState<string[]>(skin.primaryConcerns || profile.skinConcerns || []);
  const [secondaryConcerns, setSecondaryConcerns] = useState<string[]>(skin.secondaryConcerns || []);
  const [currentRoutine, setCurrentRoutine] = useState(skin.currentRoutine || '');

  // Aadhaar State
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');

  // Unsaved changes & saving state
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const p = user?.profile || {};
      const s = p.skinProfile || {};
      const a = p.addressStructured || {};
      
      setFullName(user?.fullName || '');
      setAge(p.age?.toString() || '');
      setPhone(p.phone || '');
      setStreetAddress(a.streetAddress || '');
      setCity(a.city || '');
      setStateName(a.state || '');
      setPostalCode(a.postalCode || '');
      setCountry(a.country || 'India');
      setPreferredLanguage(p.preferredLanguage || 'en');
      setSkinType(s.skinType || p.skinType || 'combination');
      setSensitivity(s.sensitivity || 'moderate');
      setPrimaryConcerns(s.primaryConcerns || p.skinConcerns || []);
      setSecondaryConcerns(s.secondaryConcerns || []);
      setCurrentRoutine(s.currentRoutine || '');
      setAadhaarInput('');
      setAadhaarError('');
      setIsDirty(false);
      setFormError('');
    }
  }, [isOpen, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const togglePrimaryConcern = (c: string) => {
    markDirty();
    if (primaryConcerns.includes(c)) {
      setPrimaryConcerns(primaryConcerns.filter((item) => item !== c));
    } else {
      setPrimaryConcerns([...primaryConcerns, c]);
    }
  };

  const toggleSecondaryConcern = (c: string) => {
    markDirty();
    if (secondaryConcerns.includes(c)) {
      setSecondaryConcerns(secondaryConcerns.filter((item) => item !== c));
    } else {
      setSecondaryConcerns([...secondaryConcerns, c]);
    }
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    let processedAadhaar = profile.aadhaar;
    if (aadhaarInput.trim()) {
      try {
        processedAadhaar = profileService.processAadhaarInput(aadhaarInput.trim());
      } catch (err: any) {
        setAadhaarError(err.message || 'Invalid Aadhaar number');
        return;
      }
    }

    setFormError('');
    setAadhaarError('');
    setIsSaving(true);

    try {
      const updatedData = {
        fullName: fullName.trim(),
        profile: {
          age: parseInt(age) || undefined,
          phone: phone.trim(),
          preferredLanguage,
          addressStructured: {
            streetAddress: streetAddress.trim(),
            city: city.trim(),
            state: stateName.trim(),
            postalCode: postalCode.trim(),
            country: country.trim() || 'India',
          },
          skinProfile: {
            skinType: skinType as any,
            sensitivity: sensitivity as any,
            primaryConcerns,
            secondaryConcerns,
            currentRoutine: currentRoutine.trim(),
          },
          aadhaar: processedAadhaar,
          isProfileCompleted: true,
        },
      };

      await onSave(updatedData);
      setIsDirty(false);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Unable to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleRequestClose}
        title="Edit Profile Information"
        description="Update your personal details, structured address, and skin profile parameters."
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-brand-500" />
              1. Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. Dr. Alex Morgan"
                />
              </div>
              <div>
                <Input
                  label="Age"
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. 29"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  markDirty();
                }}
                placeholder="+1 (555) 234-5678"
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Select
                label="Preferred Language"
                value={preferredLanguage}
                onChange={(e) => {
                  setPreferredLanguage(e.target.value);
                  markDirty();
                }}
                options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
                leftIcon={<Globe className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Section 2: Structured Address */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-tealBrand-500" />
              2. Structured Address
            </h4>

            <Input
              label="Street Address / Line"
              value={streetAddress}
              onChange={(e) => {
                setStreetAddress(e.target.value);
                markDirty();
              }}
              placeholder="e.g. 450 Health Avenue, Suite 100"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="City"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Mumbai"
              />
              <Input
                label="State"
                value={stateName}
                onChange={(e) => {
                  setStateName(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Maharashtra"
              />
              <Input
                label="Postal / PIN Code"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. 400001"
              />
              <Input
                label="Country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  markDirty();
                }}
                placeholder="India"
              />
            </div>
          </div>

          {/* Section 3: Skin Profile */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-brand-500" />
              3. Skin Profile & Characteristics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Skin Type"
                value={skinType}
                onChange={(e) => {
                  setSkinType(e.target.value);
                  markDirty();
                }}
                options={[
                  { value: 'combination', label: 'Combination' },
                  { value: 'oily', label: 'Oily' },
                  { value: 'dry', label: 'Dry' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'sensitive', label: 'Sensitive' },
                  { value: 'unsure', label: 'Unsure' },
                ]}
              />

              <Select
                label="Skin Sensitivity"
                value={sensitivity}
                onChange={(e) => {
                  setSensitivity(e.target.value);
                  markDirty();
                }}
                options={[
                  { value: 'none', label: 'None / Resilient' },
                  { value: 'low', label: 'Low Sensitivity' },
                  { value: 'moderate', label: 'Moderate Sensitivity' },
                  { value: 'high', label: 'High / Reactive' },
                ]}
              />
            </div>

            {/* Primary Concerns */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Primary Concerns (Choose key focus areas)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKIN_CONCERNS.slice(0, 6).map((c) => {
                  const sel = primaryConcerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => togglePrimaryConcern(c)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                        sel
                          ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                          : 'bg-white dark:bg-darkBg-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Concerns */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Secondary Concerns (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKIN_CONCERNS.slice(6).map((c) => {
                  const sel = secondaryConcerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleSecondaryConcern(c)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                        sel
                          ? 'bg-tealBrand-500 text-white border-tealBrand-500 shadow-xs'
                          : 'bg-white dark:bg-darkBg-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Current Routine Description"
              value={currentRoutine}
              onChange={(e) => {
                setCurrentRoutine(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Cleanser, Hyaluronic Acid serum, Sunscreen SPF 50"
            />
          </div>

          {/* Section 4: Aadhaar (Optional & Masked) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigoBrand-500" />
              4. National ID / Aadhaar (Optional)
            </h4>

            <Input
              label="12-Digit Aadhaar Number"
              type="password"
              maxLength={12}
              value={aadhaarInput}
              onChange={(e) => {
                setAadhaarInput(e.target.value.replace(/\D/g, ''));
                markDirty();
              }}
              placeholder={profile.aadhaar?.maskedNumber || 'Enter 12 digits (will be securely masked)'}
              error={aadhaarError}
              helperText="Encrypted upon entry. Only the masked format (•••• •••• 1234) is retained in the view."
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleRequestClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Unsaved changes prompt */}
      <UnsavedChangesModal
        isOpen={showUnsavedPrompt}
        onStay={() => setShowUnsavedPrompt(false)}
        onDiscard={() => {
          setShowUnsavedPrompt(false);
          setIsDirty(false);
          onClose();
        }}
      />
    </>
  );
};

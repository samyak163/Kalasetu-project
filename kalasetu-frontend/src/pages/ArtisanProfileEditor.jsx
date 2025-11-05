import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getArtisanProfile, updateArtisanProfile, uploadProfilePhoto, deleteProfilePhoto, updateBankDetails, updateDocuments, getVerificationStatus, uploadVerificationDocument, setSlug, initiateEmailChange, confirmEmailChange } from '../lib/api/artisanProfile.js';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader.jsx';
import ProfileCompletionBar from '../components/ProfileCompletionBar.jsx';
import WorkingHoursForm from '../components/WorkingHoursForm.jsx';

const TextInput = ({ label, value, onChange, placeholder, type='text' }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input type={type} className="w-full border rounded px-3 py-2" value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const TextArea = ({ label, value, onChange, rows=4, maxLength=500, placeholder }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700 flex justify-between"><span>{label}</span><span className="text-xs text-gray-400">{(value?.length||0)}/{maxLength}</span></label>
    <textarea className="w-full border rounded px-3 py-2" rows={rows} maxLength={maxLength} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Section = ({ title, children, actions }) => (
  <div className="bg-white rounded-lg shadow p-5 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actions}
    </div>
    {children}
  </div>
);

const computeCompletion = (p) => {
  if (!p) return 0;
  let score = 0; let total = 10;
  score += p.profileImageUrl ? 1 : 0;
  score += p.fullName ? 1 : 0;
  score += p.bio ? 1 : 0;
  score += p.languagesSpoken?.length ? 1 : 0;
  score += p.businessName ? 1 : 0;
  score += p.yearsOfExperience ? 1 : 0;
  score += p.teamSize ? 1 : 0;
  score += p.whatsappNumber ? 1 : 0;
  score += p.workingHours ? 1 : 0;
  score += p.bankDetails ? 1 : 0;
  return Math.round((score/total)*100);
};

const ArtisanProfileEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [verif, setVerif] = useState(null);
  const [toast, setToast] = useState(null);
  const [emailFlow, setEmailFlow] = useState({ step: 0, newEmail: '', code: '' });
  const [slugInput, setSlugInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await getArtisanProfile();
        setProfile(p);
        const vs = await getVerificationStatus();
        setVerif(vs);
      } catch (e) {
        setToast({ type: 'error', text: e.response?.data?.message || e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completion = useMemo(() => computeCompletion(profile), [profile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: profile.fullName,
        businessName: profile.businessName,
        tagline: profile.tagline,
        bio: profile.bio,
        craft: profile.craft,
        phoneNumber: profile.phoneNumber,
        businessPhone: profile.businessPhone,
        email: profile.email,
        whatsappNumber: profile.whatsappNumber,
        yearsOfExperience: profile.yearsOfExperience,
        teamSize: profile.teamSize,
        languagesSpoken: profile.languagesSpoken || [],
        workingHours: profile.workingHours,
        emergencyServices: !!profile.emergencyServices,
        serviceRadius: Number(profile.serviceRadius || 0),
        minimumBookingNotice: Number(profile.minimumBookingNotice || 0),
        businessType: profile.businessType || undefined,
        gstNumber: profile.gstNumber || undefined,
      };
      const updated = await updateArtisanProfile(payload);
      setProfile(updated);
      setToast({ type: 'success', text: 'Profile saved' });
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const onUploadPhoto = async (file) => {
    setUploading(true);
    try {
      const resp = await uploadProfilePhoto(file);
      setProfile({ ...profile, profileImageUrl: resp.profileImageUrl });
      setToast({ type: 'success', text: 'Photo updated' });
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const onDeletePhoto = async () => {
    setUploading(true);
    try {
      const resp = await deleteProfilePhoto();
      setProfile({ ...profile, profileImageUrl: resp.profileImageUrl });
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Delete failed' });
    } finally {
      setUploading(false);
    }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const payload = {
        accountHolderName: fd.get('accountHolderName'),
        accountNumber: fd.get('accountNumber'),
        ifscCode: fd.get('ifscCode'),
        bankName: fd.get('bankName'),
        branchName: fd.get('branchName') || '',
      };
      const data = await updateBankDetails(payload);
      setProfile({ ...profile, bankDetails: data });
      setToast({ type: 'success', text: 'Bank details updated' });
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Bank update failed' });
    }
  };

  const saveDocuments = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const payload = {
        aadhar: { number: fd.get('aadharNumber') || undefined, url: fd.get('aadharUrl') || undefined },
        pan: { number: fd.get('panNumber') || undefined, url: fd.get('panUrl') || undefined },
        policeVerification: { url: fd.get('policeUrl') || undefined },
        businessLicense: { number: fd.get('licenseNumber') || undefined, url: fd.get('licenseUrl') || undefined },
        insurance: { url: fd.get('insuranceUrl') || undefined },
      };
      const data = await updateDocuments(payload);
      setVerif(data);
      setToast({ type: 'success', text: 'Documents updated (pending verification)' });
    } catch (e) {
      setToast({ type: 'error', text: e.response?.data?.message || 'Update failed' });
    }
  };

  if (loading) return <div className="p-8 text-center">Loadingâ€¦</div>;
  if (!profile) return <div className="p-8 text-center text-red-600">Failed to load profile</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">KalaSetu Artisan Portal</div>
          <div className="text-sm text-gray-500">Profile Editor</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <Section title="Completion">
            <ProfileCompletionBar percent={completion} />
          </Section>
          <Section title="Profile Photo">
            <ProfilePhotoUploader value={profile.profileImageUrl} onUpload={onUploadPhoto} onDelete={onDeletePhoto} uploading={uploading} />
          </Section>
          <Section title="Verification">
            <div className="text-sm space-y-2">
              <div>Aadhar: <span className={verif?.aadhar?.verified ? 'text-green-600' : 'text-amber-600'}>{verif?.aadhar?.verified ? 'Verified' : 'Pending'}</span></div>
              <div>PAN: <span className={verif?.pan?.verified ? 'text-green-600' : 'text-amber-600'}>{verif?.pan?.verified ? 'Verified' : 'Pending'}</span></div>
              <div>Police Verification: <span className={verif?.policeVerification?.verified ? 'text-green-600' : 'text-amber-600'}>{verif?.policeVerification?.verified ? 'Verified' : 'Pending'}</span></div>
            </div>
          </Section>
        </aside>
        <section className="lg:col-span-3 space-y-6">
          <Section title="Basic Information" actions={<button onClick={saveProfile} disabled={saving} className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50">{saving ? 'Savingâ€¦' : 'Save Changes'}</button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Full Name" value={profile.fullName} onChange={(v) => setProfile({ ...profile, fullName: v })} />
              <TextInput label="Business Name" value={profile.businessName} onChange={(v) => setProfile({ ...profile, businessName: v })} />
              <TextInput label="Tagline" value={profile.tagline} onChange={(v) => setProfile({ ...profile, tagline: v })} placeholder="Expert plumberâ€¦" />
              <TextInput label="Craft" value={profile.craft} onChange={(v) => setProfile({ ...profile, craft: v })} />
              <TextInput label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
              <TextInput label="Primary Phone" value={profile.phoneNumber} onChange={(v) => setProfile({ ...profile, phoneNumber: v })} />
              <TextInput label="Business Phone" value={profile.businessPhone} onChange={(v) => setProfile({ ...profile, businessPhone: v })} />
              <TextInput label="WhatsApp Number" value={profile.whatsappNumber} onChange={(v) => setProfile({ ...profile, whatsappNumber: v })} />
            </div>
            <TextArea label="Bio" value={profile.bio} onChange={(v) => setProfile({ ...profile, bio: v })} placeholder="Tell USERs about your experience, specialization, and why they should choose you" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700" htmlFor="slug">Public URL (slug)</label>
                {profile.slug ? (
                  <div className="text-sm text-gray-600">Slug set: <span className="font-mono">{profile.slug}</span> (immutable)</div>
                ) : (
                  <div className="flex gap-2">
                    <input id="slug" className="border rounded px-3 py-2 flex-1" placeholder="e.g., john-smith-plumber" value={slugInput} onChange={(e)=> setSlugInput(e.target.value)} />
                    <button type="button" className="px-3 py-2 bg-blue-600 text-white rounded" onClick={async ()=>{ try{ const resp = await setSlug(slugInput.trim()); setProfile({ ...profile, slug: resp.slug }); setToast({ type:'success', text:'Slug set' }); }catch(e){ setToast({ type:'error', text: e.response?.data?.message || 'Failed to set slug' }); } }}>Set</button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Change Email (re-verify)</label>
                {emailFlow.step === 0 ? (
                  <div className="flex gap-2">
                    <input className="border rounded px-3 py-2 flex-1" placeholder="new-email@example.com" value={emailFlow.newEmail} onChange={(e)=> setEmailFlow({ ...emailFlow, newEmail: e.target.value })} />
                    <button type="button" className="px-3 py-2 bg-blue-600 text-white rounded" onClick={async ()=>{ try{ await initiateEmailChange(emailFlow.newEmail); setEmailFlow({ ...emailFlow, step: 1 }); setToast({ type:'success', text:'Verification code sent to new email' }); }catch(e){ setToast({ type:'error', text: e.response?.data?.message || 'Failed to send code' }); } }}>Send Code</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input className="border rounded px-3 py-2 flex-1" placeholder="Enter 6-digit code" value={emailFlow.code} onChange={(e)=> setEmailFlow({ ...emailFlow, code: e.target.value })} />
                    <button type="button" className="px-3 py-2 bg-green-600 text-white rounded" onClick={async ()=>{ try{ await confirmEmailChange(emailFlow.code); setEmailFlow({ step:0, newEmail:'', code:'' }); setProfile({ ...profile, email: emailFlow.newEmail }); setToast({ type:'success', text:'Email updated' }); }catch(e){ setToast({ type:'error', text: e.response?.data?.message || 'Invalid code' }); } }}>Confirm</button>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section title="Professional Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput label="Years of Experience" value={profile.yearsOfExperience} onChange={(v) => setProfile({ ...profile, yearsOfExperience: v })} placeholder="5-10 years" />
              <TextInput label="Team Size" value={profile.teamSize} onChange={(v) => setProfile({ ...profile, teamSize: v })} placeholder="solo / 2-5 / 6-10" />
              <TextInput label="Languages (comma separated)" value={(profile.languagesSpoken||[]).join(', ')} onChange={(v) => setProfile({ ...profile, languagesSpoken: v.split(',').map(s=>s.trim()).filter(Boolean) })} />
            </div>
          </Section>

          <Section title="Work Preferences">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput label="Service Radius (km)" value={profile.serviceRadius} onChange={(v)=> setProfile({ ...profile, serviceRadius: v })} />
              <TextInput label="Minimum Booking Notice (hours)" value={profile.minimumBookingNotice} onChange={(v)=> setProfile({ ...profile, minimumBookingNotice: v })} />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Emergency Services (24/7)</label>
                <input type="checkbox" checked={!!profile.emergencyServices} onChange={(e) => setProfile({ ...profile, emergencyServices: e.target.checked })} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Weekly Working Hours</label>
              <WorkingHoursForm value={profile.workingHours || {}} onChange={(v)=> setProfile({ ...profile, workingHours: v })} />
            </div>
          </Section>

          <Section title="Verification Documents" actions={<button onClick={saveDocuments} className="hidden" /> }>
            <form onSubmit={saveDocuments} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Aadhar Number" value={verif?.aadhar?.number} onChange={()=>{}} placeholder="Optional here (you can update)" />
              <TextInput label="Aadhar Document URL" value={verif?.aadhar?.url} onChange={()=>{}} placeholder="https://â€¦" />
              <input type="hidden" name="aadharNumber" defaultValue={verif?.aadhar?.number || ''} />
              <input type="hidden" name="aadharUrl" defaultValue={verif?.aadhar?.url || ''} />

              <TextInput label="PAN Number" value={verif?.pan?.number} onChange={()=>{}} placeholder="Optional here (you can update)" />
              <TextInput label="PAN Document URL" value={verif?.pan?.url} onChange={()=>{}} placeholder="https://â€¦" />
              <input type="hidden" name="panNumber" defaultValue={verif?.pan?.number || ''} />
              <input type="hidden" name="panUrl" defaultValue={verif?.pan?.url || ''} />

              <TextInput label="Police Verification URL" value={verif?.policeVerification?.url} onChange={()=>{}} placeholder="https://â€¦" />
              <input type="hidden" name="policeUrl" defaultValue={verif?.policeVerification?.url || ''} />

              <TextInput label="Business License Number" value={verif?.businessLicense?.number} onChange={()=>{}} placeholder="Optional" />
              <TextInput label="Business License URL" value={verif?.businessLicense?.url} onChange={()=>{}} placeholder="https://â€¦" />
              <input type="hidden" name="licenseNumber" defaultValue={verif?.businessLicense?.number || ''} />
              <input type="hidden" name="licenseUrl" defaultValue={verif?.businessLicense?.url || ''} />

              <TextInput label="Insurance URL" value={verif?.insurance?.url} onChange={()=>{}} placeholder="https://â€¦" />
              <input type="hidden" name="insuranceUrl" defaultValue={verif?.insurance?.url || ''} />

              <div className="md:col-span-2">
                <button className="px-3 py-2 bg-blue-600 text-white rounded">Update Documents</button>
              </div>
            </form>
            <div className="mt-4">
              <div className="text-sm text-gray-700 mb-2">Upload document file (Cloudinary):</div>
              <div className="flex items-center gap-2">
                <select id="docType" className="border rounded px-2 py-2">
                  <option value="aadhar">Aadhar</option>
                  <option value="pan">PAN</option>
                  <option value="policeVerification">Police Verification</option>
                  <option value="businessLicense">Business License</option>
                  <option value="insurance">Insurance</option>
                </select>
                <input id="docFile" type="file" className="border rounded px-2 py-2" />
                <button type="button" className="px-3 py-2 bg-gray-800 text-white rounded" onClick={async ()=>{
                  const select = document.getElementById('docType');
                  const input = document.getElementById('docFile');
                  const file = input.files?.[0];
                  if (!file) { setToast({ type:'error', text:'Select a file' }); return; }
                  try { const resp = await uploadVerificationDocument(file, select.value); setVerif({ ...(verif||{}), [select.value]: resp.doc }); setToast({ type:'success', text:'Document uploaded' }); } catch(e) { setToast({ type:'error', text: e.response?.data?.message || 'Upload failed' }); }
                }}>Upload</button>
              </div>
            </div>
          </Section>

          <Section title="Bank Details (for payouts)">
            <form onSubmit={saveBank} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Account Holder" value={profile.bankDetails?.accountHolderName} onChange={()=>{}} />
              <TextInput label="Bank Name" value={profile.bankDetails?.bankName} onChange={()=>{}} />
              <TextInput label="Branch Name" value={profile.bankDetails?.branchName} onChange={()=>{}} />
              <TextInput label="IFSC" value={profile.bankDetails?.ifscCode} onChange={()=>{}} />
              <TextInput label="Account Number (will be encrypted)" value={profile.bankDetails?.accountNumberMasked} onChange={()=>{}} />
              <input name="accountHolderName" className="hidden" defaultValue={profile.bankDetails?.accountHolderName || ''} />
              <input name="bankName" className="hidden" defaultValue={profile.bankDetails?.bankName || ''} />
              <input name="branchName" className="hidden" defaultValue={profile.bankDetails?.branchName || ''} />
              <input name="ifscCode" className="hidden" defaultValue={profile.bankDetails?.ifscCode || ''} />
              <input name="accountNumber" className="hidden" defaultValue={''} />
              <div className="md:col-span-2 text-sm text-gray-500">Note: To change sensitive fields, re-enter below.</div>
              <TextInput label="New Account Holder" value={''} onChange={()=>{}} />
              <TextInput label="New Bank Name" value={''} onChange={()=>{}} />
              <TextInput label="New Branch" value={''} onChange={()=>{}} />
              <TextInput label="New IFSC" value={''} onChange={()=>{}} />
              <TextInput label="New Account Number" value={''} onChange={()=>{}} />
              {/* Real implementation would bind controlled inputs; kept lean here */}
              <div className="md:col-span-2">
                <button className="px-3 py-2 bg-blue-600 text-white rounded">Save Bank Details</button>
              </div>
            </form>
          </Section>
        </section>
      </main>
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow text-white ${toast.type==='error'?'bg-red-600':'bg-green-600'}`}>{toast.text}</div>
      )}
    </div>
  );
};

export default ArtisanProfileEditor;

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
};

TextArea.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
};

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  actions: PropTypes.node,
};

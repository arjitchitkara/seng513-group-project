/* eslint-disable @typescript-eslint/no-explicit-any */
// EditProfileModal.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { X } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import {updateProfile} from '../../lib/supabase-helpers';
import { useAuth } from '@/lib/auth';

interface EditProfileForm {
  fullName: string;
  email: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  avatarFile: File | null;
}

interface Props {
  userId: string;
  onSuccess: () => void;
}


const EditProfileModal: React.FC<Props> = ({ userId, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState<EditProfileForm>({
    fullName: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    avatarFile: null,
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;
    if (name === 'avatarFile' && files) {
      setFormData({ ...formData, avatarFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(userId, {
        fullName: formData.fullName,
        email: formData.email,
        newPassword: formData.newPassword,
        bio: formData.bio,
        avatarFile: formData.avatarFile,
      });
      console.log('[Modal] before refreshUser')
      await refreshUser();
      console.log('[Modal] after refreshUser, user is now:', userId)
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      alert('Update failed: ' + error.message)
    } finally {
      setLoading(false);
    }
    onSuccess();
  };


  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <div className="relative max-w-md w-full">
        <GlassMorphism className="p-6 bg-background" intensity="medium">
          <button className="absolute top-3 right-3 text-foreground/80 hover:text-foreground" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full" />
            </div>
            <div className="form-control">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full" />
            </div>
            <div className="form-control">
              <Label htmlFor="bio">Bio</Label>
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} className="textarea textarea-bordered w-full" />
            </div>
            <div className="form-control">
              <Label htmlFor="avatarFile">Avatar</Label>
              <Input id="avatarFile" name="avatarFile" type="file" accept="image/*" onChange={handleChange} className="w-full" />
            </div>
            <div className="flex gap-2">
              <div className="form-control flex-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} className="w-full" />
              </div>
              <div className="form-control flex-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} className="w-full" />
              </div>
            </div>
            <div className="flex justify-end">
              <AnimatedButton hoverScale gradient type="submit" disabled={loading} onClick={handleSave}> {loading ? 'Saving…' : 'Save Changes'} </AnimatedButton>
            </div>
          </form>
        </GlassMorphism>
      </div>
    </div>
  );

  return (
    <>
      <AnimatedButton hoverLift ripple gradient className="!text-sm" onClick={() => setIsOpen(true)}>
        Edit Profile
      </AnimatedButton>

      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
};

export default EditProfileModal;

// EditProfileModal.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { X } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface EditProfileForm {
  fullName: string;
  email: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  avatarFile: File | null;
}

const EditProfileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    console.log('Profile data:', formData);
    setIsOpen(false);
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
              <AnimatedButton hoverScale gradient type="submit">Save Changes</AnimatedButton>
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

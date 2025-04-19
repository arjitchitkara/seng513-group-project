import React, { useState, ChangeEvent, FormEvent } from 'react';

interface EditProfileForm {
  fullName: string;
  email: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  avatarFile: File | null;
}

const EditProfileModal: React.FC = () => {
  const [formData, setFormData] = useState<EditProfileForm>({
    fullName: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    avatarFile: null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
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
    console.log('Updating profile with', formData);
    alert('Profile updated successfully');
    const toggle = document.getElementById('edit-profile-modal') as HTMLInputElement;
    if (toggle) toggle.checked = false;
  };

  return (
    <>
      <input
        type="checkbox"
        id="edit-profile-modal"
        className="modal-toggle"
      />
      <label
        htmlFor="edit-profile-modal"
        className="btn btn-outline rounded-full btn-sm"
      >
        Edit Profile
      </label>

      <div className="modal">
        <div className="modal-box relative max-w-lg">
          {/* Close button */}
          <label
            htmlFor="edit-profile-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>

          <h2 className="font-bold text-xl mb-4">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Avatar</span>
              </label>
              <input
                type="file"
                name="avatarFile"
                accept="image/*"
                onChange={handleChange}
                className="file-input file-input-bordered w-full"
              />
            </div>

            <div className="flex gap-2">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
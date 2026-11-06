import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Profile update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2>Profile</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="form-control" />
                </div>
              </div>
              <button type="submit" className="btn btn-warning text-dark mt-4">Update Profile</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label">Current password</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">New password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="form-control" required />
              </div>
              <button type="submit" className="btn btn-dark w-100">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import { useEffect, useState } from "react";
import { Camera, User, Mail, Phone, MapPin, Shield, Save } from "lucide-react";

import { api } from "../../services/api";

import "../../styles/profile.css";

export default function Profile() {
  //--------------------------------------------------
  // State
  //--------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    user_type: "",
    profile_picture: "",
  });

  const [profile, setProfile] = useState({
    location: "",
    preferred_contact: "",
  });

  //--------------------------------------------------
  // Load Data
  //--------------------------------------------------

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await api.get("me/");

        const profileData = await api.get("customerprofile/");

        setUser(userData);

        setProfile(profileData[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  //--------------------------------------------------
  // Inputs
  //--------------------------------------------------

  function handleUser(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  }

  function handleProfile(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  }

  //--------------------------------------------------
  // Image
  //--------------------------------------------------

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUser({
      ...user,
      profile_picture: file,
    });
  }

  //--------------------------------------------------
  // Save
  //--------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);

    setSuccess("");

    setError("");

    try {
      const formData = new FormData();

      formData.append("first_name", user.first_name);

      formData.append("last_name", user.last_name);

      formData.append("phone", user.phone);

      if (user.profile_picture instanceof File) {
        formData.append("profile_picture", user.profile_picture);
      }

      await api.upload("me/", formData);

      await api.patch(`customerprofile/${profile.id}/`, {
        location: profile.location,
        preferred_contact: profile.preferred_contact,
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  //--------------------------------------------------
  // JSX
  //--------------------------------------------------

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>Profile</h2>

        <p>Manage your personal information and account settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-grid">
        {/* Left */}

        <div className="profile-card profile-sidebar">
          <div className="avatar-wrapper">
            {user.profile_picture ? (
              <img
                src={
                  user.profile_picture instanceof File
                    ? URL.createObjectURL(user.profile_picture)
                    : user.profile_picture
                }
                alt=""
              />
            ) : (
              <User size={70} />
            )}

            <label className="change-photo">
              <Camera size={18} />
              Change Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImage}
              />
            </label>
          </div>

          <h3>
            {user.first_name} {user.last_name}
          </h3>

          <span>{user.user_type}</span>

          <div className="profile-location">
            <MapPin size={18} />

            {profile.location || "No location"}
          </div>
        </div>

        {/* Right */}

        <div className="profile-card">
          <div className="profile-form-grid">
            <Input
              icon={<User size={18} />}
              label="First Name"
              name="first_name"
              value={user.first_name}
              onChange={handleUser}
            />

            <Input
              icon={<User size={18} />}
              label="Last Name"
              name="last_name"
              value={user.last_name}
              onChange={handleUser}
            />

            <Input
              icon={<User size={18} />}
              label="Username"
              value={user.username}
              disabled
            />

            <Input
              icon={<Mail size={18} />}
              label="Email"
              value={user.email}
              disabled
            />

            <Input
              icon={<Phone size={18} />}
              label="Phone"
              name="phone"
              value={user.phone}
              onChange={handleUser}
            />

            <Input
              icon={<Shield size={18} />}
              label="User Type"
              value={user.user_type}
              disabled
            />
          </div>

          <div className="input-group">
            <label>Location</label>

            <input
              name="location"
              value={profile.location}
              onChange={handleProfile}
            />
          </div>

          <div className="input-group">
            <label>Preferred Contact</label>

            <select
              name="preferred_contact"
              value={profile.preferred_contact}
              onChange={handleProfile}
            >
              <option>Phone</option>

              <option>Email</option>
            </select>
          </div>

          {success && <div className="success-message">{success}</div>}

          {error && <div className="error-message">{error}</div>}

          <button className="save-profile-btn" disabled={saving}>
            <Save size={18} />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ icon, label, ...props }) {
  return (
    <div className="input-group">
      <label>{label}</label>

      <div className="input-icon">
        {icon}

        <input {...props} />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Star, BadgeCheck } from "lucide-react";

import { api } from "../../services/api";

import "../../styles/profile.css";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  //-----------------------------------------
  // User (me/)
  //-----------------------------------------

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    user_type: "",
    profile_picture: "",
  });

  //-----------------------------------------
  // Worker Profile
  //-----------------------------------------

  const [profile, setProfile] = useState({
    id: null,
    profession: "",
    experience_years: "",
    location: "",
    bio: "",
    verified: false,
    hourly_rate: "",
    mpesa_phone_number: "",
    average_rating: 0,
  });

  //-----------------------------------------
  // Load Profile
  //-----------------------------------------

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const userData = await api.get("me/");
      const workerData = await api.get("workerprofile/");

      setUser(userData);

      if (Array.isArray(workerData)) {
        setProfile(workerData[0]);
      } else {
        setProfile(workerData);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  //-----------------------------------------
  // User handlers
  //-----------------------------------------

  function handleUser(e) {
    setUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  //-----------------------------------------
  // Worker handlers
  //-----------------------------------------

  function handleProfile(e) {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  //-----------------------------------------
  // Profile Image
  //-----------------------------------------

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUser((prev) => ({
      ...prev,
      profile_picture: file,
    }));
  }

  function removePhoto() {
    setUser((prev) => ({
      ...prev,
      profile_picture: "",
    }));
  }

  //-----------------------------------------
  // Save Profile
  //-----------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      //------------------------------
      // Update User
      //------------------------------

      const formData = new FormData();

      formData.append("first_name", user.first_name);
      formData.append("last_name", user.last_name);
      formData.append("phone", user.phone);

      if (user.profile_picture instanceof File) {
        formData.append("profile_picture", user.profile_picture);
      }

      await api.upload("me/", formData);

      //------------------------------
      // Update Worker Profile
      //------------------------------

      await api.patch(`workerprofile/${profile.id}/`, {
        location: profile.location,
        bio: profile.bio,
        hourly_rate: profile.hourly_rate,
        mpesa_phone_number: profile.mpesa_phone_number,
      });

      setSuccess("Profile updated successfully.");

      await loadProfile();
    } catch (err) {
  console.error("Update Error:", err);

  console.log("Response:", err.response);

  console.log("Data:", err.response?.data);

  console.log("Status:", err.response?.status);

  setError(
    err.response?.data?.detail ||
    JSON.stringify(err.response?.data) ||
    "Unable to update profile."
  );
}finally {
      setSaving(false);
    }
  }

  //-----------------------------------------
  // Loading
  //-----------------------------------------

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  //-----------------------------------------
  // JSX
  //-----------------------------------------

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Worker Profile</h2>

          <p>
            Keep your professional information up to date so customers can
            confidently hire you.
          </p>
        </div>

        <div className="profile-body">
          {success && <div className="profile-success">{success}</div>}

          {error && <div className="profile-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ================= PROFILE IMAGE ================= */}

            <div className="profile-image-section">
              {user.profile_picture ? (
                <img
                  className="profile-avatar"
                  src={
                    user.profile_picture instanceof File
                      ? URL.createObjectURL(user.profile_picture)
                      : user.profile_picture
                  }
                  alt={user.username}
                />
              ) : (
                <img
                  className="profile-avatar"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.first_name || user.username || "Worker",
                  )}&background=00b2ff&color=fff&size=256`}
                  alt=""
                />
              )}

              <div className="profile-image-actions">
                <label className="upload-btn">
                  Upload
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={removePhoto}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* ================= PERSONAL INFORMATION ================= */}

            <h3 className="profile-section-title">Personal Information</h3>

            <div className="profile-form">
              <div className="form-group">
                <label>
                  First Name <span>*</span>
                </label>

                <input
                  name="first_name"
                  value={user.first_name}
                  onChange={handleUser}
                />
              </div>

              <div className="form-group">
                <label>
                  Last Name <span>*</span>
                </label>

                <input
                  name="last_name"
                  value={user.last_name}
                  onChange={handleUser}
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input value={user.email} disabled />
              </div>

              <div className="form-group">
                <label>Username</label>

                <input value={user.username} disabled />
              </div>

              <div className="form-group">
                <label>User Type</label>

                <input value={user.user_type} disabled />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input name="phone" value={user.phone} onChange={handleUser} />
              </div>
            </div>

            {/* ================= PROFESSIONAL INFORMATION ================= */}

            <h3 className="profile-section-title">Professional Information</h3>

            <div className="profile-form">
              <div className="form-group">
                <label>Profession</label>

                <input value={profile.profession} disabled readOnly />
              </div>

              <div className="form-group">
                <label>Experience (Years)</label>

                <input
                  value={`${profile.experience_years} Years`}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>
                  Hourly Rate (KES) <span>*</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  name="hourly_rate"
                  value={profile.hourly_rate}
                  onChange={handleProfile}
                />
              </div>

              <div className="form-group">
                <label>
                  M-Pesa Number <span>*</span>
                </label>

                <input
                  name="mpesa_phone_number"
                  value={profile.mpesa_phone_number}
                  onChange={handleProfile}
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Location <span>*</span>
                </label>

                <input
                  name="location"
                  value={profile.location}
                  onChange={handleProfile}
                />
              </div>
            </div>
            {/* ================= ABOUT ME ================= */}

            <h3 className="profile-section-title">About Me</h3>

            <div className="profile-form">
              <div className="form-group full-width">
                <label>
                  Professional Bio <span>*</span>
                </label>

                <textarea
                  name="bio"
                  rows="6"
                  value={profile.bio}
                  onChange={handleProfile}
                  placeholder="Tell customers about your experience, skills and why they should hire you..."
                />
              </div>
            </div>

            {/* ================= PERFORMANCE ================= */}

            <h3 className="profile-section-title">Performance</h3>

            <div className="profile-form">
              <div className="form-group">
                <label>Verification Status</label>

                <div className="profile-readonly-card">
                  <BadgeCheck
                    size={18}
                    color={profile.verified ? "#16a34a" : "#dc2626"}
                  />

                  <span>
                    {profile.verified ? "Verified Worker" : "Not Verified"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Average Rating</label>

                <div className="profile-readonly-card">
                  <Star size={18} color="#f59e0b" fill="#f59e0b" />

                  <span>
                    {Number(profile.average_rating || 0).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </div>

            {/* ================= SAVE ================= */}

            <div className="profile-footer">
              <button className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

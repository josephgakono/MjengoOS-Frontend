import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

import { api } from "../../services/api";

import "../../styles/profile.css";

export default function Profile() {
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
    id: null,
    location: "",
    preferred_contact: "Phone",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await api.get("me/");
        const profileData = await api.get("customerprofile/");

        setUser(userData);

        if (Array.isArray(profileData)) {
          setProfile(profileData[0]);
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  function handleImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUser({
      ...user,
      profile_picture: file,
    });
  }

  function removePhoto() {
    setUser({
      ...user,
      profile_picture: "",
    });
  }

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

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Personal Information</h2>
        </div>

        <div className="profile-body">
          {success && <div className="profile-success">{success}</div>}

          {error && <div className="profile-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-image-section">
              {user.profile_picture ? (
                <img
                  className="profile-avatar"
                  src={
                    user.profile_picture instanceof File
                      ? URL.createObjectURL(user.profile_picture)
                      : user.profile_picture
                  }
                  alt=""
                />
              ) : (
                <img
                  className="profile-avatar"
                  src="https://ui-avatars.com/api/?name=User&background=00b2ff&color=fff&size=256"
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
                <label>
                  Email <span>*</span>
                </label>

                <input value={user.email} disabled />
              </div>

              <div className="form-group">
                <label>
                  Username <span>*</span>
                </label>

                <input value={user.username} disabled />
              </div>

              <div className="form-group">
                <label>
                  User Type <span>*</span>
                </label>

                <input value={user.user_type} disabled />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input name="phone" value={user.phone} onChange={handleUser} />
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

              <div className="form-group full-width">
                <label>Preferred Contact</label>

                <select
                  name="preferred_contact"
                  value={profile.preferred_contact}
                  onChange={handleProfile}
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>

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

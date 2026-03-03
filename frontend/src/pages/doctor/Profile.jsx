import { useState, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import API from "../../services/api";

import {
  User,
  Mail,
  Phone,
  Building2,
  Camera,
  Save,
  X,
  Pencil
} from "lucide-react";

import "../../styles/doctor/app.css";
import "../../styles/doctor/Profile.css";

export default function Profile() {

  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

const user = JSON.parse(localStorage.getItem("user"));
const doctorId = user?.id;
  const [form, setForm] = useState({
    fullName: "",
    specialty: "",
    email: "",
    phone: "",
    institution: ""
  });

  // ================= FETCH PROFILE =================
useEffect(() => {
  if (!doctorId) return;
  fetchProfile();
}, [doctorId]);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/doctor-profile/${doctorId}`);
      const data = res.data;

      setForm({
        fullName: data.fullName || "",
        specialty: data.specialty || "",
        email: data.doctorId?.email || "",   // ✅ FIXED
        phone: data.phone || "",
        institution: data.institution || ""
      });

      if (data.profileImage) {
        setPreviewImage(
          `http://localhost:5000/uploads/${data.profileImage}`
        );
      }
      console.log("PROFILE DATA:", res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("specialty", form.specialty);
    formData.append("phone", form.phone);
    formData.append("institution", form.institution);

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    await API.put(
      `/doctor-profile/${doctorId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setProfileImage(null);
    setIsEditing(false);
    fetchProfile();

  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      <div className={`main ${collapsed ? "collapsed" : ""}`}>
        <Topbar />

        <div className="dashboard profile-page">

          {/* HEADER */}
          <div className="profile-header">
            <div className="profile-info">

              <div className="avatar">

                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="avatar-img"
                  />
                ) : (
                  <span>
                    {form.fullName
                      ? form.fullName
                          .split(" ")
                          .map(n => n[0])
                          .join("")
                          .slice(0, 2)
                      : "DR"}
                  </span>
                )}

                {isEditing && (
                  <label className="camera-icon">
                    <Camera size={14} />
                    <input
                      type="file"
                      hidden
                      onChange={handleImageChange}
                    />
                  </label>
                )}

              </div>

              <div className="profile-text">
                <h2>{form.fullName}</h2>
                <p>{form.specialty}</p>
              </div>

            </div>
          </div>

          {/* CARD */}
          <div className="profile-card animate-fade">

            <div className="card-header">
              <div className="card-title">
                <User size={18} />
                <h3>Personal Information</h3>
              </div>

              {!isEditing && (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>

            <div className="profile-grid">

              <div className="field">
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="field">
                <label>Specialty</label>
                <input
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="field full">
                <label><Mail size={14}/> Email</label>
                <input
                  value={form.email}
                  disabled   // email is from User model
                />
              </div>

              <div className="field full">
                <label><Phone size={14}/> Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="field full">
                <label><Building2 size={14}/> Institution</label>
                <input
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

            </div>

            {isEditing && (
              <div className="profile-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                >
                  <X size={16}/>
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleSave}
                >
                  <Save size={16}/>
                  Save Changes
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
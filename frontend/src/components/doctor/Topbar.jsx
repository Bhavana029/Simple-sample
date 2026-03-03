import { useState } from "react";
import { LogOut, User } from "lucide-react";
import "../../styles/doctor/app.css";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="profile">
        <div
          className="profile-icon"
          onClick={() => setOpen(!open)}
        >
          <User size={18} />
        </div>

        {open && (
          <div className="profile-menu">
            <div
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
            >
              <User size={16} /> View Profile
            </div>

            <div
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
            >
              <LogOut size={16} /> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
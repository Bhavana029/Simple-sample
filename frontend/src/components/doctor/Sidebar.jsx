import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Dna,
  FileText,
  MessageSquare,
  History,
  ChevronLeft,
  ChevronRight,
  Bot,
  Stethoscope,LogOut
} from "lucide-react";


import { useNavigate, NavLink} from "react-router-dom";
import "../../styles/doctor/sidebar.css";

export default function Sidebar({ collapsed, toggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      {/* Sidebar Header */}
      <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>
        <div className="brand-icon">
          <Stethoscope size={20} />
        </div>

        {!collapsed && (
          <div className="brand-text">
            <h2>Prenatal AI</h2>
            <span>Copilot</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />



      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end>
          <LayoutDashboard />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/cases">
          <FolderOpen />
          {!collapsed && <span>Cases</span>}
        </NavLink>

        <NavLink to="/gene-analysis">
          <Dna />
          {!collapsed && <span>Gene Analysis</span>}
        </NavLink>


        <NavLink to="/history">
          <History />
          {!collapsed && <span>History</span>}
        </NavLink>


        <NavLink to="/chat-bot">
          <Bot />

          {!collapsed && <span>Copoilet</span>}
        </NavLink>

      </nav>

      

      {/* Logout */}
        <div
          className={`sidebar-logout ${collapsed ? "collapsed" : ""}`}
          onClick={handleLogout}
        >
          <LogOut size={22}/>
          {!collapsed && <span>Logout</span>}
        </div>

      {/* Collapse button */}
      <button className="collapse-btn" onClick={toggle}>
        {collapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </aside>
  );
}


{/* <nav className="sidebar-nav">
  <NavLink to="/" end>
    <LayoutDashboard />
    {!collapsed && <span>Dashboard</span>}
  </NavLink>

  <NavLink to="/cases">
    <FolderOpen />
    {!collapsed && <span>Cases</span>}
  </NavLink>

  <NavLink to="/gene-analysis">
    <Dna />
    {!collapsed && <span>Gene Analysis</span>}
  </NavLink>

  <NavLink to="/reports">
    <FileText />
    {!collapsed && <span>Reports</span>}
  </NavLink>

  <NavLink to="/messages">
    <MessageSquare />
    {!collapsed && <span>Messages</span>}
  </NavLink>

  <NavLink to="/history">
    <History />
    {!collapsed && <span>History</span>}
  </NavLink>
</nav> */}

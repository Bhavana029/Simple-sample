import { useState, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import API from "../../services/api";
import CaseDetailsModal from "../../components/doctor/CaseDetailsModal";
import "../../styles/doctor/app.css";

import {
  FolderOpen,
  Clock,
  CheckCircle,
  FileText,
  Eye,
  Activity,
} from "lucide-react";

const icons = [
  FolderOpen,
  Clock,
  CheckCircle,
  FileText,
];

export default function DoctorDashboard() {

  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
const doctorName = user?.name || "Doctor";
  // ================= FETCH DASHBOARD DATA =================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/cases");
      const allCases = res.data.cases || [];

      setCases(allCases);

      const total = allCases.length;
      const uploaded = allCases.filter(c => c.status === "Uploaded").length;
      const underReview = allCases.filter(c => c.status === "Under Review").length;
      const completed = allCases.filter(c => c.status === "Completed").length;

      setStats([
        { title: "Total Cases", value: total },
        { title: "Under Review", value: underReview },
        { title: "Completed", value: completed },
        { title: "Uploaded", value: uploaded },
      ]);

    } catch (error) {
      console.error(error);
    }
  };

  

  const handleViewDetails = async (caseItem) => {
    try {
      const res = await API.get(`/cases/${caseItem._id}`);
      setSelectedCase(res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCase(null);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="app">
        <Sidebar
          collapsed={collapsed}
          toggle={() => setCollapsed(!collapsed)}
        />

        <div className={`main ${collapsed ? "collapsed" : ""}`}>
          <Topbar />

          <div className="dashboard">
            <h1>
  Welcome back, <span>Dr. {doctorName}</span>
</h1>
            <p>Here's an overview of your clinical dashboard</p>

            {/* ================= STATS ================= */}
            <div className="stats">
              {stats.map((s, index) => {
                const Icon = icons[index];
                return (
                  <div
                    key={index}
                    className={`stat-card stat-${index}`}
                    style={{ "--i": index }}
                  >
                    <div className="stat-left">
                      <p>{s.title}</p>
                      <h2>{s.value}</h2>
                    </div>

                    <div className="stat-icon">
                      <Icon />
                    </div>

                    <span className="stat-circle one"></span>
                    <span className="stat-circle two"></span>
                  </div>
                );
              })}
            </div>

            {/* ================= RECENTLY UPLOADED ================= */}
            <div className="recent">
              <div className="recent-header">
                <div className="recent-icon">
                  <Activity size={17} />
                </div>

                <div className="recent-title">
                  <h3>Recently Uploaded</h3>
                  <p>Latest case submissions</p>
                </div>
              </div>

              {cases.slice(0, 3).map((c, index) => (
                <div
                  key={c._id}
                  className="recent-item"
                  style={{ "--i": index }}
                >
                  <div className="recent-left">
                    <div className="case-meta">
                      <span className="case-id">{c.patientId}</span>
                      <span
                        className={`status ${c.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h4>{c.patientName}</h4>
                    <p>Uploaded {new Date(c.createdAt).toLocaleString()}</p>
                  </div>

                  <div
                    className="recent-action"
                    onClick={() => handleViewDetails(c)}
                  >
                    <Eye size={18} /> View
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
     {showModal && (
  <CaseDetailsModal
    caseData={selectedCase}
    onClose={closeModal}
  />
)}
    </>
  );
}
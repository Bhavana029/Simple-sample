import { useState, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctor/app.css";
import "../../styles/doctor/Cases.css";
import CustomSelect from "../../components/doctor/CustomSelect";
import API from "../../services/api";
import CaseDetailsModal from "../../components/doctor/CaseDetailsModal";

import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  RotateCcw ,
  Eye
} from "lucide-react";

export default function Cases() {

  const [collapsed, setCollapsed] = useState(false);

  const [mode, setMode] = useState("Natural");
  const [consanguinity, setConsanguinity] = useState("No");

  const [status, setStatus] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");

  const [activeMenu, setActiveMenu] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage, setCasesPerPage] = useState("5 per page");
const [errors, setErrors] = useState({});
  // ================= FETCH CASES =================

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCases();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, status, timeFilter]);

  const fetchCases = async () => {
  try {

    const params = {
      search: searchTerm
    };

    // ✅ Only send status if not "All"
    if (status && status !== "All") {
      params.status = status;
    }

    const res = await API.get("/cases", { params });

    let filteredCases = res.data.cases || [];

    // ================= TIME FILTER =================
    if (timeFilter && timeFilter !== "All") {
      const now = new Date();

      filteredCases = filteredCases.filter((c) => {
        const caseDate = new Date(c.createdAt);
        const diffTime = now - caseDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (timeFilter === "Today") return diffDays <= 1;
        if (timeFilter === "7 Days") return diffDays <= 7;
        if (timeFilter === "30 Days") return diffDays <= 30;

        return true;
      });
    }

    setCases(filteredCases);
    setCurrentPage(1);

  } catch (error) {
    console.error("Fetch cases error:", error);
  }
};



const handleRecheck = async (caseId) => {
  try {
    await API.put(`/cases/${caseId}/status`, {
      status: "Uploaded"
    });

    alert("Case moved back to Uploaded for re-analysis.");
    fetchCases();

  } catch (error) {
    console.error(error);
    alert("Failed to reset case");
  }
};





  // ================= CREATE CASE =================
 const handleCreateCase = async () => {

  let newErrors = {};

  // ===== PATIENT ID =====
  if (!patientId.trim()) {
    newErrors.patientId = "Patient ID is required";
  } else if (cases.some(c => c.patientId === patientId)) {
    newErrors.patientId = "Case ID already exists";
  }

  // ===== PATIENT NAME =====
  if (!patientName.trim()) {
    newErrors.patientName = "Patient name is required";
  } else if (!/^[A-Za-z\s]+$/.test(patientName)) {
    newErrors.patientName = "Patient name must contain only letters";
  }

  // ===== GESTATIONAL AGE =====
  const weeks = parseInt(gestationalAge);

  if (!gestationalAge) {
    newErrors.gestationalAge = "Gestational age is required";
  } else if (isNaN(weeks) || weeks <= 0) {
    newErrors.gestationalAge = "Enter valid gestational age";
  } else if (weeks > 42) {
    newErrors.gestationalAge = "Gestational age must be below or equal to 42 weeks";
  }

  // If any errors exist
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    await API.post("/cases", {
      patientId,
      patientName,
      gestationalAge,
      consanguinity,
      modeOfConception: mode
    });

    fetchCases();

    setPatientId("");
    setPatientName("");
    setGestationalAge("");
    setErrors({});

  } catch (error) {
    alert(error.response?.data?.message || "Something went wrong");
  }
};

  // ================= DELETE =================
  const deleteCase = async (caseId) => {
    try {
      await API.delete(`/cases/${caseId}`);
      fetchCases();
      setActiveMenu(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= OPEN DETAILS =================
  const openCaseDetails = async (caseId) => {
    try {
      const res = await API.get(`/cases/${caseId}`);
      setSelectedCase(res.data);
      setActiveMenu(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= PAGINATION =================
  const numericPageSize = parseInt(casesPerPage);

  const totalPages = Math.ceil(cases.length / numericPageSize);

  const startIndex = (currentPage - 1) * numericPageSize;

  const paginatedCases = cases.slice(
    startIndex,
    startIndex + numericPageSize
  );

  return (
    <>
      <div className="app">
        <Sidebar
          collapsed={collapsed}
          toggle={() => setCollapsed(!collapsed)}
        />

        <div className={`main ${collapsed ? "collapsed" : ""}`}>
          <Topbar />

          <div className="dashboard cases-page">

            <h1>Cases</h1>
            <p>Manage patient cases and submissions</p>

            {/* CREATE CASE */}
            <div className="create-case">
              <div className="create-header">
                <Plus size={28} />
                <h3>Create New Case</h3>
              </div>

              <div className="create-grid">
<div className="form-group">
                <input
  placeholder="Patient ID"
  value={patientId}
  onChange={(e) => setPatientId(e.target.value)}
/>
{errors.patientId && (
  <p className="error-text">{errors.patientId}</p>
)}
</div>
<div className="form-group">
  <input
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                {errors.patientName && <p className="error-text">{errors.patientName}</p>}
</div>
                
<div className="form-group">

  <input
                  placeholder="Gestational Age (weeks)"
                  value={gestationalAge}
                  onChange={(e) => setGestationalAge(e.target.value)}
                />
                {errors.gestationalAge && <p className="error-text">{errors.gestationalAge}</p>}
                
</div>
                

                <CustomSelect
                  options={["No", "Yes"]}
                  value={consanguinity}
                  onChange={setConsanguinity}
                />

                <CustomSelect
                  options={["Natural", "IVF", "ICSI", "IUI"]}
                  value={mode}
                  onChange={setMode}
                />

                <button
                  className="create-btn"
                  onClick={handleCreateCase}
                >
                  <Plus size={16} /> Create Case
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="cases-controls">

              <div className="search-box">
                <Search size={16} />
                <input
                  placeholder="Search by Case ID or Patient..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>

             <CustomSelect
  label="Status"
  placeholder="Select Status"
  options={["All", "Under Review", "Uploaded", "Completed"]}
  value={status}
  onChange={setStatus}
/>

<CustomSelect
  label="Time"
  placeholder="Select Time"
  options={["All", "Today", "7 Days", "30 Days"]}
  value={timeFilter}
  onChange={setTimeFilter}
/>

<CustomSelect
  label="Per Page"
  placeholder="Select Page Size"
  options={["5 per page", "10 per page", "15 per page", "20 per page"]}
  value={`${casesPerPage} per page`}
  onChange={(value) => {
    setCasesPerPage(parseInt(value));
    setCurrentPage(1);
  }}
/>
            </div>

            {/* CASE LIST */}
            <div className="cases-list">

              {paginatedCases.length === 0 && (
                <p className="empty-text">
                  No cases found.
                </p>
              )}

              {paginatedCases.map((c) => (
                <div key={c._id} className="case-card">

                  <div className="case-left">
                    <div className="case-week">
                      {c.gestationalAge}w
                    </div>

                    <div>
                      <div className="case-top">
                        <span className="case-id">
                          {c.patientId}
                        </span>

                        <span
                          className={`status ${c.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h4>{c.patientName}</h4>

                      <p>
                        Updated{" "}
                        {new Date(c.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="menu-wrapper">
                    <MoreVertical
                      size={18}
                      className="menu-icon"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === c._id ? null : c._id
                        )
                      }
                    />

                    {activeMenu === c._id && (
                      <div className="case-menu">

                        <div
                          className="menu-item"
                          onClick={() =>
                            openCaseDetails(c._id)
                          }
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </div>

                        <div
                          className="menu-item delete-item"
                          onClick={() =>
                            deleteCase(c._id)
                          }
                        >
                          <Trash2 size={16} />
                          <span>Delete Case</span>
                        </div>
                          {c.status === "Completed" && (
  <div
    className="menu-item"
    onClick={() => handleRecheck(c._id)}
  >
    <RotateCcw size={16} />
    <span>Recheck Case</span>
  </div>
)}



                      </div>
                    )}

                  </div>
                </div>
              ))}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(currentPage - 1)
                  }
                >
                  Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(currentPage + 1)
                  }
                >
                  Next
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {selectedCase && (
        <CaseDetailsModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </>
  );
}
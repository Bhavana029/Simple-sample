export default function CaseDetailsModal({ caseData, onClose }) {
  if (!caseData) return null;

  const formatSummary = (text) => {
    return text
      .split(
        /(?=Gene:|Final PP4 Score:|Risk Category:|Interpretation:|Recommended Action:)/g
      )
      .map((section, index) => (
        <p key={index}>{section.trim()}</p>
      ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="case-modal" onClick={(e) => e.stopPropagation()}>

        {/* ================= HEADER ================= */}
        <div className="modal-header">
          <div>
            <h2>Case Details</h2>
            <p>Full information for {caseData.patientId}</p>
          </div>
          <span className="close-btn" onClick={onClose}>✕</span>
        </div>

        {/* ================= BASIC DETAILS ================= */}
        <div className="modal-grid">

          <div className="modal-field">
            <label>Patient ID</label>
            <span>{caseData.patientId}</span>
          </div>

          <div className="modal-field">
            <label>Patient Name</label>
            <span>{caseData.patientName}</span>
          </div>

          <div className="modal-field">
            <label>Gestational Age</label>
            <span>{caseData.gestationalAge}w</span>
          </div>

          <div className="modal-field">
            <label>Status</label>
            <span className={`status ${caseData.status?.toLowerCase().replace(" ", "-")}`}>
              {caseData.status}
            </span>
          </div>

          <div className="modal-field">
            <label>Consanguinity</label>
            <span>{caseData.consanguinity}</span>
          </div>

          <div className="modal-field">
            <label>Mode of Conception</label>
            <span>{caseData.modeOfConception}</span>
          </div>

          {/* 🔥 File Info (Under Review & Completed Only) */}
          {(caseData.status === "Under Review" || caseData.status === "Completed") 
            && caseData.reportFile && (
            <div className="modal-field full-width">
              <label>Uploaded Report</label>
              <span>
                {caseData.reportFile}
                <br />
                <small className="file-type-badge">
                  {caseData.reportFileType?.split("/")[1]?.toUpperCase()}
                </small>
              </span>
            </div>
          )}

        </div>

        {/* ================= PP4 SECTION ================= */}
        {caseData.pp4 && (
          <div className="pp4-section">
            <h4>PP4 Score</h4>

            <div className="pp4-summary-grid">

              <div className="pp4-item">
                <label>Raw Score</label>
                <span>{caseData.pp4.rawScore}</span>
              </div>

              <div className="pp4-item">
                <label>Final Score</label>
                <span>{caseData.pp4.finalScore}</span>
              </div>

              <div className="pp4-item">
                <label>Risk Level</label>
                <span className="risk-text">
                  {caseData.pp4.riskLevel}
                </span>
              </div>

              <div className="pp4-item">
                <label>Calculated At</label>
                <span>
                  {new Date(caseData.pp4.calculatedAt).toLocaleString()}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* ================= CLINICAL SUMMARY ================= */}
        {caseData.summary && (
          <div className="summary-box">
            <h4><b>Clinical Summary</b></h4>
            <div className="summary-content">
              {formatSummary(caseData.summary)}
            </div>
          </div>
        )}

        {/* ================= TIMELINE ================= */}
        <div className="timeline">
          <h4>Timeline</h4>
          <p>Created: {new Date(caseData.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(caseData.updatedAt).toLocaleString()}</p>
        </div>

      </div>
    </div>
  );
}
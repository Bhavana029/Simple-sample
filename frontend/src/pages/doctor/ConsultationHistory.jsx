import { useState } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../context/HistoryContext";
import {
  History,
  Search,
  FileText,
  FilePlus,
  Edit,
  Trash2,
  CheckCircle, Bot
} from "lucide-react";

import "../../styles/doctor/app.css";
import "../../styles/doctor/ConsultationHistory.css";

export default function ConsultationHistory() {

  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const {
    history,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    actionFilter,
    setActionFilter,
    timeFilter,
    setTimeFilter,
    clearHistory,
    deleteSingleHistory
  } = useHistoryContext();

  const navigate = useNavigate();

  /* ================= ICON SWITCH ================= */
  const getIcon = (action) => {
    switch (action) {
      case "CREATED":
        return <FilePlus size={16} />;
      case "UPDATED":
        return <Edit size={16} />;
      case "STATUS_CHANGED":
        return <CheckCircle size={16} />;
      case "DELETED":
        return <Trash2 size={16} />;
      case "GENE_ANALYSIS":
        return <FileText size={16} />;
      case "PP4_RESULT":
        return <History size={16} />;

         case "CHAT_CONVERSATION_CREATED":
    case "CHAT_CONVERSATION_DELETED":
    case "CHAT_CONVERSATION_RENAMED":
    case "CHAT_PP4_CALCULATED":
      return <Bot size={16} />;
      default:
        return <FileText size={16} />;
    }
  };



const getActionClass = (action) => {
  switch (action) {
    case "CREATED":
    case "CHAT_CONVERSATION_CREATED":
      return "action-created";

    case "DELETED":
    case "CHAT_CONVERSATION_DELETED":
      return "action-deleted";

    case "UPDATED":
    case "CHAT_CONVERSATION_RENAMED":
      return "action-updated";

    case "CHAT_PP4_CALCULATED":
    case "PP4_RESULT":
      return "action-pp4";

    default:
      return "";
  }
};








  /* ================= SEARCH FILTER ================= */
  const filteredData = history.filter((item) => {
    const message = item.message?.toLowerCase() || "";
    const caseId = item.caseId?.toString() || "";

    return (
      message.includes(search.toLowerCase()) ||
      caseId.includes(search)
    );
  });

  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      <div className={`main ${collapsed ? "collapsed" : ""}`}>
        <Topbar />

        <div className="dashboard history-page">

          {/* ================= HEADER ================= */}
          <div className="history-header">
            <div className="history-icon">
              <History size={22} />
            </div>
            <div>
              <h1>Consultation History</h1>
              <p>Audit trail of all case activities</p>
            </div>
          </div>

          {/* ================= SEARCH ================= */}
          <div className="history-search">
            <Search size={16} />
            <input
              placeholder="Search by message or Case ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ================= TOOLBAR ================= */}
          <div className="history-toolbar">

            {/* FILTERS */}
            <div className="history-filters">

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => {
                  setPage(1);
                  setActionFilter(e.target.value);
                }}
              >
                <option value="ALL">All Actions</option>
                <option value="CREATED">Created Cases</option>
                <option value="UPDATED">Updated Cases</option>
                <option value="STATUS_CHANGED">Status Changed</option>
                <option value="DELETED">Deleted Cases</option>
                <option value="GENE_ANALYSIS">Gene Analysis</option>
                <option value="PP4_RESULT">PP4 Result</option>

                <option value="CHAT_CONVERSATION_CREATED">
  Chat Created
</option>

<option value="CHAT_CONVERSATION_RENAMED">
  Chat Renamed
</option>

<option value="CHAT_CONVERSATION_DELETED">
  Chat Deleted
</option>

<option value="CHAT_PP4_CALCULATED">
  Chat PP4 Result
</option>
              </select>

              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => {
                  setPage(1);
                  setTimeFilter(e.target.value);
                }}
              >
                <option value="">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>

              {/* Per Page */}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>

            </div>

            {/* DELETE ALL */}
            <button
              className="delete-history-btn"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete entire history?")) {
                  clearHistory();
                }
              }}
            >
              <Trash2 size={16} />
              Delete Entire History
            </button>

          </div>

          {/* ================= LIST ================= */}
          <div className="history-list">

            {filteredData.length === 0 && (
              <p className="history-empty">
                No history records found.
              </p>
            )}

            {filteredData.map((item) => (
              <div
                key={item.id}
                className="activity-card"
                onClick={() => {
                  if (item.action !== "DELETED") {
                    navigate("/cases", {
                      state: {
                        highlightId: item.mongoCaseId,
                        action: item.action
                      }
                    });
                  }
                }}
              >
                <div className="activity-left">
                 <div className={`activity-icon ${
  item.action?.startsWith("CHAT")
    ? "chat-activity"
    : item.action?.toLowerCase()
}`}>
                    {getIcon(item.action)}
                  </div>

                  <div>
                    {/* <h4 className={`activity-title ${item.action?.toLowerCase()}`}> */}
                      <h4 className={`activity-title ${getActionClass(item.action)}`}>
                      {item.message}
                    </h4>
                   <p>
  {item.action?.startsWith("CHAT")
    ? `Conversation: ${item.caseId}`
    : `Case ID: ${item.caseId}`}
</p>
                  </div>
                </div>

                <div className="activity-right">
                  <span>{item.timestamp}</span>

                  <button
                    className="delete-single-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this history record?")) {
                        deleteSingleHistory(item.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

          </div>

          {/* ================= PAGINATION ================= */}
          {totalPages > 0 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
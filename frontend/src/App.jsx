import { useEffect, useState } from "react";

const STATUS_COLORS = {
  not_started: "#ef4444",   // Red
  in_progress: "#eab308",   // Yellow
  completed: "#22c55e",     // Green
};

const STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function App() {
  const [gridData, setGridData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchGrid = async () => {
    const res = await fetch("http://127.0.0.1:8000/grid");
    const data = await res.json();
    setGridData(data.grid);
    setSummary(data.summary);
  };

  useEffect(() => {
    fetchGrid();
    const interval = setInterval(fetchGrid, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", padding: "32px", fontFamily: "sans-serif", color: "white" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8" }}>
          WorkGuardAI — Excavation Monitor
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "4px" }}>
          Live site grid · Planned depth: {summary?.planned_depth}m
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
          {[
            { label: "Total Cells", value: summary.total_cells, color: "#38bdf8" },
            { label: "Not Started", value: summary.not_started, color: "#ef4444" },
            { label: "In Progress", value: summary.in_progress, color: "#eab308" },
            { label: "Completed", value: summary.completed, color: "#22c55e" },
            { label: "Avg Depth", value: `${summary.average_depth}m`, color: "#a78bfa" },
          ].map((card) => (
            <div key={card.label} style={{
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              padding: "16px 24px",
              minWidth: "120px",
              borderTop: `3px solid ${card.color}`
            }}>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: card.color }}>{card.value}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "10px",
        maxWidth: "500px",
        marginBottom: "32px"
      }}>
        {gridData.map((cell) => (
          <div
            key={cell.cell_id}
            onClick={() => setSelected(cell)}
            style={{
              backgroundColor: STATUS_COLORS[cell.status],
              borderRadius: "8px",
              aspectRatio: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "bold",
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              transition: "transform 0.1s",
              border: selected?.cell_id === cell.cell_id ? "3px solid white" : "3px solid transparent"
            }}
          >
            <div>{cell.cell_id}</div>
            <div>{cell.progress_percent}%</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "3px", backgroundColor: STATUS_COLORS[key] }} />
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Selected Cell Detail */}
      {selected && (
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "320px",
          borderLeft: `4px solid ${STATUS_COLORS[selected.status]}`
        }}>
          <h3 style={{ margin: "0 0 12px", color: "#f1f5f9" }}>Cell {selected.cell_id}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#94a3b8" }}>
            <div>Status: <span style={{ color: STATUS_COLORS[selected.status] }}>{STATUS_LABELS[selected.status]}</span></div>
            <div>Current Depth: <span style={{ color: "white" }}>{selected.current_depth}m</span></div>
            <div>Planned Depth: <span style={{ color: "white" }}>{selected.planned_depth}m</span></div>
            <div>Progress: <span style={{ color: "white" }}>{selected.progress_percent}%</span></div>
            <div>Last Updated: <span style={{ color: "white" }}>{selected.last_updated ?? "Never"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
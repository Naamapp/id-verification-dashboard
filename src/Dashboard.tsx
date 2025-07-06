import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [rejectionReasonMap, setRejectionReasonMap] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("id_upload_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      setRequests([]);
    } else {
      console.log("Fetched data:", data);
      setRequests(data || []);
    }
    setLoading(false);
  }

  async function approveRequest(id: string) {
    const { error } = await supabase
      .from("id_upload_requests")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", id);

    if (error) {
      console.error("Error approving request:", error);
    } else {
      fetchData();
    }
  }

  async function rejectRequest(id: string) {
    const reason = rejectionReasonMap[id]?.trim() || "No reason provided";
    const { error } = await supabase
      .from("id_upload_requests")
      .update({ status: "rejected", rejection_reason: reason })
      .eq("id", id);

    if (error) {
      console.error("Error rejecting request:", error);
    } else {
      fetchData();
    }
  }

  function getImageUrl(path: string) {
    return path
      ? `${supabaseUrl}/storage/v1/object/public/id-uploads/${path}`
      : "https://via.placeholder.com/150?text=No+Image";
  }

  const pendingRequests = requests.filter(
    (req) => req.status?.toLowerCase() === "pending"
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "1rem" }}>🧾 ID Verification Portal</h1>

      {loading ? (
        <p>Loading requests...</p>
      ) : pendingRequests.length === 0 ? (
        <p>No pending requests at this time.</p>
      ) : (
        pendingRequests.map((request) => (
          <div key={request.id} style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
          }}>
            <p><strong>User ID:</strong> {request.user_id}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleString()}</p>

            <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
              <div>
                <p><strong>ID Image</strong></p>
                <img src={getImageUrl(request.id_image_path)} alt="ID" width="150" style={{ borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>
              <div>
                <p><strong>Selfie</strong></p>
                <img src={getImageUrl(request.selfie_image_path)} alt="Selfie" width="150" style={{ borderRadius: "6px", border: "1px solid #ccc" }} />
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label><strong>Rejection reason:</strong></label>
              <input
                type="text"
                placeholder="Optional reason"
                value={rejectionReasonMap[request.id] || ""}
                onChange={(e) =>
                  setRejectionReasonMap({
                    ...rejectionReasonMap,
                    [request.id]: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                  borderRadius: "5px",
                  border: "1px solid #bbb"
                }}
              />
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button
                onClick={() => approveRequest(request.id)}
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Approve ✅
              </button>

              <button
                onClick={() => rejectRequest(request.id)}
                style={{
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Reject ❌
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

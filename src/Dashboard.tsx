import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [rejectionReasonMap, setRejectionReasonMap] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("id_upload_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setRequests(data);
    }
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
    const reason = rejectionReasonMap[id] || "No reason provided";
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
    if (!path) return "";
    return `${supabaseUrl}/storage/v1/object/public/id-uploads/${path}`;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>ID Verification Portal 🚦</h1>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests
          .filter((req) => req.status === "pending")
          .map((request) => (
            <div key={request.id} style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "2rem",
              backgroundColor: "#fefefe",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <p><strong>User ID:</strong> {request.user_id}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleString()}</p>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <div>
                  <p><strong>ID Image</strong></p>
                  <img
                    src={getImageUrl(request.id_image_path)}
                    alt="ID"
                    width="150"
                    style={{ borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <p><strong>Selfie</strong></p>
                  <img
                    src={getImageUrl(request.selfie_image_path)}
                    alt="Selfie"
                    width="150"
                    style={{ borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => approveRequest(request.id)}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    marginRight: "1rem",
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
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Reject ❌
                </button>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label><strong>Rejection reason:</strong></label>
                <input
                  type="text"
                  value={rejectionReasonMap[request.id] || ""}
                  onChange={(e) =>
                    setRejectionReasonMap({
                      ...rejectionReasonMap,
                      [request.id]: e.target.value,
                    })
                  }
                  placeholder="Optional reason for rejection"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>
            </div>
          ))
      )}
    </div>
  );
}

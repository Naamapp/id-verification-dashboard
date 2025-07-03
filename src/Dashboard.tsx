import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase.from("id_upload_requests").select("*");
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setRequests(data);
    }
  }

  return (
    <div>
      <h2>Pending ID Verifications</h2>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul>
          {requests.map((request) => (
            <li key={request.id}>
              {request.name} - {request.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

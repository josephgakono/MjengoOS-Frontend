import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronRight,
  Users,
  MessageCircle,
} from "lucide-react";

import { api } from "../../services/api";
import ChatModal from "./ChatModal";

import "../../styles/Messages.css";

export default function DashboardMessages() {
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  async function loadWorkers() {
    setLoading(true);

    try {
      const [jobs, projects, quotations, usersResponse] =
        await Promise.all([
          api.get("jobs/"),
          api.get("projects/"),
          api.get("quotations/"),
          api.get("users/"),
        ]);

      const users = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse.results || [];

      //---------------------------------------
      // Collect WorkerProfile IDs
      //---------------------------------------

      const workerProfileIds = new Set();

      const collect = (value) => {
        if (!value) return;

        if (typeof value === "number") {
          workerProfileIds.add(value);
        } else if (value.id) {
          workerProfileIds.add(value.id);
        }
      };

      (jobs || []).forEach((job) => {
        collect(job.worker);
        collect(job.assigned_worker);
      });

      (projects || []).forEach((project) => {
        collect(project.worker);
        collect(project.contractor);
      });

      (quotations || []).forEach((quotation) => {
        collect(quotation.worker);
      });

      //---------------------------------------
      // Load Worker Profiles
      //---------------------------------------

      const profiles = await Promise.all(
        [...workerProfileIds].map(async (id) => {
          try {
            return await api.get(`workerprofile/${id}/`);
          } catch {
            return null;
          }
        })
      );

      //---------------------------------------
      // Match WorkerProfile -> User
      //---------------------------------------

      const mappedWorkers = profiles
        .filter(Boolean)
        .map((profile) => {
          const user = users.find(
            (u) => u.id === profile.user
          );

          if (!user) return null;

          return {
            id: profile.id,                 // WorkerProfile ID
            userId: user.id,                // User ID (used for messages)

            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,

            profile_picture:
              user.profile_picture || "",

            profession: profile.profession,
          };
        })
        .filter(Boolean);

      //---------------------------------------
      // Remove duplicates by User ID
      //---------------------------------------

      const uniqueWorkers = [];

      const seen = new Set();

      mappedWorkers.forEach((worker) => {
        if (!seen.has(worker.userId)) {
          seen.add(worker.userId);
          uniqueWorkers.push(worker);
        }
      });

      uniqueWorkers.sort((a, b) =>
        a.username.localeCompare(b.username)
      );

      setWorkers(uniqueWorkers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredWorkers = useMemo(() => {
    if (!search.trim()) return workers;

    const value = search.toLowerCase();

    return workers.filter((worker) => {
      const full =
        `${worker.first_name} ${worker.last_name}`.toLowerCase();

      return (
        worker.username.toLowerCase().includes(value) ||
        full.includes(value)
      );
    });
  }, [workers, search]);

  function initials(worker) {
    const first = worker.first_name?.[0] || "";
    const last = worker.last_name?.[0] || "";

    return (first + last || worker.username[0]).toUpperCase();
  }

  function openChat(worker) {
    setSelectedWorker(worker);
    setShowChat(true);
  }

  if (loading) {
    return (
      <div className="messages-loading">
        Loading workers...
      </div>
    );
  }

  return (
    <>
      <div className="messages-page">

        <div className="messages-header">
          <div>
            <h2>Messages</h2>
            <p>Chat with workers you've worked with.</p>
          </div>

          <div className="messages-count">
            <Users size={18} />
            {workers.length}
          </div>
        </div>

        <div className="messages-search">
          <Search size={18} />
          <input
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="workers-list">

          {filteredWorkers.length === 0 && (
            <div className="workers-empty">
              <MessageCircle size={50} />
              <h3>No Workers Found</h3>
              <p>You haven't worked with any workers yet.</p>
            </div>
          )}

          {filteredWorkers.map((worker) => (
            <button
              key={worker.userId}
              className="worker-row"
              onClick={() => openChat(worker)}
            >
              <div className="worker-left">

                {worker.profile_picture ? (
                  <img
                    src={worker.profile_picture}
                    alt=""
                    className="worker-avatar"
                  />
                ) : (
                  <div className="worker-avatar initials">
                    {initials(worker)}
                  </div>
                )}

                <div className="worker-info">
                  <h4>
                    {worker.first_name} {worker.last_name}
                  </h4>

                  <span>@{worker.username}</span>
                </div>
              </div>

              <ChevronRight size={18} />
            </button>
          ))}

        </div>
      </div>

      <ChatModal
        open={showChat}
        worker={selectedWorker}
        onClose={() => {
          setShowChat(false);
          setSelectedWorker(null);
        }}
      />
    </>
  );
}
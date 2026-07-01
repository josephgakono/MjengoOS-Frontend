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
  //------------------------------------------------------
  // State
  //------------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [workers, setWorkers] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedWorker, setSelectedWorker] = useState(null);

  const [showChat, setShowChat] = useState(false);

  //------------------------------------------------------
  // Load Workers
  //------------------------------------------------------

  useEffect(() => {
    loadWorkers();
  }, []);

  async function loadWorkers() {
    setLoading(true);

    try {
      //----------------------------------
      // Fetch related endpoints together
      //----------------------------------

      const [jobs, projects, quotations] = await Promise.all([
        api.get("jobs/"),
        api.get("projects/"),
        api.get("quotations/"),
      ]);

      //----------------------------------
      // Collect worker ids
      //----------------------------------

      const workerIds = new Set();

      const collectWorker = (worker) => {
        if (!worker) return;

        if (typeof worker === "number") {
          workerIds.add(worker);
        } else if (worker.id) {
          workerIds.add(worker.id);
        }
      };

      (jobs || []).forEach((job) => {
        collectWorker(job.worker);
        collectWorker(job.assigned_worker);
      });

      (projects || []).forEach((project) => {
        collectWorker(project.worker);
        collectWorker(project.contractor);
      });

      (quotations || []).forEach((quotation) => {
        collectWorker(quotation.worker);
      });

      //----------------------------------
      // Fetch every worker profile
      //----------------------------------

      const profiles = await Promise.all(
        [...workerIds].map(async (id) => {
          try {
            return await api.get(`workerprofile/${id}/`);
          } catch {
            return null;
          }
        }),
      );

      //----------------------------------
      // Clean Data
      //----------------------------------

      const list = profiles
        .filter(Boolean)
        .map((profile) => ({
          id: profile.id,
          workerId: profile.user?.id,
          username: profile.user?.username,
          first_name: profile.user?.first_name,
          last_name: profile.user?.last_name,
          profile_picture:
            profile.user?.profile_picture || "",
          profession: profile.profession,
        }));

      list.sort((a, b) =>
        (a.username || "").localeCompare(b.username || ""),
      );

      setWorkers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------------
  // Filter
  //------------------------------------------------------

  const filteredWorkers = useMemo(() => {
    if (!search.trim()) return workers;

    const value = search.toLowerCase();

    return workers.filter((worker) => {
      const full =
        `${worker.first_name} ${worker.last_name}`.toLowerCase();

      return (
        worker.username?.toLowerCase().includes(value) ||
        full.includes(value)
      );
    });
  }, [workers, search]);

  //------------------------------------------------------
  // Avatar
  //------------------------------------------------------

  function initials(worker) {
    const first = worker.first_name?.charAt(0) || "";
    const last = worker.last_name?.charAt(0) || "";

    if (first || last) {
      return `${first}${last}`.toUpperCase();
    }

    return worker.username?.charAt(0).toUpperCase();
  }

  //------------------------------------------------------
  // Open Chat
  //------------------------------------------------------

  function openChat(worker) {
    setSelectedWorker(worker);
    setShowChat(true);
  }

  //------------------------------------------------------
  // Loading
  //------------------------------------------------------

  if (loading) {
    return (
      <div className="messages-loading">
        Loading workers...
      </div>
    );
  }

  //------------------------------------------------------
  // JSX
  //------------------------------------------------------

  return (
    <>
      <div className="messages-page">

        {/* Header */}

        <div className="messages-header">
          <div>
            <h2>Messages</h2>

            <p>
              Chat with workers you've worked with.
            </p>
          </div>

          <div className="messages-count">
            <Users size={18} />

            {workers.length}
          </div>
        </div>

        {/* Search */}

        <div className="messages-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Worker List */}

        <div className="workers-list">

          {filteredWorkers.length === 0 && (
            <div className="workers-empty">

              <MessageCircle size={52} />

              <h3>No Workers Found</h3>

              <p>
                You haven't started a project with any
                worker yet.
              </p>

            </div>
          )}

          {filteredWorkers.map((worker) => (
            <button
              key={worker.id}
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

                  <span>
                    @{worker.username}
                  </span>

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
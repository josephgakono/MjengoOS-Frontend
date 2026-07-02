import { useEffect, useMemo, useState } from "react";
import { Search, ChevronRight, Users, MessageCircle } from "lucide-react";

import { api } from "../../services/api";
import ChatModal from "./ChatModal";

import "../../styles/Messages.css";

export default function DashboardMessages() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isCustomer = currentUser?.user_type === "customer";

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {
    setLoading(true);

    try {
      //---------------------------------------
      // CUSTOMER DASHBOARD
      //---------------------------------------

      if (isCustomer) {
        const [jobs, projects, quotations, usersResponse] = await Promise.all([
          api.get("jobs/"),
          api.get("projects/"),
          api.get("quotations/"),
          api.get("users/"),
        ]);

        const users = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse.results || [];

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

        const profiles = await Promise.all(
          [...workerProfileIds].map(async (id) => {
            try {
              return await api.get(`workerprofile/${id}/`);
            } catch {
              return null;
            }
          }),
        );

        const mapped = profiles
          .filter(Boolean)
          .map((profile) => {
            const user = users.find((u) => u.id === profile.user);

            if (!user) return null;

            return {
              userId: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              profile_picture: user.profile_picture || "",
              profession: profile.profession,
            };
          })
          .filter(Boolean);

        const unique = [];
        const seen = new Set();

        mapped.forEach((person) => {
          if (!seen.has(person.userId)) {
            seen.add(person.userId);
            unique.push(person);
          }
        });

        unique.sort((a, b) => a.username.localeCompare(b.username));

        setParticipants(unique);
      }

      //---------------------------------------
      // WORKER DASHBOARD
      //---------------------------------------
      else {
        // Logged in worker profile
        const workerProfileResponse = await api.get("workerprofile/");

        const workerProfile = Array.isArray(workerProfileResponse)
          ? workerProfileResponse[0]
          : workerProfileResponse;

        //---------------------------------------
        // Load quotations + jobs
        //---------------------------------------

        const [quotationResponse, jobsResponse] = await Promise.all([
          api.get("quotations/"),
          api.get("jobs/"),
        ]);

        const quotations = Array.isArray(quotationResponse)
          ? quotationResponse
          : quotationResponse.results || [];

        const jobs = Array.isArray(jobsResponse)
          ? jobsResponse
          : jobsResponse.results || [];

        //---------------------------------------
        // My quotations
        //---------------------------------------

        const myQuotations = quotations.filter(
          (q) => Number(q.worker) === Number(workerProfile.id),
        );

        //---------------------------------------
        // Job IDs
        //---------------------------------------

        const jobIds = myQuotations.map((q) => q.job);

        //---------------------------------------
        // Customer USER IDs
        //---------------------------------------

        const customerUserIds = [
          ...new Set(
            jobs
              .filter((job) => jobIds.includes(job.id))
              .map((job) => job.customer),
          ),
        ];

        //---------------------------------------
        // Load Users
        //---------------------------------------

        const customers = await Promise.all(
          customerUserIds.map(async (id) => {
            try {
              return await api.get(`users/${id}/`);
            } catch {
              return null;
            }
          }),
        );

        //---------------------------------------
        // Map participants
        //---------------------------------------

        const mapped = customers.filter(Boolean).map((user) => ({
          userId: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_picture: user.profile_picture || "",
        }));

        //---------------------------------------
        // Remove duplicates
        //---------------------------------------

        const unique = [];
        const seen = new Set();

        mapped.forEach((person) => {
          if (!seen.has(person.userId)) {
            seen.add(person.userId);
            unique.push(person);
          }
        });

        unique.sort((a, b) => a.username.localeCompare(b.username));

        setParticipants(unique);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //---------------------------------------
  // Search
  //---------------------------------------

  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants;

    const value = search.toLowerCase();

    return participants.filter((person) => {
      const full = `${person.first_name} ${person.last_name}`.toLowerCase();

      return (
        person.username.toLowerCase().includes(value) || full.includes(value)
      );
    });
  }, [participants, search]);

  //---------------------------------------
  // Helpers
  //---------------------------------------

  function initials(person) {
    const first = person.first_name?.[0] || "";
    const last = person.last_name?.[0] || "";

    return (first + last || person.username?.[0] || "U").toUpperCase();
  }

  function openChat(person) {
    setSelectedParticipant(person);
    setShowChat(true);
  }

  //---------------------------------------
  // Loading
  //---------------------------------------

  if (loading) {
    return (
      <div className="messages-loading">
        Loading {isCustomer ? "workers" : "customers"}...
      </div>
    );
  }

  //---------------------------------------
  // JSX
  //---------------------------------------

  return (
    <>
      <div className="messages-page">
        <div className="messages-header">
          <div>
            <h2>Messages</h2>

            <p>
              Chat with {isCustomer ? "workers" : "customers"} you've worked
              with.
            </p>
          </div>

          <div className="messages-count">
            <Users size={18} />
            {participants.length}
          </div>
        </div>

        <div className="messages-search">
          <Search size={18} />

          <input
            placeholder={`Search ${isCustomer ? "workers" : "customers"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="workers-list">
          {filteredParticipants.length === 0 && (
            <div className="workers-empty">
              <MessageCircle size={50} />

              <h3>No {isCustomer ? "Workers" : "Customers"} Found</h3>

              <p>
                You haven't worked with any{" "}
                {isCustomer ? "workers" : "customers"} yet.
              </p>
            </div>
          )}

          {filteredParticipants.map((person) => (
            <button
              key={person.userId}
              className="worker-row"
              onClick={() => openChat(person)}
            >
              <div className="worker-left">
                {person.profile_picture ? (
                  <img
                    src={person.profile_picture}
                    alt=""
                    className="worker-avatar"
                  />
                ) : (
                  <div className="worker-avatar initials">
                    {initials(person)}
                  </div>
                )}

                <div className="worker-info">
                  <h4>
                    {person.first_name} {person.last_name}
                  </h4>

                  <span>@{person.username}</span>
                </div>
              </div>

              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </div>

      <ChatModal
        open={showChat}
        participant={selectedParticipant}
        onClose={() => {
          setShowChat(false);
          setSelectedParticipant(null);
        }}
      />
    </>
  );
}

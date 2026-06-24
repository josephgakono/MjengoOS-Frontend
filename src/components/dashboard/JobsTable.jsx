import { useEffect, useState } from "react"
import { api } from "../../services/api"

export default function JobsTable() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchJobs() {
    try {
      const data = await api.get("jobs/")
      setJobs(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  function statusClass(status) {
    switch (status) {
      case "open":
        return "badge open"
      case "quoted":
        return "badge quoted"
      case "assigned":
        return "badge assigned"
      case "in_progress":
        return "badge progress"
      case "completed":
        return "badge completed"
      default:
        return "badge"
    }
  }

  if (loading) {
    return <p className="loading">Loading jobs...</p>
  }

  return (
    <div className="table-wrapper">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Budget</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>KES {Number(job.budget).toLocaleString()}</td>

                <td>
                  <span className={statusClass(job.status)}>{job.status}</span>
                </td>

                <td>{job.created_at}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No jobs available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}


import { useEffect, useState } from "react"
import { api } from "../../services/api"
import "../../styles/activityTimeline.css"

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([])

  async function loadActivity() {
    try {
      const [notifications, progress, jobs, quotations] = await Promise.all([
        api.get("notifications/"),
        api.get("progress-updates/"),
        api.get("jobs/"),
        
        api.get("quotations/"),
      ])

      const notificationItems =
        notifications?.map((item) => ({
          id: `n-${item.id}`,
          type: "notification",
          title: item.title,
          description: item.message,
          date: item.created_at || "",
        })) || []

      const progressItems =
        progress?.map((item) => ({
          id: `p-${item.id}`,
          type: "progress",
          title: "Project Update",
          description: item.description,
          date: item.created_at,
        })) || []

      const jobItems =
        jobs?.map((job) => ({
          id: `j-${job.id}`,
          type: "job",
          title: "Job Created",
          description: `${job.title} was posted in ${job.location}`,
          date: job.created_at,
        })) || []

      const acceptedQuotationItems =
        quotations
          ?.filter((quotation) => quotation.status === "accepted")
          .map((quotation) => ({
            id: `q-${quotation.id}`,
            type: "quotation",
            title: "Quotation Accepted",
            description: `Accepted quotation of KES ${Number(
              quotation.amount
            ).toLocaleString()}`,
            date: quotation.created_at,
          })) || []

      const combined = [
        ...notificationItems,
        ...progressItems,
        ...jobItems,
        ...acceptedQuotationItems,
      ]

      combined.sort((a, b) => new Date(b.date) - new Date(a.date))

      setActivities(combined)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadActivity()
  }, [])

  return (
    <div className="timeline timeline-wrapper">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="timeline-item">


            <div className="timeline-content">
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>

              {activity.date && <span>{activity.date}</span>}
            </div>
          </div>
        ))
      ) : (
        <p>No recent activity</p>
      )}
    </div>
  )
}


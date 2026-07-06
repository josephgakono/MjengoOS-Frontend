import { useEffect, useState } from "react"
import { api } from "../../services/api"

export default function StatsCards() {
  const [stats, setStats] = useState({
    jobs: 0,
    quotations: 0,
    projects: 0,
    escrowHeld: 0,
    released: 0,
  })

  async function fetchStats() {
    try {
      const [jobs, quotations, projects, payments] = await Promise.all([
        api.get("jobs/"),
        api.get("quotations/"),
        api.get("projects/"),
        api.get("payments/"),
      ])

      const escrowHeld =
        payments
          ?.filter((p) => p.escrow_status === "held")
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0

      const released =
        payments
          ?.filter((p) => p.escrow_status === "released")
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0

      setStats({
        jobs: jobs?.length || 0,
        projects: projects?.length || 0,
        escrowHeld,
        released,
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const cards = [
    { title: "Active Jobs", value: stats.jobs },
    { title: "Active Projects", value: stats.projects },
    {
      title: "Escrow Held",
      value: `KES ${stats.escrowHeld.toLocaleString()}`,
    },
    {
      title: "Funds Released",
      value: `KES ${stats.released.toLocaleString()}`,
    },
  ]

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.title}>
          <h4>{card.title}</h4>
          <h2>{card.value}</h2>
        </div>
      ))}
    </section>
  )
}


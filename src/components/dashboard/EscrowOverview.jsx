import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function EscrowOverview() {
  const [data, setData] = useState({
    held: 0,
    released: 0,
    projects: 0,
  });

  useEffect(() => {
    loadEscrow();
  }, []);

  async function loadEscrow() {
    try {
      const payments = await api.get("payments/");

      const held =
        payments
          ?.filter((p) => p.escrow_status === "held")
          .reduce(
            (sum, p) => sum + Number(p.amount),
            0
          ) || 0;

      const released =
        payments
          ?.filter(
            (p) => p.escrow_status === "released"
          )
          .reduce(
            (sum, p) => sum + Number(p.amount),
            0
          ) || 0;

      const activeProjects =
        payments?.filter(
          (p) => p.escrow_status === "held"
        ).length || 0;

      setData({
        held,
        released,
        projects: activeProjects,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="escrow-grid">
      <div className="escrow-card">
        <h5>Total Held</h5>

        <h2>
          KES {data.held.toLocaleString()}
        </h2>

        <span>
          Across {data.projects} active projects
        </span>
      </div>

      <div className="escrow-card">
        <h5>Total Released</h5>

        <h2>
          KES {data.released.toLocaleString()}
        </h2>

        <span>
          Successfully paid to workers
        </span>
      </div>
    </div>
  );
}
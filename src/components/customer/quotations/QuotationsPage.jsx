import { useEffect, useState } from "react";
import { api } from "../../../services/api";

import QuotationSummary from "./QuotationSummary";
import QuotationReview from "./QuotationReview";

import "../../../styles/dashboard.css";

export default function QuotationsPage() {
  const [jobs, setJobs] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);

      const jobsData = await api.get("jobs/");
      const quotationsData = await api.get("quotations/");

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setQuotations(
        Array.isArray(quotationsData)
          ? quotationsData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load quotations page",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="quotation-loading">
        Loading quotations...
      </div>
    );
  }

  return (
    <div className="quotations-page">

      {/* REVIEW QUOTATIONS */}
      <QuotationReview
        jobs={jobs}
        quotations={quotations}
        refreshData={fetchData}
      />

      {/* SUMMARY TABLE */}
      <QuotationSummary
        jobs={jobs}
        quotations={quotations}
      />

    </div>
  );
}
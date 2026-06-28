import { useEffect, useState } from "react";
import { api } from "../../../services/api";

import QuotationSummary from "./QuotationSummary";
import QuotationReview from "./QuotationReview";
import { buildQuotationData } from "../../../utils/quotationHelpers";

import "../../../styles/dashboard.css";

export default function QuotationsPage() {
  const [jobs, setJobs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [fullQuotations, setFullQuotations] = useState([]);

  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);

      const jobsData = await api.get("jobs/");
      const quotationsData = await api.get("quotations/");

      const jobsArray = Array.isArray(jobsData) ? jobsData : [];

      const quotationsArray = Array.isArray(quotationsData)
        ? quotationsData
        : [];

      setJobs(jobsArray);
      setQuotations(quotationsArray);

      const merged = await buildQuotationData(quotationsArray, jobsArray);

      setFullQuotations(merged);
    } catch (error) {
      console.error("Failed to load quotations page", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="quotation-loading">Loading quotations...</div>;
  }

  return (
    <div className="quotations-page">
      {/* REVIEW QUOTATIONS */}
      <QuotationReview
        jobs={jobs}
        quotations={fullQuotations}
        refreshData={fetchData}
      />

      {/* SUMMARY TABLE */}
      <QuotationSummary jobs={jobs} quotations={quotations} />
    </div>
  );
}

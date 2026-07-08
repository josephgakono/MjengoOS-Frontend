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

      // Ideally backend should filter by authenticated customer.
      // For now, we filter client-side to prevent cross-customer leakage.
      const user = JSON.parse(localStorage.getItem("user"));
      const customerUsername = user?.username;

      const jobsData = await api.get("jobs/");
      const quotationsData = await api.get("quotations/");

      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      const quotationsArray = Array.isArray(quotationsData)
        ? quotationsData
        : [];

      // Backend already scopes /jobs/ and /quotations/ by request.user.
      // Do not re-filter by username here because /jobs/ uses JobSerializer(fields='__all__')
      // where `customer` is typically a numeric user id.
      const myJobs = jobsArray;

      // Group quotations by job id.
      const myJobIds = new Set(myJobs.map((j) => j.id));
      const myQuotations = quotationsArray.filter((q) => {
        if (myJobIds.has(q.job)) return true;
        if (q.job?.id && myJobIds.has(q.job.id)) return true;
        return false;
      });

      setJobs(myJobs);
      setQuotations(myQuotations);

      const merged = await buildQuotationData(myQuotations, myJobs);

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

      {/* SUMMARY TABLE */}
      <QuotationSummary jobs={jobs} quotations={quotations} />

      <QuotationReview
        jobs={jobs}
        quotations={fullQuotations}
        refreshData={fetchData}
      />
    </div>
  );
}

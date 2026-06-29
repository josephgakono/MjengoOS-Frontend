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
      const quotationsArray = Array.isArray(quotationsData) ? quotationsData : [];

      // Backend already scopes /jobs/ and /quotations/ by request.user.
      // We still keep a safe client-side filter, but now it's username-based.
      const myJobs = customerUsername
        ? jobsArray.filter((j) => {
            // Different serializers may expose customer as:
            // - j.customer_username (preferred)
            // - j.customer (username string)
            // - j.customer.username (nested)
            return (
              j.customer_username === customerUsername ||
              j.customer === customerUsername ||
              j.customer?.username === customerUsername
            );
          })
        : jobsArray;

      // Quotations: keep those related to our jobs.
      // Quotation serializer may expose quotation.job as:
      // - a job id (number)
      // - a job object
      // - a job uuid/string
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

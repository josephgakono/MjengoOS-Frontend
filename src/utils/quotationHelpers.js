import { api } from "../services/api";

export async function buildQuotationData(quotations = [], jobs = []) {
  try {
    //--------------------------------------------------
    // Fetch workers and users
    //--------------------------------------------------

    const [workers, users] = await Promise.all([
      api.get("workerprofile/"),
      api.get("users/"),
    ]);

    //--------------------------------------------------
    // Create lookup maps
    //--------------------------------------------------

    const jobsMap = {};

    jobs.forEach((job) => {
      jobsMap[job.id] = job;
    });

    const usersMap = {};

    (users || []).forEach((user) => {
      usersMap[user.id] = user;
    });

    const workersMap = {};

    (workers || []).forEach((worker) => {
      workersMap[worker.id] = {
        ...worker,
        user: usersMap[worker.user] || null,
      };
    });

    //--------------------------------------------------
    // Merge quotation + job + worker
    //--------------------------------------------------

    return (quotations || []).map((quotation) => ({
      ...quotation,

      job: jobsMap[quotation.job] || null,

      worker: workersMap[quotation.worker] || {
        id: quotation.worker,
        profession: "Unknown Worker",
        experience_years: 0,
        location: "Unknown",
        verified: false,
        hourly_rate: 0,
        average_rating: 0,
        user: {
          username: "Unknown Worker",
          profile_picture: null,
        },
      },
    }));
  } catch (error) {
    console.error("Failed to build quotation data:", error);

    return quotations.map((quotation) => ({
      ...quotation,
      job: jobs.find((j) => j.id === quotation.job) || null,
    }));
  }
}

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
      // backend may return either user id references or expanded objects
      if (user && user.id != null) usersMap[user.id] = user;
      if (user && user.username) usersMap[user.username] = user;
    });

    const workersMap = {};

    (workers || []).forEach((worker) => {
      const resolvedUser =
        usersMap[worker.user] ||
        usersMap[worker.user?.id] ||
        usersMap[worker.user?.username] ||
        null;

      // also index by both worker id and worker.user username if needed
      workersMap[worker.id] = {
        ...worker,
        user: resolvedUser,
      };

      if (resolvedUser?.username) {
        workersMap[resolvedUser.username] = {
          ...worker,
          user: resolvedUser,
        };
      }
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

import { api } from "../services/api";

export async function buildQuotationData(
  quotations,
  jobs
) {
  try {
    // Get every worker profile
    const workers = await api.get("worker-profiles/");

    // Get every user
    const users = await api.get("users/");

    //--------------------------------------------------
    // Create lookup maps
    //--------------------------------------------------

    const jobsMap = {};

    jobs.forEach((job) => {
      jobsMap[job.id] = job;
    });

    const usersMap = {};

    users.forEach((user) => {
      usersMap[user.id] = user;
    });

    const workersMap = {};

    workers.forEach((worker) => {
      workersMap[worker.id] = {
        ...worker,
        user: usersMap[worker.user],
      };
    });

    //--------------------------------------------------
    // Merge everything
    //--------------------------------------------------

    return quotations.map((quotation) => ({
      ...quotation,
      job: jobsMap[quotation.job],
      worker: workersMap[quotation.worker],
    }));
  } catch (error) {
    console.error(error);
    return quotations;
  }
}
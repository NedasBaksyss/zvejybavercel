import User from "../models/user.js";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function deleteInactiveGuests() {
  const cutoff = new Date(Date.now() - ONE_WEEK_MS);

  try {
    const result = await User.deleteMany({
      role: "guest",
      $or: [
        { lastLogin: { $lt: cutoff } },
        {
          lastLogin: { $exists: false },
          createdAt: { $lt: cutoff },
        },
      ],
    });

    if (result.deletedCount > 0) {
      console.log(
        `Guest cleanup: deleted ${result.deletedCount} inactive guest account(s).`
      );
    } else {
      console.log("Guest cleanup: no inactive guest accounts found.");
    }

    return result.deletedCount;
  } catch (error) {
    console.error("GUEST CLEANUP ERROR:", error);
    return 0;
  }
}

export function startGuestCleanup() {
  // Run once when the server starts.
  deleteInactiveGuests();

  // Then check once every 24 hours.
  const interval = 24 * 60 * 60 * 1000;

  return setInterval(() => {
    deleteInactiveGuests();
  }, interval);
}
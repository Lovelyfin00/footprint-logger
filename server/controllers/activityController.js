const Activity = require("../models/Activity");
const {
  startOfWeek,
  endOfWeek,
  subWeeks,
} = require("../util/dateHelpers");

const logActivity = async (req, res) => {
  try {
    const { label, category, co2kg, note, loggedAt } = req.body;

    if (!label || !category || co2kg == null) {
      return res.status(400).json({ message: "Label, category and CO₂ value are required." });
    }

    const activity = await Activity.create({
      user: req.user._id,
      label,
      category,
      co2kg,
      note,
      loggedAt: loggedAt || Date.now(),
    });

    res.status(201).json({ activity });
  } catch {
    res.status(500).json({ message: "Could not save activity." });
  }
}

const getActivities = async (req, res) => {
  try {
    const { category, from, to } = req.query;

    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (from || to) {
      filter.loggedAt = {};
      if (from) filter.loggedAt.$gte = new Date(from);
      if (to) filter.loggedAt.$lte = new Date(to);
    }

    const activities = await Activity.find(filter).sort({ loggedAt: -1 });
    res.json({ activities });
  } catch {
    res.status(500).json({ message: "Could not fetch activities." });
  }
}

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    res.json({ message: "Activity removed." });
  } catch {
    res.status(500).json({ message: "Could not delete activity." });
  }
}

/*
  Calculates how many consecutive days the user has logged at least one activity,
  counting back from today. Returns 0 if nothing logged today or yesterday.
*/
const calculateStreak = (activities) => {
  if (!activities.length) return 0;

  const loggedDays = new Set(
    activities.map((a) => {
      const d = new Date(a.loggedAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  let streak = 0;
  const cursor = new Date();

  /* Walk backwards day by day until we find a gap */
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (loggedDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));

    /* Fetch last 60 days of activity for streak calculation alongside the rest */
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [allActivities, thisWeek, lastWeek, communityWeek, recentForStreak] = await Promise.all([
      Activity.find({ user: userId }).sort({ loggedAt: -1 }).limit(10),
      Activity.find({ user: userId, loggedAt: { $gte: weekStart, $lte: weekEnd } }),
      Activity.find({ user: userId, loggedAt: { $gte: lastWeekStart, $lte: lastWeekEnd } }),
      Activity.aggregate([
        { $match: { loggedAt: { $gte: weekStart, $lte: weekEnd } } },
        { $group: { _id: null, total: { $sum: "$co2kg" }, count: { $sum: 1 } } },
      ]),
      Activity.find({ user: userId, loggedAt: { $gte: sixtyDaysAgo } }).select("loggedAt"),
    ]);

    const thisWeekTotal = thisWeek.reduce((s, a) => s + a.co2kg, 0);
    const lastWeekTotal = lastWeek.reduce((s, a) => s + a.co2kg, 0);

    const byCategory = thisWeek.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.co2kg;
      return acc;
    }, {});

    const communityAvg =
      communityWeek.length && communityWeek[0].count > 0
        ? communityWeek[0].total / communityWeek[0].count
        : null;

    const streak = calculateStreak(recentForStreak);

    res.json({
      recentLogs: allActivities,
      streak,
      thisWeek: {
        total: +thisWeekTotal.toFixed(2),
        byCategory,
        goal: req.user.weeklyGoal,
        progressPercent: req.user.weeklyGoal
          ? Math.min(100, Math.round((thisWeekTotal / req.user.weeklyGoal) * 100))
          : null,
      },
      lastWeek: {
        total: +lastWeekTotal.toFixed(2),
      },
      communityAvgThisWeek: communityAvg ? +communityAvg.toFixed(2) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load dashboard." });
  }
}

const getInsights = async (req, res) => {
  try {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const activities = await Activity.find({
      user: req.user._id,
      loggedAt: { $gte: fourWeeksAgo },
    });

    if (!activities.length) {
      return res.json({ insights: [], topCategory: null });
    }

    const byCategory = activities.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = { total: 0, count: 0 };
      acc[a.category].total += a.co2kg;
      acc[a.category].count += 1;
      return acc;
    }, {});

    const sorted = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
    const topCategory = sorted[0]?.[0] || null;

    const tips = {
      transport: [
        "Try walking or cycling for trips under 3 km, it saves roughly 0.2 kg CO₂ per journey.",
        "Combining errands into one trip cuts fuel use more than people realise.",
        "Public transport emits up to 4x less CO₂ than driving solo.",
      ],
      food: [
        "Swapping beef for chicken once a week saves around 2 kg CO₂.",
        "Reducing food waste is one of the highest-impact changes you can make.",
        "Plant-based meals on weekdays can cut your food footprint by a third.",
      ],
      energy: [
        "Turning the thermostat down by 1°C cuts heating bills and emissions by about 10%.",
        "Unplugging devices on standby saves up to 0.5 kg CO₂ per day.",
        "Washing clothes at 30°C instead of 60°C uses half the energy.",
      ],
    };

    res.json({
      topCategory,
      byCategory,
      tips: tips[topCategory] || [],
      totalLast28Days: +activities.reduce((s, a) => s + a.co2kg, 0).toFixed(2),
    });
  } catch {
    res.status(500).json({ message: "Could not generate insights." });
  }
}


module.exports = {
  logActivity,
  getActivities,
  deleteActivity,
  calculateStreak,
  getDashboard,
  getInsights,
};
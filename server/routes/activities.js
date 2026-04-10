const express = require("express");
const router = express.Router();

const {
  logActivity,
  getActivities,
  deleteActivity,
  getDashboard,
  getInsights,
} = require("../controllers/activityController");

const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/insights", getInsights);
router.get("/", getActivities);
router.post("/", logActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
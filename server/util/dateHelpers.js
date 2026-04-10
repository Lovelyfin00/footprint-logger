function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function subWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() - weeks * 7);
  return d;
}

module.exports = {
  startOfWeek,
  endOfWeek,
  subWeeks,
};
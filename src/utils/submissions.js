export function buildSubmissionMap(submissions) {
    const map = new Map();
    for (const sub of submissions) {
        const pid = sub.problem_id;
        if (!map.has(pid)) {
            map.set(pid, sub.result === "AC");
        } else if (sub.result === "AC") {
            map.set(pid, true); // ACで上書き（一度ACならAC）
        }
    }
    return map;
}

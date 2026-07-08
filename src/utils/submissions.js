/**
 * 提出データから、問題IDごとのAC有無のMapを作成
 * @param {Array} submissions - fetchAllUserSubmissionsの戻り値
 * @returns {Map<string, boolean>} problem_id → isAccepted
 */
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

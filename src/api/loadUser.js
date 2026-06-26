export async function fetchUserRate(username) {
    const url = `/api/atcoder/users/${encodeURIComponent(username)}/history/json?contestType=algo/json`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
    }
    const data = await res.json();
    if (!data.length) {
        return null;
    }
    const latest = data[data.length - 1];
    return latest.NewRating;
}

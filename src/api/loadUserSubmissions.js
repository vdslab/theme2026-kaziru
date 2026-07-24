export async function fetchAllUserSubmissions(username) {
  let allSubmissions = [];
  let fromSecond = 0;

  while (true) {
    const url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(username)}&from_second=${fromSecond}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch submissions: ${res.status}`);
    }
    const data = await res.json();

    if (data.length === 0) break;

    allSubmissions = allSubmissions.concat(data);

    if (data.length < 500) break;

    // 最後の提出の epoch_second を次の開始位置に
    fromSecond = data[data.length - 1].epoch_second;
  }

  return allSubmissions;
}

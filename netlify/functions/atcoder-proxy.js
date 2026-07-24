exports.handler = async (event) => {
  const pathParts = event.path.split("/");
  const usersIndex = pathParts.indexOf("users");
  const username = usersIndex !== -1 ? pathParts[usersIndex + 1] : null;

  if (!username) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "ユーザー名が指定されていません" }),
    };
  }

  const url = `https://atcoder.jp/users/${encodeURIComponent(username)}/history/json?contestType=algo/json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: `AtCoder API returned ${response.status}`,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

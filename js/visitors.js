import { makeWebRequest } from "/Illegal_Services/js/makeWebRequest.js";

document.addEventListener("DOMContentLoaded", async function () {
  const htmlVisitorsCounterText = document.getElementById("visitors-counter-text");

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers,
    mode: "cors",
  };

  const response = await makeWebRequest("https://illegal-services.com/counter", requestOptions);
  if (response.ok) {
    const jsonCountersResponse = await response.json();
    const totalVisitors = jsonCountersResponse.total_visitors;
    const todayVisitors = jsonCountersResponse.today_visitors;

    htmlVisitorsCounterText.innerHTML = `Total visitors since 14/01/24:<br>[${totalVisitors}]<br>Today's visitors:<br>[${todayVisitors}]`;
  }
});

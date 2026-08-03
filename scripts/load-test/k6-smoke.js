import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://preppylosers.com";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const pages = ["/", "/shop", "/privacy-policy", "/api/health"];

  for (const path of pages) {
    const res = http.get(`${BASE_URL}${path}`);
    check(res, {
      [`${path} status 200 or 503`]: (r) => r.status === 200 || r.status === 503,
    });
  }

  sleep(1);
}

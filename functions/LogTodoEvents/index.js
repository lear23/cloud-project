export const handler = async (event) => {
  console.log("\n");
  console.log("════════════════════════════════════════════════════════════");
  console.log("🎉 EVENT RECEIVED IN EVENTBRIDGE! 🎉");
  console.log("════════════════════════════════════════════════════════════");
  console.log("\n📌 EVENT INFORMATION:");
  console.log("  ├─ Type: " + event["detail-type"]);
  console.log("  ├─ Source: " + event.source);
  console.log("  ├─ Time: " + event.time);
  console.log("  └─ Account: " + event.account);
  console.log("\n📦 FULL DETAILS:");
  console.log(JSON.stringify(event.detail, null, 2));
  console.log("\n════════════════════════════════════════════════════════════\n");

  return { statusCode: 200, message: "✅ Event processed successfully" };
};
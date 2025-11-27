// functions/PostTodo/index.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamo = DynamoDBDocumentClient.from(client);
const eventBridge = new EventBridgeClient({ region: "eu-north-1" });

export const handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Method Not Allowed" }) 
    };
  }

  const body = JSON.parse(event.body || "{}");
  if (!body.text) {
    return { 
      statusCode: 400, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing required field 'text'" }) 
    };
  }

  const id = randomUUID();
  const item = { pk: id, text: body.text, createdAt: Date.now() };

  try {
    await dynamo.send(new PutCommand({
      TableName: process.env.TODOS_TABLE,
      Item: item,
    }));

   
    await eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: "todo.service",
        DetailType: "TodoCreated",
        Detail: JSON.stringify(item),
      }],
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Todo Created", item }),
    };

  } catch (err) {
    console.error(err);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal Server Error" }) 
    };
  }
};

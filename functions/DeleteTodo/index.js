import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamo = DynamoDBDocumentClient.from(client);
const eventBridge = new EventBridgeClient({ region: "eu-north-1" });

export const handler = async (event) => {

  if (event.httpMethod !== "DELETE") {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Method Not Allowed" }) 
    };
  }

  const id = event.pathParameters?.id;
  if (!id) return { 
    statusCode: 400, 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Missing id in path" }) 
  };

  try {
    await dynamo.send(new DeleteCommand({
      TableName: process.env.TODOS_TABLE,
      Key: { pk: id },
    }));

    await eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: "todo.service",
        DetailType: "TodoDeleted",
        Detail: JSON.stringify({ id }),
      }],
    }));

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Todo deleted" }) 
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

// functions/GetOneTodo/index.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });
const dynamo = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "todos";

export const handler = async (event) => {
  const todoId = event.pathParameters?.id;
  if (!todoId) return { statusCode: 400, body: "Missing id" };

  try {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_NAME, Key: { pk: todoId } }));
    if (!result.Item) return { statusCode: 404, body: "Todo not found" };
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};

import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-west-3" });

export const handler = async (event) => {
  try {
    const expenseId = event.pathParameters?.id;
    if (!expenseId) return { statusCode: 400, body: JSON.stringify({ error: "Expense ID required" }) };

    await client.send(new DeleteItemCommand({
      TableName: process.env.EXPENSES_TABLE || "Expenses",
      Key: { expenseId: { S: expenseId } }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Deleted" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not delete expense" }) };
  }
};

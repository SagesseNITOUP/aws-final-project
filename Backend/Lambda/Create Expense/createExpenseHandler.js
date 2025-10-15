import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-west-3" });

export const handler = async (event) => {
  try {
    const { amount, currency, category, note, date } = JSON.parse(event.body || "{}");

    if (amount === undefined || isNaN(amount)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };

    const expenseId = uuidv4();
    const createdAt = new Date().toISOString();

    await client.send(new PutItemCommand({
      TableName: process.env.EXPENSES_TABLE || "Expenses",
      Item: {
        expenseId: { S: expenseId },
        amount: { N: amount.toString() },
        currency: { S: (currency || "USD").toUpperCase() },
        category: { S: category || "uncategorized" },
        note: { S: note || "" },
        date: { S: date || createdAt },
        createdAt: { S: createdAt }
      }
    }));

    return { statusCode: 201, body: JSON.stringify({ expenseId, amount, currency, category, note, date: date || createdAt, createdAt }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not create expense" }) };
  }
};

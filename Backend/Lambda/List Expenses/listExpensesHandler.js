import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-west-3" });

export const handler = async () => {
  try {
    const data = await client.send(new ScanCommand({ TableName: process.env.EXPENSES_TABLE || "Expenses" }));
    const items = (data.Items || []).map(i => ({
      expenseId: i.expenseId.S,
      amount: parseFloat(i.amount.N),
      currency: i.currency.S,
      category: i.category.S,
      note: i.note.S,
      date: i.date.S,
      createdAt: i.createdAt.S
    }));
    return { statusCode: 200, body: JSON.stringify({ items }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not list expenses" }) };
  }
};

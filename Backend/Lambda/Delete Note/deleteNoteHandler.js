import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "eu-west-3" });

export const handler = async (event) => {
  try {
    const noteId = event.pathParameters?.id;
    if (!noteId) return { statusCode: 400, body: JSON.stringify({ error: "Note ID required" }) };

    await client.send(new DeleteItemCommand({
      TableName: process.env.NOTES_TABLE || "Notes",
      Key: { noteId: { S: noteId } }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Deleted" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not delete note" }) };
  }
};

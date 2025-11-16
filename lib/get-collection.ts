import clientPromise from "@/lib/mongodb";

async function getCollection(name: string) {
  const client = await clientPromise
  // No need to call connect() again, clientPromise already handles connection

  return client.db().collection(name)
}

export default getCollection
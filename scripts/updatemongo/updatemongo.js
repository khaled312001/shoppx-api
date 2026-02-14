const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string
const uri = "mongodb+srv://xappeesoftware:LMph7vvVk1gvgSMU@shopx.3qvsp5z.mongodb.net/";

// Database and collection names
const dbName = "mossodor";
const productCollectionName = "products";
const faqCollectionName = "faqs";

async function updateProductsWithFaqIds() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(dbName);
    const productCollection = db.collection(productCollectionName);
    const faqCollection = db.collection(faqCollectionName);

    // Fetch all FAQs
    const faqs = await faqCollection.find({}, { projection: { _id: 1, product_id: 1 } }).toArray();

    // Group FAQs by product_id
    const faqsByProduct = faqs.reduce((acc, faq) => {
      const productId = faq.product_id.toString();
      if (!acc[productId]) {
        acc[productId] = [];
      }
      acc[productId].push(faq._id);
      return acc;
    }, {});

    // Update products
    let updatedCount = 0;
    for (const [productId, faqIds] of Object.entries(faqsByProduct)) {
      const result = await productCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: { faqs: faqIds } }
      );
      if (result.modifiedCount > 0) updatedCount++;
    }


  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the function
updateProductsWithFaqIds();
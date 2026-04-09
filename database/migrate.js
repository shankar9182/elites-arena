const { MongoClient } = require('mongodb');

// Connection URIs
const localUri = 'mongodb://localhost:27017/elites_arena';
const atlasUri = 'mongodb://girijashankarpasalapudi_db_user:Shankar123143%40@ac-rvneob5-shard-00-00.xhnlcf8.mongodb.net:27017,ac-rvneob5-shard-00-01.xhnlcf8.mongodb.net:27017,ac-rvneob5-shard-00-02.xhnlcf8.mongodb.net:27017/elites_arena?ssl=true&replicaSet=atlas-g4es3o-shard-0&authSource=admin&appName=Cluster0';

async function migrateData() {
    let localClient, atlasClient;
    
    try {
        console.log('[DEBUG] Connecting to Local MongoDB...');
        localClient = await MongoClient.connect(localUri);
        const localDb = localClient.db('elites_arena');
        console.log('[DEBUG] Connected to Local DB.');

        console.log('[DEBUG] Connecting to Atlas MongoDB...');
        atlasClient = await MongoClient.connect(atlasUri);
        const atlasDb = atlasClient.db('elites_arena');
        console.log('[DEBUG] Connected to Atlas DB.');

        // Get list of collections in local db
        const collections = await localDb.listCollections().toArray();
        console.log(`[DEBUG] Found ${collections.length} collections to migrate.`);

        for (let col of collections) {
            const collectionName = col.name;
            console.log(`\n--- Migrating collection: ${collectionName} ---`);
            
            const localCollection = localDb.collection(collectionName);
            const atlasCollection = atlasDb.collection(collectionName);

            // Fetch all documents
            const docs = await localCollection.find({}).toArray();
            console.log(`Found ${docs.length} documents in local DB.`);

            if (docs.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicate _id errors
                await atlasCollection.deleteMany({});
                console.log(`Cleared existing Atlas data for ${collectionName}.`);

                // Insert into Atlas
                await atlasCollection.insertMany(docs);
                console.log(`Successfully inserted ${docs.length} documents into Atlas for ${collectionName}.`);
            } else {
                console.log(`No documents found for ${collectionName}. Skipping insert.`);
            }
        }
        
        console.log('\n✅ Data Migration Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Migration Failed:', error);
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
        console.log('Database connections closed.');
    }
}

migrateData();

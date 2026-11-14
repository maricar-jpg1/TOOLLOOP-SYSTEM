using MongoDB.Driver;

namespace ToolLoop.Api.Data;

public class MongoDBService
{
    private readonly IMongoDatabase _database;

    public MongoDBService(IConfiguration configuration)
    {
        var connectionString =
            configuration["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException(
                "MongoDB connection string is missing."
            );

        var databaseName =
            configuration["MongoDB:DatabaseName"] ?? "toolLoopDb";

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoDatabase Database => _database;
}
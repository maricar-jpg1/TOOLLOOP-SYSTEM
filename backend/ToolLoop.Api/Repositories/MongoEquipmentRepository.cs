
using MongoDB.Bson;
using MongoDB.Driver;
using ToolLoop.Api.Models;

namespace ToolLoop.Api.Repositories;

public class MongoEquipmentRepository : IEquipmentRepository
{
    private readonly IMongoCollection<Equipment> _collection;
    private readonly IMongoDatabase _database;

    public MongoEquipmentRepository(IConfiguration configuration)
    {
        var connectionString =
            configuration["MongoDB:ConnectionString"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "MongoDB connection string is missing."
            );
        }

        var client = new MongoClient(connectionString);

        _database = client.GetDatabase("toolLoopDb");

        _collection =
            _database.GetCollection<Equipment>("equipment");
    }

    public async Task<List<Equipment>> GetAllAsync()
    {
        return await _collection
            .Find(_ => true)
            .ToListAsync();
    }

    public async Task<Equipment?> GetByIdAsync(string id)
    {
        return await _collection
            .Find(item => item.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Equipment> AddAsync(Equipment equipment)
    {
        await _collection.InsertOneAsync(equipment);
        return equipment;
    }

    public async Task<Equipment?> UpdateAsync(
        string id,
        Equipment equipment)
    {
        var result = await _collection.ReplaceOneAsync(
            item => item.Id == id,
            equipment
        );

        return result.MatchedCount > 0 ? equipment : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(
            item => item.Id == id
        );

        return result.DeletedCount > 0;
    }

    public async Task PingAsync()
    {
        await _database.RunCommandAsync<BsonDocument>(
            new BsonDocument("ping", 1)
        );
    }
}
